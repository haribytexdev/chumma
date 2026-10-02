import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../config/db";

/**
 * Worker checks in at job site: uploads a live selfie (selfieUrl - upload separately
 * via /upload first) which gets compared against their registered profile photo.
 *
 * Actual face-match should call an external service (AWS Rekognition CompareFaces,
 * Azure Face API, or a self-hosted face-api.js service) - this stub shows where
 * that call goes and how the result is stored.
 */
export async function checkIn(req: FastifyRequest, reply: FastifyReply) {
  const { jobId } = req.params as { jobId: string };
  const { selfieUrl } = req.body as { selfieUrl: string };
  const user = req.user as { id: string };

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      bids: { where: { status: "ACCEPTED" } },
    },
  });
  if (!job) return reply.status(404).send({ error: "Job not found" });

  const acceptedBid = job.bids[0];
  if (!acceptedBid || acceptedBid.userId !== user.id) {
    return reply.status(403).send({ error: "You are not the assigned worker for this job" });
  }
  if (job.status !== "ASSIGNED") {
    return reply.status(409).send({ error: "Job is not in assigned state" });
  }

  const registeredUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!registeredUser?.profilePhotoUrl) {
    return reply.status(400).send({ error: "No registered profile photo to compare against" });
  }

  // --- Face match call goes here ---
  // const matchResult = await compareFaces(registeredUser.profilePhotoUrl, selfieUrl);
  // Placeholder result until a real provider is wired up:
  const matchResult = { matchScore: 0.0, matched: false };

  const checkin = await prisma.jobCheckIn.create({
    data: {
      jobId,
      liveSelfieUrl: selfieUrl,
      matchScore: matchResult.matchScore,
      matched: matchResult.matched,
    },
  });

  if (matchResult.matched) {
    await prisma.job.update({ where: { id: jobId }, data: { status: "IN_PROGRESS" } });
  }

  return reply.send({
    checkin,
    note: matchResult.matched
      ? "Face verified, job started"
      : "Face match failed or not yet wired up to a real provider - see checkinController.ts",
  });
}
