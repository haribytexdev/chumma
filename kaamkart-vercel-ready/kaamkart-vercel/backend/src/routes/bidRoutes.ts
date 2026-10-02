import { FastifyInstance } from "fastify";
import { requireAuth, requireRole } from "../middleware/auth";
import { placeBid, withdrawBid } from "../controllers/bidController";

export default async function bidRoutes(app: FastifyInstance) {
  app.post("/bids", { preHandler: [requireAuth, requireRole("WORKER")] }, placeBid);
  app.post("/bids/:bidId/withdraw", { preHandler: [requireAuth, requireRole("WORKER")] }, withdrawBid);
}
