# AnnData — Backend API

Express + MongoDB service behind the AnnData platform. It owns authentication for
all four actors (farmer, bank, insurer, admin), the crop-analysis pipeline, and
the AnnScore that lenders and insurers underwrite against.

The crop-health model runs as a separate FastAPI service (`../ml-service`); this
API orchestrates it.

---

## Stack

Node ≥ 18 (CommonJS) · Express 4 · Mongoose 8 · JWT + bcrypt · Multer → Cloudinary ·
express-validator · helmet, express-rate-limit, express-mongo-sanitize

## Architecture

```
routes/        HTTP surface + validation chains
controllers/   request/response orchestration only
services/      business logic and all data access
models/        Mongoose schemas
middleware/    auth guards, uploads, validation, error handler
config/        env parsing, DB, crop catalog, seed scripts
```

Controllers never touch models directly; services never read `req`. Ownership is
enforced by **query scoping** — a farmer's records are always fetched with
`{ _id, farmer: farmerId }`, so another farmer's row returns `null` and surfaces
as a 404 rather than leaking existence.

Every response uses one envelope:

```json
{ "success": true, "message": "...", "data": {} }
```

---

## Quick start

Prerequisites: Node ≥ 18 and MongoDB (local or an Atlas URI).

```bash
npm install
cp .env.example .env      # fill in MONGO_URI and JWT_SECRET
npm run dev               # http://localhost:5000
```

Health check: `GET /health`. The app refuses to boot without `MONGO_URI` and
`JWT_SECRET`, so a misconfigured deploy fails loudly instead of half-working.

| Script | Purpose |
|---|---|
| `npm start` | Production server |
| `npm run dev` | Nodemon with reload |
| `npm run seed:admin` | Create the first admin from `SEED_ADMIN_*` (idempotent) |
| `npm run reset:admin` | Reset an admin password |

There is no admin signup endpoint by design — admins exist only via the seed script.

---

## Environment

Full list in `.env.example`. The ones that matter:

| Variable | Notes |
|---|---|
| `MONGO_URI` | **Required** |
| `JWT_SECRET` | **Required.** Rotating it invalidates all sessions |
| `CORS_ORIGIN` | Comma-separated allowlist; set your real domain in production |
| `PUBLIC_BASE_URL` | This service's public URL, used for `/uploads` links |
| `CLOUDINARY_*` | **Required in production** — otherwise images land on ephemeral disk and vanish on redeploy |
| `AI_SERVICE_URL` | ML service base URL. Blank ⇒ mocked score, so the pipeline still runs offline |
| `AI_SERVICE_TIMEOUT_MS` | Default 20 s; use 60 s on hosts whose instances sleep |
| `OTP_DEMO_MODE` | Inferred when unset — see below |
| `TRUST_PROXY` | Proxy hop count; defaults to `1` in production |
| `SCORE_WEATHER_WEIGHT` | Weather's share of the AnnScore blend (default `0.2`) |

### OTP delivery

Farmer sign-in is OTP-only — there is no farmer password.

- **Demo mode** (default when no SMS gateway is configured): no SMS is sent; the
  code is returned in the `send-otp` response for the client to autofill.
  Convenient for demos, but **not** an authentication flow for real users — anyone
  who can call the endpoint receives that number's code.
- **Real delivery**: set `FAST2SMS_API_KEY`, `MSG91_*`, or `TWILIO_*` and demo mode
  switches itself off. Transactional SMS to Indian numbers is DLT-regulated, which
  is why Fast2SMS/MSG91 (who supply an approved OTP template) are the quickest path.

---

## API surface

All routes are mounted under `/api`.

| Prefix | Guard | Purpose |
|---|---|---|
| `/farmer` | public | `send-otp`, `verify-otp`, `signup` |
| `/farmer/profile` | farmer | profile read/update, document uploads |
| `/farmer/fields` | farmer | field (plot) CRUD with GPS |
| `/farmer/crop-cycles` | farmer | crop catalog, start cycle, submit phase |
| `/farmer/dashboard/:fieldId`, `/graph/:fieldId`, `/history/:fieldId` | farmer | per-field analytics |
| `/farmer/score`, `/farmer/activity` | farmer | own AnnScore, activity feed |
| `/farmer/loans`, `/farmer/insurance` | farmer | apply for credit / cover |
| `/bank` | bank (approved) | signup, login, criteria, eligible farmers, loan decisions |
| `/insurer` | insurer (approved) | signup, login, application queue, decisions |
| `/admin` | admin | login, approve/reject banks and insurers |

Banks and insurers register as `Pending` and **cannot authenticate** until an admin
approves them.

---

## The crop-cycle pipeline

A cycle is one sowing split into **4 growth phases**, derived from
`config/cropCatalog.js` (12 crops with durations and baseline yields). Each phase
the farmer uploads 3–5 photos and `services/cropCycleService.submitPhase` runs:

1. **Anti-fraud pre-screen** — SHA-256 dedupe across *all* farmers, EXIF GPS within
   `PHOTO_GPS_RADIUS_KM` of the field, EXIF timestamp after sowing and not in the
   future. Missing EXIF isn't a rejection; it lowers the submission's confidence.
2. **Upload** to Cloudinary.
3. **Crop health** — images are downscaled via a Cloudinary transform, then sent to
   the ML service. A sleeping instance is woken and the call retried once.
4. **Near-duplicate check** against other farmers via perceptual aHash.
5. **Weather + rainfall** for the field's coordinates (Open-Meteo, with fallback).
6. **AnnScore** = `(1 − w) × cropHealth + w × weatherScore`, `w = SCORE_WEATHER_WEIGHT`.
7. **Yield prediction** — a transparent rule-based engine isolated behind
   `predict(input)`, so a trained model can replace it without touching callers.
8. **Market price** from the Agmarknet feed → estimated revenue.
9. **Report** with recommendations. Phase 4 completes the cycle and freezes the final yield.

Disease severity is **derived** from the health score, never accepted as client input.

---

## Security notes

- **Aadhaar is never stored in plaintext** — only a SHA-256 hash (for duplicate
  detection) and a masked display value.
- Passwords are bcrypt-hashed by model pre-save hooks. OTPs are bcrypt-hashed too,
  with a TTL index, a 5-attempt lockout, and single-use consumption.
- `trust proxy` is a **hop count**, not `true` — trusting the whole chain would let a
  client spoof `X-Forwarded-For` and bypass rate limiting.
- `/uploads` relaxes helmet's `Cross-Origin-Resource-Policy` so a split-origin
  frontend can render locally stored images; the rest of the API keeps the defaults.

---

## Deployment

`render.yaml` at the repo root deploys this service and the ML service together.

- Start command `npm start`, health check `/health`.
- Set `CLOUDINARY_*`, `MONGO_URI`, `CORS_ORIGIN`, `PUBLIC_BASE_URL`, `AI_SERVICE_URL`.
- On Atlas, allow `0.0.0.0/0` — managed hosts have no fixed egress IP.
- Free instances sleep after ~15 min idle. The ML client wakes and retries on its
  own, and `.github/workflows/keep-alive.yml` can ping both services on a schedule.
