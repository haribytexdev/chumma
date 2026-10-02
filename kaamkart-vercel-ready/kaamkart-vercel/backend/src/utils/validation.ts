import { z } from "zod";

// Indian mobile number: 10 digits, optionally prefixed with +91
export const mobileSchema = z
  .string()
  .regex(/^(\+91)?[6-9]\d{9}$/, "Enter a valid Indian mobile number");

// Single source of truth for categories - keep in sync with prisma/schema.prisma ServiceCategory
export const SERVICE_CATEGORIES = [
  "PLUMBER",
  "CARPENTER",
  "ELECTRICIAN",
  "MECHANIC",
  "MASON",
  "WELDER",
  "ELECTRONICS",
  "WEB_DEV",
  "FOOD_DELIVERY",
  "PARCEL_DELIVERY",
] as const;

export const categorySchema = z.enum(SERVICE_CATEGORIES);

export const registerCustomerSchema = z.object({
  name: z.string().min(2),
  mobile: mobileSchema,
  address: z.string().min(5),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const registerWorkerSchema = z.object({
  name: z.string().min(2),
  mobile: mobileSchema,
  age: z.number().min(18).max(75),
  address: z.string().min(5),
  category: categorySchema,
  experienceYears: z.number().min(0).max(60),
  aadhaarNumber: z.string().regex(/^\d{12}$/, "Aadhaar must be 12 digits"),
  // Mobile number linked to the Aadhaar record - checked against `mobile` for a match.
  // See authController.ts registerWorker for how this is used.
  aadhaarLinkedMobile: mobileSchema,
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const otpRequestSchema = z.object({
  mobile: mobileSchema,
  purpose: z.enum(["REGISTER", "LOGIN", "JOB_CHECKIN"]),
});

export const otpVerifySchema = z.object({
  mobile: mobileSchema,
  otp: z.string().length(6),
  purpose: z.enum(["REGISTER", "LOGIN", "JOB_CHECKIN"]),
});

export const createJobSchema = z.object({
  category: categorySchema,
  description: z.string().min(5),
  photoUrl: z.string().url().optional(),
  address: z.string().min(5),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const placeBidSchema = z.object({
  jobId: z.string().uuid(),
  amount: z.number().positive(),
  etaMinutes: z.number().int().positive(),
});
