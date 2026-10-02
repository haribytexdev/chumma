import { FastifyInstance } from "fastify";
import { requireAuth, requireRole } from "../middleware/auth";
import {
  createJob,
  listMyJobs,
  listOpenJobsForWorker,
  getJobBids,
  acceptBid,
} from "../controllers/jobController";
import { checkIn } from "../controllers/checkinController";

export default async function jobRoutes(app: FastifyInstance) {
  app.post("/jobs", { preHandler: [requireAuth, requireRole("CUSTOMER")] }, createJob);
  app.get("/jobs/mine", { preHandler: [requireAuth, requireRole("CUSTOMER")] }, listMyJobs);
  app.get("/jobs/open", { preHandler: [requireAuth, requireRole("WORKER")] }, listOpenJobsForWorker);
  app.get("/jobs/:jobId/bids", { preHandler: [requireAuth, requireRole("CUSTOMER")] }, getJobBids);
  app.post("/bids/:bidId/accept", { preHandler: [requireAuth, requireRole("CUSTOMER")] }, acceptBid);
  app.post("/jobs/:jobId/checkin", { preHandler: [requireAuth, requireRole("WORKER")] }, checkIn);
}
