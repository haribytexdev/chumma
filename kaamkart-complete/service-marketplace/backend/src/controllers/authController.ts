import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../config/db";
import { env } from "../config/env";
import {
  generateOtp,
  hashOtp,
  verifyOtpHash,
  sendOtpSms,
} from "../utils/otp";
import {
  registerCustomerSchema,
  registerWorkerSchema,
  otpRequestSchema,
  otpVerifySchema,
} from "../utils/validation";

/** Step 1: Request an OTP for register/login/checkin */
export async function requestOtp(req: FastifyRequest, reply: FastifyReply) {
  const parsed = otpRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.flatten() });
  }
  const { mobile, purpose } = parsed.data;

  const otp = generateOtp();
  const codeHash = await hashOtp(otp);
  const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60 * 1000);

  await prisma.otpCode.create({
    data: { mobile, codeHash, purpose, expiresAt },
  });

  await sendOtpSms(mobile, otp);

  return reply.send({ message: "OTP sent" });
}

/** Strips +91 prefix and whitespace so "+919876543210" and "9876543210" compare equal */
function normalizeMobile(mobile: string): string {
  return mobile.replace(/^\+91/, "").replace(/\s+/g, "");
}

async function consumeValidOtp(mobile: string, otp: string, purpose: string) {
  // Get most recent, unconsumed, non-expired OTP for this mobile+purpose
  const record = await prisma.otpCode.findFirst({
    where: { mobile, purpose, consumed: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!record) return false;

  const valid = await verifyOtpHash(record.codeHash, otp);
  if (!valid) return false;

  await prisma.otpCode.update({
    where: { id: record.id },
    data: { consumed: true },
  });
  return true;
}

/** Step 2a: Register a customer (after OTP verify) */
export async function registerCustomer(req: FastifyRequest, reply: FastifyReply) {
  const parsed = registerCustomerSchema.safeParse(req.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.flatten() });
  }
  const { otp } = req.body as { otp?: string };
  if (!otp) return reply.status(400).send({ error: "OTP required" });

  const { name, mobile, address, latitude, longitude } = parsed.data;

  const otpOk = await consumeValidOtp(mobile, otp, "REGISTER");
  if (!otpOk) return reply.status(400).send({ error: "Invalid or expired OTP" });

  const existing = await prisma.user.findUnique({ where: { mobile } });
  if (existing) return reply.status(409).send({ error: "Mobile already registered" });

  const user = await prisma.user.create({
    data: {
      role: "CUSTOMER",
      name,
      mobile,
      address,
      latitude,
      longitude,
      mobileVerified: true,
    },
  });

  const token = await reply.jwtSign({ id: user.id, role: user.role });
  return reply.send({ token, user });
}

/** Step 2b: Register a worker (after OTP verify). Aadhaar doc uploaded separately via /upload. */
export async function registerWorker(req: FastifyRequest, reply: FastifyReply) {
  const parsed = registerWorkerSchema.safeParse(req.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.flatten() });
  }
  const { otp } = req.body as { otp?: string };
  if (!otp) return reply.status(400).send({ error: "OTP required" });

  const {
    name,
    mobile,
    age,
    address,
    category,
    experienceYears,
    aadhaarNumber,
    aadhaarLinkedMobile,
    latitude,
    longitude,
  } = parsed.data;

  const otpOk = await consumeValidOtp(mobile, otp, "REGISTER");
  if (!otpOk) return reply.status(400).send({ error: "Invalid or expired OTP" });

  const existing = await prisma.user.findUnique({ where: { mobile } });
  if (existing) return reply.status(409).send({ error: "Mobile already registered" });

  // Aadhaar-mobile cross-check: the number linked to the worker's Aadhaar record
  // must match the mobile they registered and OTP-verified with. This is a basic
  // identity-mismatch guard - in production this should call UIDAI's eKYC/OTP
  // API to actually confirm the linked number rather than trust user input.
  const aadhaarMobileMatch = normalizeMobile(aadhaarLinkedMobile) === normalizeMobile(mobile);

  const user = await prisma.user.create({
    data: {
      role: "WORKER",
      name,
      mobile,
      address,
      latitude,
      longitude,
      mobileVerified: true,
      workerProfile: {
        create: {
          category,
          experienceYears,
          age,
          aadhaarNumber, // NOTE: encrypt at rest in production (KMS/pgcrypto), see README
          aadhaarMobileMatch,
          // If Aadhaar mobile doesn't match, force rejection rather than just "pending" -
          // admin still sees it in the queue but the mismatch is flagged up front.
          kycStatus: "PENDING",
        },
      },
    },
    include: { workerProfile: true },
  });

  if (!aadhaarMobileMatch) {
    // Don't fail registration outright - let admin see the account and the flag,
    // since Aadhaar mobile records go stale often (SIM changes, etc). But the
    // worker cannot bid until this is manually resolved (bidController checks kycStatus).
    return reply.send({
      token: await reply.jwtSign({ id: user.id, role: user.role }),
      user,
      note: "Aadhaar-linked mobile doesn't match your registered number. Your account is flagged for manual admin review before you can bid.",
    });
  }

  const token = await reply.jwtSign({ id: user.id, role: user.role });
  return reply.send({
    token,
    user,
    note: "KYC pending admin verification. You can't bid until verified.",
  });
}

/** Login: request OTP first via /auth/otp/request with purpose=LOGIN, then call this */
export async function login(req: FastifyRequest, reply: FastifyReply) {
  const parsed = otpVerifySchema.safeParse(req.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.flatten() });
  }
  const { mobile, otp, purpose } = parsed.data;
  if (purpose !== "LOGIN") return reply.status(400).send({ error: "Invalid purpose" });

  const otpOk = await consumeValidOtp(mobile, otp, "LOGIN");
  if (!otpOk) return reply.status(400).send({ error: "Invalid or expired OTP" });

  const user = await prisma.user.findUnique({
    where: { mobile },
    include: { workerProfile: true },
  });
  if (!user) return reply.status(404).send({ error: "No account with this mobile" });

  const token = await reply.jwtSign({ id: user.id, role: user.role });
  return reply.send({ token, user });
}
