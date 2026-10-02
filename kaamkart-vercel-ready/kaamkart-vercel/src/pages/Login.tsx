import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api, apiErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { OtpField, useOtpCooldown } from "../components/OtpField";

export function Login() {
  const [mobile, setMobile] = useState("");
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
      await api.post("/auth/otp/request", { mobile, purpose: "LOGIN" });
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
      const res = await api.post("/auth/login", { mobile, otp, purpose: "LOGIN" });
      login(res.data.token, res.data.user);
      const role = res.data.user.role;
      navigate(role === "ADMIN" ? "/admin" : role === "WORKER" ? "/worker" : "/customer");
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-5 py-12">
      <h1 className="text-2xl mb-6">Log in</h1>
      <form onSubmit={handleSubmit} className="card space-y-4">
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

        {error && <p className="text-danger text-sm">{error}</p>}

        <button type="submit" className="btn-primary w-full" disabled={loading || !otpRequested}>
          {loading ? "Log in aagurathu…" : "Log in"}
        </button>
      </form>
    </div>
  );
}
