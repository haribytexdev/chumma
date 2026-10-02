import { useState, useEffect } from "react";
import { api, apiErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Job } from "../types";
import { CategoryPill } from "../components/CategoryPill";
import { StampBadge } from "../components/StampBadge";

export function WorkerDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState("");
  const [bidAmounts, setBidAmounts] = useState<Record<string, string>>({});
  const [bidEtas, setBidEtas] = useState<Record<string, string>>({});
  const [placingId, setPlacingId] = useState<string | null>(null);
  const [placedIds, setPlacedIds] = useState<Set<string>>(new Set());

  const kycStatus = user?.workerProfile?.kycStatus ?? "PENDING";
  const canBid = kycStatus === "VERIFIED";

  useEffect(() => {
    api
      .get("/jobs/open")
      .then((res) => setJobs(res.data.jobs))
      .catch((err) => setError(apiErrorMessage(err)));
  }, []);

  async function handleBid(jobId: string) {
    const amount = Number(bidAmounts[jobId]);
    const etaMinutes = Number(bidEtas[jobId]);
    if (!amount || !etaMinutes) {
      setError("விலையும் நேரமும் இரண்டையும் போடுங்க");
      return;
    }
    setPlacingId(jobId);
    setError("");
    try {
      await api.post("/bids", { jobId, amount, etaMinutes });
      setPlacedIds((prev) => new Set(prev).add(jobId));
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setPlacingId(null);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-8">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h1 className="text-2xl">வேலை பலகை</h1>
        <StampBadge status={kycStatus} />
      </div>

      {!canBid && (
        <div className="card mb-6 !border-warn bg-warnSoft">
          <p className="text-sm text-warn font-semibold">
            உங்க KYC இன்னும் {kycStatus === "PENDING" ? "pending" : "rejected"}. வேலைகளை பார்க்கலாம், ஆனா
            admin verify பண்ணனும் bid பண்ண.
          </p>
        </div>
      )}

      {error && <p className="text-danger text-sm mb-4">{error}</p>}

      <div className="space-y-3">
        {jobs.length === 0 && (
          <p className="text-ink3 text-sm">உங்க trade-ல இப்போ வேலை இல்ல.</p>
        )}
        {jobs.map((job) => (
          <div key={job.id} className="card">
            <CategoryPill category={job.category} />
            <p className="mt-2 text-ink">{job.description}</p>
            <p className="text-xs text-ink3 mt-1">📍 {job.address}</p>

            {placedIds.has(job.id) ? (
              <p className="text-primaryDark text-sm mt-3 font-bold">
                ✓ Bid போட்டாச்சு — customer தேர்ந்தெடுக்க காத்திருக்கு
              </p>
            ) : (
              canBid && (
                <div className="flex gap-2 mt-4 items-end flex-wrap">
                  <div className="flex-1 min-w-[100px]">
                    <label className="field-label">விலை (₹)</label>
                    <input
                      type="number"
                      className="input-field"
                      value={bidAmounts[job.id] ?? ""}
                      onChange={(e) =>
                        setBidAmounts((prev) => ({ ...prev, [job.id]: e.target.value }))
                      }
                    />
                  </div>
                  <div className="flex-1 min-w-[100px]">
                    <label className="field-label">நேரம் (நிமிடம்)</label>
                    <input
                      type="number"
                      className="input-field"
                      value={bidEtas[job.id] ?? ""}
                      onChange={(e) =>
                        setBidEtas((prev) => ({ ...prev, [job.id]: e.target.value }))
                      }
                    />
                  </div>
                  <button
                    className="btn-primary !py-3.5 text-sm whitespace-nowrap"
                    onClick={() => handleBid(job.id)}
                    disabled={placingId === job.id}
                  >
                    {placingId === job.id ? "..." : "Bid போடு"}
                  </button>
                </div>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
