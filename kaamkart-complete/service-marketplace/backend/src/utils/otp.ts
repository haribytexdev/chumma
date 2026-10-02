import crypto from "crypto";
import argon2 from "argon2";
import twilio from "twilio";
import { env } from "../config/env";

const twilioClient =
  env.TWILIO_SID && env.TWILIO_AUTH_TOKEN
    ? twilio(env.TWILIO_SID, env.TWILIO_AUTH_TOKEN)
    : null;

/** Generates a 6-digit numeric OTP */
export function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/** Hash OTP before storing - never store plaintext, even short-lived */
export async function hashOtp(otp: string): Promise<string> {
  return argon2.hash(otp);
}

export async function verifyOtpHash(hash: string, otp: string): Promise<boolean> {
  return argon2.verify(hash, otp);
}

/** Sends OTP via SMS. In dev without Twilio creds, logs to console instead. */
export async function sendOtpSms(mobile: string, otp: string): Promise<void> {
  const message = `${otp} is your OTP for Service Marketplace. Valid for ${env.OTP_EXPIRY_MINUTES} minutes. Do not share this with anyone.`;

  if (!twilioClient) {
    // Dev fallback - so you can test without a Twilio account
    console.log(`[DEV OTP] mobile=${mobile} otp=${otp}`);
    return;
  }

  await twilioClient.messages.create({
    body: message,
    from: env.TWILIO_PHONE_NUMBER,
    to: mobile,
  });
}
