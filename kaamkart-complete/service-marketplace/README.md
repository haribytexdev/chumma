# KaamKart — Local Service Bidding Marketplace

Reverse-bidding platform: customer posts a problem (photo + description),
nearby verified workers bid, customer picks the best quote, platform takes
5% commission.

**10 categories:** plumber, carpenter, electrician, mechanic, mason, welder,
electronics, web dev, bug fixing, food delivery, parcel delivery.

```
service-marketplace/
├── backend/       Node.js + TypeScript + Fastify + PostgreSQL (Prisma)
├── frontend/      React + TypeScript + Vite + Tailwind
└── preview.html   Static, dependency-free UI mockup — open directly in a browser
```

**Just want to look at the design?** Open `preview.html` directly — no install,
no server, loads instantly (system fonts only, zero network calls). Click the
tabs at the top to see Landing, Worker Registration, Customer Dashboard, Quote
Sheet, Worker Board, and Admin screens. It's a static mockup with fake data —
the real, working version is in `backend/` + `frontend/`.

## Push this to GitHub

```bash
cd service-marketplace
git init
git add .
git commit -m "Initial commit — KaamKart service marketplace"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

`.gitignore` files are already in place (root, `backend/`, `frontend/`) so
`node_modules/`, `dist/`, and any `.env` file are excluded automatically —
only `.env.example` (the template, no real secrets) gets committed. Double
check with `git status` before your first commit that no `.env` file is
listed as staged.

## Run both together

**1. Backend** (Terminal 1)
```bash
cd backend
npm install
cp .env.example .env        # fill in DATABASE_URL, JWT_SECRET (Twilio optional - OTP prints to console without it)
npx prisma migrate dev --name init
npm run dev                 # runs on http://localhost:4000
```

**2. Frontend** (Terminal 2)
```bash
cd frontend
npm install
npm run dev                 # runs on http://localhost:5173, calls backend at localhost:4000
```

Open `http://localhost:5173` in your browser.

## First-time setup checklist

1. `backend/.env` needs a real `DATABASE_URL` — either a local Postgres
   (`postgresql://user:pass@localhost:5432/marketplace`) or a free hosted one
   (Supabase, Neon, Railway all work).
2. Register a customer and a worker through the UI — OTP will print to your
   backend terminal as `[DEV OTP] mobile=... otp=...` since Twilio isn't
   configured. Use that code to complete sign-up.
3. Worker registration now also asks for the **mobile number linked to their
   Aadhaar** — the backend checks it against the registered mobile and flags
   a mismatch (`aadhaarMobileMatch: false`) so admin sees it first in the KYC
   queue. This is a basic identity guard, not real Aadhaar verification — see
   `backend/README.md` security note #7 for what real verification requires.
4. A freshly registered worker has `kycStatus: PENDING` and can't bid yet.
   Create an admin to approve them:
   ```bash
   cd backend
   ADMIN_MOBILE=9999999999 ADMIN_NAME="Your Name" npx tsx prisma/seed-admin.ts
   ```
   Then log in at `/login` with that mobile — OTP prints to the console the
   same way. The admin dashboard lets you approve/reject worker KYC.
5. Once approved, the worker can bid on jobs in their category, and the
   customer can accept a bid from `/customer/jobs/:jobId`.

## What's real vs. stubbed right now

**Fully working:** OTP register/login, job posting, bidding, bid accept,
KYC approval, commission calculation, role-based routing on the frontend.

**Stubbed — needs wiring before production:**
- Photo/Aadhaar uploads are a paste-a-URL field, not real file upload
  (needs `@fastify/multipart` → Cloudinary/S3, see `backend/README.md`)
- Face-match check-in returns a placeholder result (needs AWS Rekognition or
  similar, see `checkinController.ts`)
- No payment integration yet — commission is calculated and stored but no
  money actually moves (needs Razorpay)
- No nearby-worker geo filtering yet (lists all jobs in category, not
  distance-sorted)

Full details and security notes are in `backend/README.md`.
