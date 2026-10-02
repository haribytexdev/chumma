import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api, apiErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { OtpField, useOtpCooldown } from "../components/OtpField";
import { CATEGORIES, CATEGORY_LABELS, CATEGORY_ICONS, ServiceCategory } from "../types";

export function RegisterWorker() {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [age, setAge] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState<ServiceCategory | null>(null);
  const [experienceYears, setExperienceYears] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [aadhaarLinkedMobile, setAadhaarLinkedMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const { cooldown, start } = useOtpCooldown();
  const { login } = useAuth();
  const navigate = useNavigate();

  const mobileTouched = aadhaarLinkedMobile.length === 10 && mobile.length === 10;
  const mobileMatches = mobileTouched && aadhaarLinkedMobile === mobile;

  const fieldsFilled = [
    name.trim().length > 1,
    category !== null,
    mobile.length === 10,
    aadhaarLinkedMobile.length === 10,
    aadhaarNumber.length === 12,
  ].filter(Boolean).length;
  const progressPct = (fieldsFilled / 5) * 100;

  async function handleRequestOtp() {
    setError("");
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError("சரியான 10-இலக்க மொபைல் நம்பர் போடுங்க");
      return;
    }
    try {
      await api.post("/auth/otp/request", { mobile, purpose: "REGISTER" });
      setOtpRequested(true);
      start();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/register/worker", {
        name,
        mobile,
        age: Number(age),
        address,
        category,
        experienceYears: Number(experienceYears),
        aadhaarNumber,
        aadhaarLinkedMobile,
        otp,
      });
      login(res.data.token, res.data.user);
      setNote(res.data.note ?? "");
      navigate("/worker");
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-5 py-12">
      <p className="text-xs font-bold text-primaryDark uppercase tracking-wide mb-2">
        Worker sign-up
      </p>
      <h1 className="text-2xl mb-1">உங்க வேலையை பதிவு செய்யுங்க</h1>
      <p className="text-ink2 text-sm mb-6">
        Fill all fields to get verified faster — the more complete, the more trust.
      </p>

      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progressPct}%` }} />
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="field-label">
            முழு பெயர் <span className="ta">(Full name)</span>
          </label>
          <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">
              மொபைல் <span className="ta">(Mobile)</span>
            </label>
            <input
              className="input-field"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="9876543210"
              required
            />
          </div>
          <div>
            <label className="field-label">
              வயது <span className="ta">(Age)</span>
            </label>
            <input
              className="input-field"
              type="number"
              min={18}
              max={75}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
            />
          </div>
        </div>

        <OtpField
          value={otp}
          onChange={setOtp}
          onRequestOtp={handleRequestOtp}
          requested={otpRequested}
          cooldown={cooldown}
        />

        <div>
          <label className="field-label">
            உங்க வேலை என்ன? <span className="ta">(Trade)</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setCategory(c)}
                className={`cat-card !py-3 ${category === c ? "selected" : ""}`}
              >
                <div className="icon-circle !w-9 !h-9 !text-lg !mb-1.5">{CATEGORY_ICONS[c]}</div>
                <p className="text-[11px] font-bold">{CATEGORY_LABELS[c]}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="field-label">
            அனுபவம் (வருடம்) <span className="ta">(Experience)</span>
          </label>
          <input
            className="input-field"
            type="number"
            min={0}
            max={60}
            value={experienceYears}
            onChange={(e) => setExperienceYears(e.target.value)}
            required
          />
        </div>

        <div className="bg-bg rounded-xl p-4 border border-line">
          <p className="text-xs font-extrabold text-primaryDark mb-3">
            🪪 அடையாள சரிபார்ப்பு (Identity check)
          </p>

          <label className="field-label">ஆதார் எண்</label>
          <input
            className="input-field font-mono"
            value={aadhaarNumber}
            onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, "").slice(0, 12))}
            placeholder="12 இலக்க ஆதார்"
            required
          />

          <div className="mt-3">
            <label className="field-label">ஆதார்-இணைந்த மொபைல் நம்பர்</label>
            <input
              className={`input-field font-mono ${
                mobileTouched ? (mobileMatches ? "valid" : "invalid") : ""
              }`}
              value={aadhaarLinkedMobile}
              onChange={(e) => setAadhaarLinkedMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="9876543210"
              required
            />
          </div>

          {mobileTouched && (
            <p className={`text-xs mt-2 font-bold ${mobileMatches ? "text-primaryDark" : "text-danger"}`}>
              {mobileMatches
                ? "✓ சரி — உங்க நம்பருடன் பொருந்துகிறது"
                : "✗ பொருந்தவில்லை — admin review தேவை"}
            </p>
          )}

          <p className="text-xs text-ink3 mt-2">
            உங்க தகவல் பாதுகாப்பாக இருக்கும், customer-க்கு "Verified" badge மட்டும் தெரியும்.
          </p>
        </div>

        <div>
          <label className="field-label">
            வேலை செய்யும் முகவரி <span className="ta">(Work address)</span>
          </label>
          <textarea
            className="input-field"
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="கடை எண், தெரு, ஊர்"
            required
          />
        </div>

        {error && <p className="text-danger text-sm">{error}</p>}
        {note && <p className="text-warn text-sm">{note}</p>}

        <button type="submit" className="btn-primary w-full" disabled={loading || !otpRequested}>
          {loading ? "சமர்ப்பிக்கப்படுகிறது…" : "சரிபார்ப்புக்கு அனுப்பு"}
        </button>
      </form>
    </div>
  );
}
