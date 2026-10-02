# Service Marketplace — Backend

Reverse-bidding marketplace: customer posts a problem (photo + description),
nearby verified workers bid, customer picks one, platform takes 5% commission.

**Categories (10):** plumber, carpenter, electrician, mechanic, mason, welder,
electronics, web dev, bug fixing, food delivery, parcel delivery.

## Stack
- Node.js + TypeScript + Fastify
- PostgreSQL + Prisma ORM
- JWT auth + OTP (mobile) via Twilio
- Argon2id for hashing OTPs
- Face check-in stub (wire up AWS Rekognition / Azure Face API / face-api.js)

## Setup

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET, Twilio creds
npx prisma migrate dev --name init
npm run dev
```

Without Twilio creds set, OTPs print to the console (`[DEV OTP] mobile=... otp=...`)
so you can test the full flow without an SMS account.

## API flow (how the pieces connect)

**Customer:**
1. `POST /auth/otp/request` `{mobile, purpose: "REGISTER"}`
2. `POST /auth/register/customer` `{name, mobile, address, otp}`
3. `POST /jobs` (auth) — post a problem with category + photo + description
4. `GET /jobs/:jobId/bids` (auth) — see bids (limited worker info: name, rating,
   experience, verified badge — NOT mobile/aadhaar yet)
5. `POST /bids/:bidId/accept` (auth) — picks the winning bid, full contact
   details unlock for both sides at this point

**Worker:**
1. `POST /auth/otp/request` `{mobile, purpose: "REGISTER"}`
2. `POST /auth/register/worker` `{name, mobile, age, address, category,
   experienceYears, aadhaarNumber, aadhaarLinkedMobile, otp}` → account
   created with `kycStatus: PENDING`. The backend compares
   `aadhaarLinkedMobile` against `mobile` and sets `aadhaarMobileMatch` on the
   worker profile — mismatches surface first in the admin KYC queue instead of
   silently failing. **Note:** this only compares two numbers the user typed;
   it does not call UIDAI, so it's an identity-mismatch guard, not real Aadhaar
   verification — see security note #7 below.
3. **Admin must verify KYC** before the worker can bid (not yet exposed as a
   route — add an `/admin/workers/:id/verify` route gated by `requireRole("ADMIN")`)
4. `GET /jobs/open` (auth) — see open jobs in their category
5. `POST /bids` (auth) — place a bid `{jobId, amount, etaMinutes}`
6. On arrival: `POST /jobs/:jobId/checkin` `{selfieUrl}` — face-match against
   registered profile photo before job status moves to `IN_PROGRESS`

## Security notes — read before going to production

1. **Aadhaar numbers**: currently stored as plain text in `aadhaarNumber`.
   Encrypt at the application layer (e.g. `pgcrypto` or a KMS-backed field-level
   encryption library) before this touches real user data. Never log it.
2. **Face match**: `checkinController.ts` has a placeholder — plug in AWS
   Rekognition `CompareFaces`, Azure Face API, or a self-hosted `face-api.js`
   service. Don't ship with the stub.
3. **File uploads** (Aadhaar doc, profile photo, selfie, job photo): wire
   `@fastify/multipart` to Cloudinary/S3, validate file type + size server-side,
   never trust client-supplied MIME type.
4. **Rate limit** the OTP request endpoint (e.g. `@fastify/rate-limit`) —
   otherwise it's an SMS-bombing vector.
5. **CORS**: `origin: true` in `server.ts` is dev-only. Lock to your actual
   frontend domain before deploy.
6. Add an **admin approval route** for worker KYC — right now workers register
   with `PENDING` status and there's no way to flip it to `VERIFIED` yet.
7. **Real Aadhaar verification**: `aadhaarMobileMatch` currently just string-compares
   two numbers the worker typed in the same form — trivially spoofable. For real
   identity assurance, integrate UIDAI's eKYC/OTP-based Aadhaar API (requires
   AUA/KUA licensing) or a licensed KYC provider (Karza, Signzy, IDfy, etc.)
   that actually confirms the Aadhaar-linked mobile via an OTP sent to it.

## Admin access

Admins don't self-register via OTP (deliberate — you don't want randoms signing
up as admin). Create the first admin with:

```bash
ADMIN_MOBILE=9999999999 ADMIN_NAME="Your Name" npx tsx prisma/seed-admin.ts
```

Then log in the normal way: `POST /auth/otp/request` with that mobile and
`purpose: "LOGIN"`, then `POST /auth/login` with the OTP. The returned JWT has
`role: "ADMIN"` and unlocks `/admin/*` routes (KYC approval, platform stats).

## Not yet built (next steps)
- Admin routes (KYC approval, dispute handling, commission dashboard)
- Nearby-worker geo query (currently lists all jobs in category — add
  PostGIS or haversine-distance filtering using lat/lng)
- Push notifications (new job → nearby workers; bid accepted → worker)
- Rating/review submission endpoint (schema exists, no route yet)
- Payment integration (Razorpay) — `Transaction` records are created but
  nothing actually moves money yet
