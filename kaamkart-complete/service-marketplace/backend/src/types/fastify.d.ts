import "@fastify/jwt";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { id: string; role: "CUSTOMER" | "WORKER" | "ADMIN" };
    user: { id: string; role: "CUSTOMER" | "WORKER" | "ADMIN" };
  }
}
