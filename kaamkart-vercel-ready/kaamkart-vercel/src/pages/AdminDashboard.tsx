import { useState, useEffect } from "react";
import { api, apiErrorMessage } from "../api/client";

interface PendingWorker {
  id: string;
  category: string;
  experienceYears: number;
  age: number | null;
  aadhaarMobileMatch?: boolean;
  user: { name: string; mobile: string; address: string | null };
}

interface Stats {
  totalCustomers: number;
  totalWorkers: number;
  pendingKyc: number;
  openJobs: number;
  completedJobs: number;
  totalCommission: number;
}

export function AdminDashboard() {
  const [workers, setWorkers] = useState<PendingWorker[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    api.get("/admin/stats").then((res) => setStats(res.data)).catch((err) => setError(apiErrorMessage(err)));
    api
      .get("/admin/workers/pending")
      .then((res) => setWorkers(res.data.workers))
      .catch((err) => setError(apiErrorMessage(err)));
  }

  async function handleReview(workerId: string, decision: "VERIFIED" | "REJECTED") {
    setReviewingId(workerId);
    setError("");
    try {
      await api.post(`/admin/workers/${workerId}/review`, { decision });
      setWorkers((prev) => prev.filter((w) => w.id !== workerId));
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setReviewingId(null);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-8">
      <h1 className="text-2xl mb-6">Admin — நிர்வாக பலகை</h1>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          <StatCard label="Customers" value={stats.totalCustomers} />
          <StatCard label="Workers" value={stats.totalWorkers} />
          <StatCard label="Pending KYC" value={stats.pendingKyc} accent="warn" />
          <StatCard label="Open jobs" value={stats.openJobs} />
          <StatCard label="Completed jobs" value={stats.completedJobs} />
          <StatCard
            label="Commission earned"
            value={`₹${stats.totalCommission.toFixed(0)}`}
            accent="primary"
          />
        </div>
      )}

      {error && <p className="text-danger text-sm mb-4">{error}</p>}

      <h2 className="text-lg mb-4">KYC சரிபார்ப்பு வரிசை</h2>
      <div className="space-y-3">
        {workers.length === 0 && (
          <p className="text-ink3 text-sm">Pending review இல்லை.</p>
        )}
        {workers.map((w) => (
          <div key={w.id} className="card flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="font-extrabold text-ink">{w.user.name}</p>
              <p className="text-sm text-ink2">{w.user.mobile}</p>
              <p className="text-xs text-ink3 mt-1">
                {w.category} · {w.experienceYears} yrs{w.age ? ` · age ${w.age}` : ""}
              </p>
              <p className="text-xs text-ink3">{w.user.address}</p>
              {w.aadhaarMobileMatch === false ? (
                <span className="badge-pending mt-1.5 inline-block">
                  ⚠ மொபைல் பொருந்தவில்லை — சரிபார்க்கவும்
                </span>
              ) : (
                <span className="badge-verified mt-1.5 inline-block">
                  ✓ ஆதார் மொபைல் பொருந்துகிறது
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                className="btn-primary !py-2 !px-4 text-xs"
                onClick={() => handleReview(w.id, "VERIFIED")}
                disabled={reviewingId === w.id}
              >
                அங்கீகரி
              </button>
              <button
                className="btn-danger text-xs"
                onClick={() => handleReview(w.id, "REJECTED")}
                disabled={reviewingId === w.id}
              >
                நிராகரி
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: "warn" | "primary";
}) {
  const valueColor =
    accent === "warn" ? "text-warn" : accent === "primary" ? "text-primaryDark" : "text-ink";
  return (
    <div className="card">
      <p className="text-xs font-bold text-ink2">{label}</p>
      <p className={`text-2xl font-extrabold mt-1 ${valueColor}`}>{value}</p>
    </div>
  );
}
