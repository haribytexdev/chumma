import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../config/db";
import { env } from "../config/env";
import { createJobSchema } from "../utils/validation";

/** Customer posts a new job (with photo already uploaded to get photoUrl) */
export async function createJob(req: FastifyRequest, reply: FastifyReply) {
  const parsed = createJobSchema.safeParse(req.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.flatten() });
  }
  const user = req.user as { id: string; role: string };
  if (user.role !== "CUSTOMER") {
    return reply.status(403).send({ error: "Only customers can post jobs" });
  }

  const job = await prisma.job.create({
    data: { ...parsed.data, customerId: user.id, status: "OPEN" },
  });

  // TODO: push notification to nearby workers in this category (fan-out via geo query)
  return reply.status(201).send({ job });
}

/** Customer views their own posted jobs */
export async function listMyJobs(req: FastifyRequest, reply: FastifyReply) {
  const user = req.user as { id: string };
  const jobs = await prisma.job.findMany({
    where: { customerId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return reply.send({ jobs });
}

/** Worker views open jobs in their category (nearby, not yet assigned) */
export async function listOpenJobsForWorker(req: FastifyRequest, reply: FastifyReply) {
  const user = req.user as { id: string };
  const workerProfile = await prisma.workerProfile.findUnique({
    where: { userId: user.id },
  });
  if (!workerProfile) return reply.status(404).send({ error: "Worker profile not found" });

  if (workerProfile.kycStatus !== "VERIFIED") {
    return reply.status(403).send({
      error: "KYC not verified yet. You can view but not bid until admin approves.",
    });
  }

  const jobs = await prisma.job.findMany({
    where: { category: workerProfile.category, status: { in: ["OPEN", "BIDDING"] } },
    orderBy: { createdAt: "desc" },
    // NOTE: add PostGIS/haversine distance filter here once lat/lng indexing is set up
  });

  return reply.send({ jobs });
}

/**
 * Customer views bids on their job.
 * Deliberately returns limited worker info (name, experience, rating, verified badge)
 * — NOT mobile/aadhaar — full contact details only unlock after a bid is accepted.
 */
export async function getJobBids(req: FastifyRequest, reply: FastifyReply) {
  const { jobId } = req.params as { jobId: string };
  const user = req.user as { id: string };

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) return reply.status(404).send({ error: "Job not found" });
  if (job.customerId !== user.id) return reply.status(403).send({ error: "Not your job" });

  const bids = await prisma.bid.findMany({
    where: { jobId },
    include: {
      worker: {
        select: {
          id: true,
          category: true,
          experienceYears: true,
          ratingAvg: true,
          ratingCount: true,
          kycStatus: true,
          user: { select: { name: true, profilePhotoUrl: true } },
        },
      },
    },
    orderBy: { amount: "asc" }, // cheapest bid first, like an auction
  });

  return reply.send({ bids });
}

/**
 * Customer accepts a bid. This is the "auction closes" moment.
 * Full worker contact details (mobile, address) unlock for the customer here,
 * and vice versa - full customer address/mobile unlock for the worker.
 */
export async function acceptBid(req: FastifyRequest, reply: FastifyReply) {
  const { bidId } = req.params as { bidId: string };
  const user = req.user as { id: string };

  const bid = await prisma.bid.findUnique({
    where: { id: bidId },
    include: { job: true },
  });
  if (!bid) return reply.status(404).send({ error: "Bid not found" });
  if (bid.job.customerId !== user.id) return reply.status(403).send({ error: "Not your job" });
  if (bid.job.status !== "OPEN" && bid.job.status !== "BIDDING") {
    return reply.status(409).send({ error: "Job already assigned" });
  }

  const [, , job] = await prisma.$transaction([
    prisma.bid.update({ where: { id: bidId }, data: { status: "ACCEPTED" } }),
    prisma.bid.updateMany({
      where: { jobId: bid.jobId, id: { not: bidId } },
      data: { status: "REJECTED" },
    }),
    prisma.job.update({
      where: { id: bid.jobId },
      data: { status: "ASSIGNED", acceptedBidId: bidId },
    }),
  ]);

  const commissionAmt = (bid.amount * env.COMMISSION_PCT) / 100;
  await prisma.transaction.create({
    data: {
      jobId: bid.jobId,
      amount: bid.amount,
      commissionPct: env.COMMISSION_PCT,
      commissionAmt,
      workerPayout: bid.amount - commissionAmt,
    },
  });

  return reply.send({ message: "Bid accepted, job assigned", job });
}
