import { Link } from "react-router-dom";

export function RegisterChoice() {
  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <h1 className="text-2xl mb-2">எப்படி sign up பண்ணுவீங்க?</h1>
      <p className="text-ink2 text-sm mb-8">How do you want to sign up?</p>
      <div className="grid md:grid-cols-2 gap-4">
        <Link to="/register/customer" className="card card-hoverable block">
          <div className="icon-circle mb-3">🛠️</div>
          <h2 className="text-lg mb-1.5">எனக்கு வேலை வேணும்</h2>
          <p className="text-sm text-ink2 mb-4">
            Post a problem and get quotes from nearby verified workers.
          </p>
          <span className="btn-primary text-sm">Register as customer</span>
        </Link>
        <Link to="/register/worker" className="card card-hoverable block">
          <div className="icon-circle mb-3">🧰</div>
          <h2 className="text-lg mb-1.5">நான் வேலை செய்வேன்</h2>
          <p className="text-sm text-ink2 mb-4">
            Register your trade, get KYC verified, and start bidding on jobs.
          </p>
          <span className="btn-outline text-sm">Register as worker</span>
        </Link>
      </div>
    </div>
  );
}
