export type Role = "CUSTOMER" | "WORKER" | "ADMIN";
export type ServiceCategory =
  | "PLUMBER"
  | "CARPENTER"
  | "ELECTRICIAN"
  | "MECHANIC"
  | "MASON"
  | "WELDER"
  | "ELECTRONICS"
  | "WEB_DEV"
  | "FOOD_DELIVERY"
  | "PARCEL_DELIVERY";
export type KycStatus = "PENDING" | "VERIFIED" | "REJECTED";
export type JobStatus =
  | "OPEN"
  | "BIDDING"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "DISPUTED";

export const CATEGORIES: ServiceCategory[] = [
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
];

export const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  PLUMBER: "Plumber",
  CARPENTER: "Carpenter",
  ELECTRICIAN: "Electrician",
  MECHANIC: "Mechanic",
  MASON: "Mason",
  WELDER: "Welder",
  ELECTRONICS: "Electronics",
  WEB_DEV: "Web Dev",
  FOOD_DELIVERY: "Food Delivery",
  PARCEL_DELIVERY: "Parcel Delivery",
};

export const CATEGORY_ICONS: Record<ServiceCategory, string> = {
  PLUMBER: "🔧",
  CARPENTER: "🪚",
  ELECTRICIAN: "⚡",
  MECHANIC: "🔩",
  MASON: "🏗️",
  WELDER: "🔥",
  ELECTRONICS: "📺",
  WEB_DEV: "💻",
  FOOD_DELIVERY: "🍱",
  PARCEL_DELIVERY: "📦",
};

export interface User {
  id: string;
  role: Role;
  name: string;
  mobile: string;
  address?: string | null;
  profilePhotoUrl?: string | null;
  workerProfile?: WorkerProfile | null;
}

export interface WorkerProfile {
  id: string;
  category: ServiceCategory;
  experienceYears: number;
  kycStatus: KycStatus;
  aadhaarMobileMatch?: boolean;
  ratingAvg: number;
  ratingCount: number;
}

export interface Job {
  id: string;
  category: ServiceCategory;
  description: string;
  photoUrl?: string | null;
  address: string;
  status: JobStatus;
  createdAt: string;
}

export interface Bid {
  id: string;
  jobId: string;
  amount: number;
  etaMinutes: number;
  status: string;
  worker: {
    id: string;
    category: ServiceCategory;
    experienceYears: number;
    ratingAvg: number;
    ratingCount: number;
    kycStatus: KycStatus;
    user: { name: string; profilePhotoUrl?: string | null };
  };
}
