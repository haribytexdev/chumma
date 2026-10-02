import { useState } from "react";

interface OtpFieldProps {
  value: string;
  onChange: (v: string) => void;
  onRequestOtp: () => void;
  requested: boolean;
  cooldown: number;
}

export function OtpField({ value, onChange, onRequestOtp, requested, cooldown }: OtpFieldProps) {
  return (
    <div>
      <label className="field-label">
        OTP <span className="ta">(unga mobile-ku vandha code)</span>
      </label>
      <div className="flex gap-2">
        <input
          className="input-field text-center tracking-[0.4em] font-bold"
          maxLength={6}
          placeholder="000000"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        />
        <button
          type="button"
          onClick={onRequestOtp}
          disabled={cooldown > 0}
          className="btn-outline !px-4 !py-0 whitespace-nowrap text-xs disabled:opacity-40"
        >
          {cooldown > 0 ? `Resend (${cooldown}s)` : requested ? "Resend OTP" : "Send OTP"}
        </button>
      </div>
    </div>
  );
}

/** Hook to manage the resend cooldown timer */
export function useOtpCooldown() {
  const [cooldown, setCooldown] = useState(0);

  function start() {
    setCooldown(30);
    const interval = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }

  return { cooldown, start };
}
