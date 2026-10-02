import { PrismaClient } from "@prisma/client";

// Singleton pattern - avoids exhausting DB connections in dev with hot-reload
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});
