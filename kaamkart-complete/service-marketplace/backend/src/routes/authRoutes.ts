import { FastifyInstance } from "fastify";
import {
  requestOtp,
  registerCustomer,
  registerWorker,
  login,
} from "../controllers/authController";

export default async function authRoutes(app: FastifyInstance) {
  app.post("/auth/otp/request", requestOtp);
  app.post("/auth/register/customer", registerCustomer);
  app.post("/auth/register/worker", registerWorker);
  app.post("/auth/login", login);
}
