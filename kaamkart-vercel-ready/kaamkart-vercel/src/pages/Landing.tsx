import { Link } from "react-router-dom";
import { CATEGORIES, CATEGORY_LABELS, CATEGORY_ICONS } from "../types";

export function Landing() {
  return (
    <div>
      <section className="bg-primarySoft px-5 py-10 text-center">
        <div className="max-w-xl mx-auto">
          <h1 className="text-[26px] leading-snug mb-3 text-ink">
            வீட்டு வேலைக்கு நல்ல ஆளை கண்டுபிடிங்க
          </h1>
          <p className="text-ink2 text-[15px] mb-1">
            Post your problem, get quotes from verified workers near you — compare and choose.
          </p>
          <p className="text-primaryDark text-sm font-bold mb-6">
            புகைப்படம் அனுப்புங்க, விலை சொல்லும் ஆளை தேர்ந்தெடுங்க ✓
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/register/customer" className="btn-primary">
              📸 Post a Job
            </Link>
            <Link to="/register/worker" className="btn-outline">
              🧰 I'm a Worker
            </Link>
          </div>
          <div className="flex justify-center gap-6 mt-7 flex-wrap">
            <div className="text-center">
              <p className="text-xl font-extrabold text-primaryDark">2,400+</p>
              <p className="text-xs text-ink2 font-semibold">Verified Workers</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-extrabold text-primaryDark">9</p>
              <p className="text-xs text-ink2 font-semibold">Trade Types</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-extrabold text-primaryDark">100%</p>
              <p className="text-xs text-ink2 font-semibold">OTP Secured</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-9 max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-xl">என்ன வேலை வேணும்?</h2>
          <p className="text-ink2 text-sm mt-1">Choose the trade you need</p>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-12">
          {CATEGORIES.map((c) => (
            <div key={c} className="cat-card">
              <div className="icon-circle">{CATEGORY_ICONS[c]}</div>
              <p className="text-[13px] font-bold text-ink">{CATEGORY_LABELS[c]}</p>
            </div>
          ))}
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl">எப்படி வேலை செய்யும்</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="card text-left">
            <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-extrabold text-sm mb-3">
              1
            </div>
            <h3 className="text-base mb-1.5">புகைப்படம் அனுப்புங்க</h3>
            <p className="text-sm text-ink2">
              Take a photo, describe the problem, add your address. Takes 1 minute.
            </p>
          </div>
          <div className="card text-left">
            <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-extrabold text-sm mb-3">
              2
            </div>
            <h3 className="text-base mb-1.5">விலையை ஒப்பிடுங்க</h3>
            <p className="text-sm text-ink2">
              Verified workers send their price. You compare and pick the best one.
            </p>
          </div>
          <div className="card text-left">
            <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-extrabold text-sm mb-3">
              3
            </div>
            <h3 className="text-base mb-1.5">OTP-ல உறுதி செய்யுங்க</h3>
            <p className="text-sm text-ink2">
              Worker வந்ததும் OTP + photo verify — சரியான ஆள்தான் என்று உறுதி.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
