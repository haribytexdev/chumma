import "dotenv/config";

function required(key: string, fallback?: string): string {
  const val = process.env[key] ?? fallback;
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

export const env = {
  PORT: Number(process.env.PORT ?? 4000),
  DATABASE_URL: required("DATABASE_URL", "postgresql://user:pass@localhost:5432/marketplace"),
  JWT_SECRET: required("JWT_SECRET", "dev-change-this-secret"),
  TWILIO_SID: process.env.TWILIO_SID ?? "",
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN ?? "",
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER ?? "",
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ?? "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ?? "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ?? "",
  COMMISSION_PCT: Number(process.env.COMMISSION_PCT ?? 5.0),
  OTP_EXPIRY_MINUTES: Number(process.env.OTP_EXPIRY_MINUTES ?? 5),
};
