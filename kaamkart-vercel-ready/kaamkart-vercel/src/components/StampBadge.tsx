import { KycStatus } from "../types";

export function StampBadge({ status }: { status: KycStatus }) {
  const label =
    status === "VERIFIED" ? "✓ Verified" : status === "REJECTED" ? "Rejected" : "Pending";
  const cls =
    status === "VERIFIED"
      ? "badge-verified"
      : status === "REJECTED"
      ? "badge-danger"
      : "badge-pending";
  return <span className={cls}>{label}</span>;
}
