import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { api, apiErrorMessage } from "../api/client";
import { Bid } from "../types";
import { StampBadge } from "../components/StampBadge";

type SortKey = "price_low" | "price_high" | "exp_high" | "exp_low";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "price_low", label: "💰 குறைந்த விலை" },
  { key: "price_high", label: "💰 அதிக விலை" },
  { key: "exp_high", label: "⭐ அதிக அனுபவம்" },
  { key: "exp_low", label: "⭐ புதிய ஆட்கள்" },
];

export function JobBids() {
  const { jobId } = useParams<{ jobId: string }>();
  const [bids, setBids] = useState<Bid[]>([]);
  const [error, setError] = useState("");
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("price_low");

  useEffect(() => {
    if (!jobId) return;
    loadBids();
  }, [jobId]);

  function loadBids() {
    api
      .get(`/jobs/${jobId}/bids`)
      .then((res) => setBids(res.data.bids))
      .catch((err) => setError(apiErrorMessage(err)));
  }

  async function handleAccept(bidId: string) {
    setAcceptingId(bidId);
    setError("");
    try {
      await api.post(`/bids/${bidId}/accept`);
      setMessage("தேர்ந்தெடுக்கப்பட்டது — தொழிலாளியின் தொடர்பு விவரம் இப்போ தெரியும்.");
      loadBids();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setAcceptingId(null);
    }
  }

  const sortedBids = useMemo(() => {
    const copy = [...bids];
    switch (sortKey) {
      case "price_low":
        return copy.sort((a, b) => a.amount - b.amount);
      case "price_high":
        return copy.sort((a, b) => b.amount - a.amount);
      case "exp_high":
        return copy.sort((a, b) => b.worker.experienceYears - a.worker.experienceYears);
      case "exp_low":
        return copy.sort((a, b) => a.worker.experienceYears - b.worker.experienceYears);
      default:
        return copy;
    }
  }, [bids, sortKey]);

  return (
    <div className="max-w-2xl mx-auto px-5 py-8">
      <p className="text-xs font-bold text-primaryDark uppercase tracking-wide mb-1">
        Job #{jobId?.slice(0, 8)}
      </p>
      <h1 className="text-2xl mb-1">உங்க வேலைக்கு வந்த விலைகள்</h1>
      <p className="text-ink2 text-sm mb-5">
        தேர்ந்தெடுத்தால் தொழிலாளியின் தொடர்பு விவரம் தெரியும்.
      </p>

      {bids.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSortKey(opt.key)}
              className={`text-xs font-bold px-3.5 py-2 rounded-full transition ${
                sortKey === opt.key
                  ? "bg-primary text-white"
                  : "bg-primarySoft text-primaryDark hover:bg-primary/20"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {message && (
        <div className="card mb-5 !border-primary bg-primarySoft">
          <p className="text-primaryDark text-sm font-semibold">{message}</p>
        </div>
      )}
      {error && <p className="text-danger text-sm mb-4">{error}</p>}

      {bids.length === 0 && (
        <p className="text-ink3 text-sm">
          இன்னும் விலை வரலை — nearby workers சீக்கிரம் bid பண்ணுவாங்க.
        </p>
      )}

      <div className="space-y-3">
        {sortedBids.map((bid) => (
          <div key={bid.id} className="card flex items-center justify-between gap-3 flex-wrap">
            <div className="flex gap-3 items-center">
              <div className="avatar">
                {bid.worker.user.name
                  .split(" ")
                  .map((s) => s[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-ink">{bid.worker.user.name}</span>
                  <StampBadge status={bid.worker.kycStatus} />
                </div>
                <p className="text-sm text-ink2 mt-0.5">
                  {bid.worker.experienceYears} வருஷ அனுபவம் · {bid.worker.ratingAvg.toFixed(1)}★ (
                  {bid.worker.ratingCount} வேலைகள்)
                </p>
                <p className="text-xs text-ink3 mt-0.5">வருகை: {bid.etaMinutes} நிமிடம்</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-extrabold text-ink">₹{bid.amount}</p>
              {bid.status === "ACCEPTED" ? (
                <span className="badge-verified mt-2 inline-block">✓ தேர்ந்தெடுக்கப்பட்டது</span>
              ) : bid.status === "REJECTED" ? (
                <span className="text-xs text-ink3">தேர்ந்தெடுக்கவில்லை</span>
              ) : (
                <button
                  className="btn-primary !py-2 !px-4 text-xs mt-2"
                  onClick={() => handleAccept(bid.id)}
                  disabled={acceptingId === bid.id}
                >
                  {acceptingId === bid.id ? "..." : "தேர்ந்தெடு"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
