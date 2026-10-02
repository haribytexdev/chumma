import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api, apiErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { OtpField, useOtpCooldown } from "../components/OtpField";

export function RegisterCustomer() {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [otp, setOtp] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { cooldown, start } = useOtpCooldown();
  const { login } = useAuth();
  const navigate = useNavigate();

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
      const res = await api.post("/auth/register/customer", { name, mobile, address, otp });
      login(res.data.token, res.data.user);
      navigate("/customer");
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-5 py-12">
      <p className="text-xs font-bold text-primaryDark uppercase tracking-wide mb-2">
        Customer sign-up
      </p>
      <h1 className="text-2xl mb-1">உங்க வேலையை பதிவு செய்யுங்க</h1>
      <p className="text-ink2 text-sm mb-6">Post your job and get quotes</p>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="field-label">
            முழு பெயர் <span className="ta">(Full name)</span>
          </label>
          <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div>
          <label className="field-label">
            மொபைல் நம்பர் <span className="ta">(Mobile number)</span>
          </label>
          <input
            className="input-field"
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="9876543210"
            required
          />
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
            முகவரி <span className="ta">(Address)</span>
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

        <button type="submit" className="btn-primary w-full" disabled={loading || !otpRequested}>
          {loading ? "Account create pannurom…" : "Account create pannu"}
        </button>
      </form>
    </div>
  );
}
