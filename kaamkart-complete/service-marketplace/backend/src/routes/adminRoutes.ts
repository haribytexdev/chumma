import { FastifyInstance } from "fastify";
import { requireAuth, requireRole } from "../middleware/auth";
import { listPendingWorkers, reviewWorkerKyc, getStats } from "../controllers/adminController";

export default async function adminRoutes(app: FastifyInstance) {
  app.get(
    "/admin/workers/pending",
    { preHandler: [requireAuth, requireRole("ADMIN")] },
    listPendingWorkers
  );
  app.post(
    "/admin/workers/:workerId/review",
    { preHandler: [requireAuth, requireRole("ADMIN")] },
    reviewWorkerKyc
  );
  app.get("/admin/stats", { preHandler: [requireAuth, requireRole("ADMIN")] }, getStats);
}
