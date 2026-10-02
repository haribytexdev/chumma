import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../config/db";
import { placeBidSchema } from "../utils/validation";

/** Worker places a bid on an open job */
export async function placeBid(req: FastifyRequest, reply: FastifyReply) {
  const parsed = placeBidSchema.safeParse(req.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.flatten() });
  }
  const user = req.user as { id: string };

  const workerProfile = await prisma.workerProfile.findUnique({
    where: { userId: user.id },
  });
  if (!workerProfile) return reply.status(404).send({ error: "Worker profile not found" });
  if (workerProfile.kycStatus !== "VERIFIED") {
    return reply.status(403).send({ error: "KYC not verified - cannot bid yet" });
  }

  const { jobId, amount, etaMinutes } = parsed.data;
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) return reply.status(404).send({ error: "Job not found" });
  if (job.category !== workerProfile.category) {
    return reply.status(400).send({ error: "Category mismatch - not your specialty" });
  }
  if (job.status !== "OPEN" && job.status !== "BIDDING") {
    return reply.status(409).send({ error: "Job no longer accepting bids" });
  }

  const bid = await prisma.bid.create({
    data: {
      jobId,
      workerId: workerProfile.id,
      userId: user.id,
      amount,
      etaMinutes,
    },
  });

  if (job.status === "OPEN") {
    await prisma.job.update({ where: { id: jobId }, data: { status: "BIDDING" } });
  }

  return reply.status(201).send({ bid });
}

/** Worker withdraws their own pending bid */
export async function withdrawBid(req: FastifyRequest, reply: FastifyReply) {
  const { bidId } = req.params as { bidId: string };
  const user = req.user as { id: string };

  const bid = await prisma.bid.findUnique({ where: { id: bidId } });
  if (!bid) return reply.status(404).send({ error: "Bid not found" });
  if (bid.userId !== user.id) return reply.status(403).send({ error: "Not your bid" });
  if (bid.status !== "PENDING") return reply.status(409).send({ error: "Bid already resolved" });

  await prisma.bid.update({ where: { id: bidId }, data: { status: "WITHDRAWN" } });
  return reply.send({ message: "Bid withdrawn" });
}
