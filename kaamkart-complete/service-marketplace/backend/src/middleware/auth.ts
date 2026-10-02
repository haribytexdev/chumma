import { FastifyRequest, FastifyReply } from "fastify";

/** Verifies JWT is present and valid. Attach as preHandler on protected routes. */
export async function requireAuth(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify();
  } catch {
    return reply.status(401).send({ error: "Unauthorized - invalid or missing token" });
  }
}

/** Restricts route to specific role(s). Use AFTER requireAuth. */
export function requireRole(...roles: Array<"CUSTOMER" | "WORKER" | "ADMIN">) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as { role: string };
    if (!roles.includes(user.role as any)) {
      return reply.status(403).send({ error: "Forbidden - insufficient role" });
    }
  };
}
