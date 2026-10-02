/**
 * Creates the first admin account directly in the DB (admins don't self-register
 * via OTP like customers/workers - that's a deliberate security boundary).
 *
 * Run: npx tsx prisma/seed-admin.ts
 * Then log in by generating a JWT manually or adding a temporary admin-login
 * route gated behind an environment secret - see README "Admin access" section.
 */
import { prisma } from "../src/config/db";

async function main() {
  const mobile = process.env.ADMIN_MOBILE ?? "9999999999";
  const name = process.env.ADMIN_NAME ?? "Platform Admin";

  const existing = await prisma.user.findUnique({ where: { mobile } });
  if (existing) {
    console.log("Admin already exists:", existing.id);
    return;
  }

  const admin = await prisma.user.create({
    data: { role: "ADMIN", name, mobile, mobileVerified: true },
  });
  console.log("Admin created:", admin.id, admin.mobile);
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
