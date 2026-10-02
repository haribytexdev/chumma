import { useState, useEffect, FormEvent } from "react";
import { Link } from "react-router-dom";
import { api, apiErrorMessage } from "../api/client";
import { CATEGORIES, CATEGORY_LABELS, ServiceCategory, Job } from "../types";
import { CategoryPill } from "../components/CategoryPill";

const STATUS_LABELS: Record<string, string> = {
  OPEN: "விலை காத்திருக்கிறது",
  BIDDING: "விலைகள் வருகிறது",
  ASSIGNED: "வேலையாள் நியமிக்கப்பட்டார்",
  IN_PROGRESS: "வேலை நடக்கிறது",
  COMPLETED: "முடிந்தது",
  CANCELLED: "ரத்து செய்யப்பட்டது",
  DISPUTED: "சிக்கல்",
};

export function CustomerDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState<ServiceCategory>("PLUMBER");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get("/jobs/mine")
      .then((res) => setJobs(res.data.jobs))
      .catch(() => setJobs([]));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/jobs", {
        category,
        description,
        address,
        photoUrl: photoUrl || undefined,
      });
      setJobs((prev) => [res.data.job, ...prev]);
      setShowForm(false);
      setDescription("");
      setAddress("");
      setPhotoUrl("");
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl">உங்க வேலைகள்</h1>
        <button className="btn-primary text-sm !px-5 !py-2.5" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "ரத்து செய்" : "📸 வேலை போடு"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6 space-y-4">
          <div>
            <label className="field-label">
              எந்த வேலை வேணும்? <span className="ta">(Trade needed)</span>
            </label>
            <select
              className="input-field"
              value={category}
              onChange={(e) => setCategory(e.target.value as ServiceCategory)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">
              பிரச்சனை என்ன? <span className="ta">(What's the problem?)</span>
            </label>
            <textarea
              className="input-field"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="எ.கா. சமையலறை குழாய் இன்று காலையிலிருந்து லீக் ஆகுது"
              required
            />
          </div>
          <div>
            <label className="field-label">
              புகைப்படம் URL <span className="ta">(upload coming soon — paste a link for now)</span>
            </label>
            <input
              className="input-field"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://…"
            />
          </div>
          <div>
            <label className="field-label">
              உங்க முகவரி <span className="ta">(Your address)</span>
            </label>
            <textarea
              className="input-field"
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-danger text-sm">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "போடப்படுகிறது…" : "வேலை போடு"}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {jobs.length === 0 && (
          <p className="text-ink3 text-sm">
            இன்னும் வேலை போடலை. மேலே "வேலை போடு" கிளிக் பண்ணுங்க — verified workers bid பண்ண ஆரம்பிப்பாங்க.
          </p>
        )}
        {jobs.map((job) => (
          <Link key={job.id} to={`/customer/jobs/${job.id}`} className="card card-hoverable block">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <CategoryPill category={job.category} />
                <p className="mt-2 text-ink">{job.description}</p>
                <p className="text-xs text-ink3 mt-1">📍 {job.address}</p>
              </div>
              <span className="text-xs font-bold text-primaryDark whitespace-nowrap">
                {STATUS_LABELS[job.status] ?? job.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
