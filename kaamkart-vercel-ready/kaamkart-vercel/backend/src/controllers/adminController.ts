import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../config/db";

/** List workers pending KYC review */
export async function listPendingWorkers(_req: FastifyRequest, reply: FastifyReply) {
  const workers = await prisma.workerProfile.findMany({
    where: { kycStatus: "PENDING" },
    include: { user: { select: { name: true, mobile: true, address: true, profilePhotoUrl: true } } },
    orderBy: [{ aadhaarMobileMatch: "asc" }, { createdAt: "asc" }], // mismatches surface first
  });
  return reply.send({ workers });
}

/** Approve or reject a worker's KYC */
export async function reviewWorkerKyc(req: FastifyRequest, reply: FastifyReply) {
  const { workerId } = req.params as { workerId: string };
  const { decision } = req.body as { decision: "VERIFIED" | "REJECTED" };

  if (!["VERIFIED", "REJECTED"].includes(decision)) {
    return reply.status(400).send({ error: "decision must be VERIFIED or REJECTED" });
  }

  const worker = await prisma.workerProfile.update({
    where: { id: workerId },
    data: { kycStatus: decision },
  });

  // TODO: notify worker via SMS that their KYC status changed
  return reply.send({ worker });
}

/** Basic platform stats for admin overview */
export async function getStats(_req: FastifyRequest, reply: FastifyReply) {
  const [totalCustomers, totalWorkers, pendingKyc, openJobs, completedJobs, txns] =
    await Promise.all([
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.user.count({ where: { role: "WORKER" } }),
      prisma.workerProfile.count({ where: { kycStatus: "PENDING" } }),
      prisma.job.count({ where: { status: { in: ["OPEN", "BIDDING"] } } }),
      prisma.job.count({ where: { status: "COMPLETED" } }),
      prisma.transaction.findMany({ select: { commissionAmt: true } }),
    ]);

  const totalCommission = txns.reduce(
    (sum: number, t: { commissionAmt: number }) => sum + t.commissionAmt,
    0
  );

  return reply.send({
    totalCustomers,
    totalWorkers,
    pendingKyc,
    openJobs,
    completedJobs,
    totalCommission,
  });
}
