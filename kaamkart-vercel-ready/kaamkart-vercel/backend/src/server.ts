import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import { env } from "./config/env";
import authRoutes from "./routes/authRoutes";
import jobRoutes from "./routes/jobRoutes";
import bidRoutes from "./routes/bidRoutes";
import adminRoutes from "./routes/adminRoutes";

const app = Fastify({ logger: true });

async function main() {
  await app.register(cors, { origin: true }); // tighten to your frontend domain in production
  await app.register(jwt, { secret: env.JWT_SECRET });
  await app.register(multipart); // for aadhaar doc / photo uploads

  app.get("/health", async () => ({ status: "ok" }));

  await app.register(authRoutes);
  await app.register(jobRoutes);
  await app.register(bidRoutes);
  await app.register(adminRoutes);

  await app.listen({ port: env.PORT, host: "0.0.0.0" });
  app.log.info(`Server running on port ${env.PORT}`);
}

main().catch((err) => {
  app.log.error(err);
  process.exit(1);
});
