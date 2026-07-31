# 🌾 AnnData — Credit that grows with the farmer

[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=flat&logo=vite&logoColor=646CFF)](https://vitejs.dev/)
[![Node](https://img.shields.io/badge/Node-18+-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)

> **AI-powered agri-fintech platform that scores, monitors, and documents farm credit — turning field photos into a lending decision.**

**Live demo:** [bit-bite-gssoc-2026.vercel.app](https://bit-bite-gssoc-2026.vercel.app)

---

## 📌 Overview

**AnnData** (Ann = Grain + Data) bridges the gap between small farmers and
institutional credit. A farmer photographs their crop; a vision service scores its
health; that score is blended with local weather into an **AnnScore** that banks
and insurers can underwrite against — no CIBIL history required.

### 🎯 The problem

- **86%** of India's farmers are small & marginal (<2 ha)
- Only **14–27%** access formal institutional credit
- **28%** of farm credit comes from informal lenders at exploitative rates
- Farmers lack credit scores, making them invisible to banks

### 💡 The approach

Creditworthiness is derived from evidence the farmer already has — their land and
their crop — rather than from a financial history they were never able to build.

---

## 🏗️ Architecture

Three deployable services in one repository:

```
┌─────────────────┐   HTTPS    ┌──────────────────┐   POST /analyze   ┌──────────────┐
│  frontend-gsoc  │──────────▶ │     backend      │──────────────────▶│  ml-service  │
│  React + Vite   │            │ Express + Mongo  │◀──────────────────│   FastAPI    │
│    (Vercel)     │            │     (Render)     │  cropHealthScore  │   (Render)   │
└─────────────────┘            └──────────────────┘                   └──────────────┘
                                   │         │
                          MongoDB Atlas   Cloudinary
                                            + Open-Meteo, Agmarknet
```

| Service | Stack | Responsibility |
|---|---|---|
| [`frontend-gsoc/`](frontend-gsoc/README.md) | React 18, Vite, Tailwind, React Router | Four portals — farmer, bank, insurer, admin |
| [`backend/`](backend/README.md) | Express 4, Mongoose 8, JWT | Auth, crop pipeline, scoring, lending & insurance |
| [`ml-service/`](ml-service/README.md) | FastAPI, Pillow, NumPy | Crop-health score from field photos |

Each folder has its own README with setup, environment variables, and deployment notes.

---

## 🌱 How the AnnScore works

A crop cycle is one sowing, split into **4 growth phases** from a 12-crop catalog.
Each phase the farmer uploads 3–5 photos, and the backend runs:

1. **Anti-fraud screening** — SHA-256 dedupe across all farmers, EXIF GPS checked
   against the field's coordinates, EXIF timestamp checked against the sowing date
2. **Upload** to Cloudinary
3. **Crop health** — the ML service samples random patches per image and scores each
   with **VARI** (Visible Atmospherically Resistant Index): `(G − R) / (G + R − B)`.
   Green, chlorophyll-rich canopy scores high; yellowing, wilting, or bare soil scores low
4. **Near-duplicate detection** across farmers via perceptual hashing
5. **Weather + rainfall** for the field's GPS (Open-Meteo, with fallback provider)
6. **AnnScore** = `0.8 × cropHealth + 0.2 × weatherScore` (weight configurable)
7. **Yield prediction** — a transparent rule-based engine over public agronomic averages
8. **Market price** from the Agmarknet mandi feed → estimated revenue
9. **Report** with plain-language recommendations

Banks see a farmer's averaged AnnScore plus a full explanation of *why* it was
awarded. Insurers price premiums off the same number — better crop health and
consistent monitoring lower the rate.

---

## ✨ What's built

**Farmer** — OTP login (no password), field mapping with GPS, 4-phase crop analysis,
per-field analytics, insurance quotes and applications, loan applications, document
upload with verification badges, English/Hindi UI.

**Bank** — registration with admin approval, configurable minimum-AnnScore threshold,
eligible-farmer list, per-farmer score breakdown, loan approve/reject.

**Insurer** — registration with admin approval, risk-priced application queue,
crop reports visible only for farmers whose applications they've approved.

**Admin** — approve or reject bank and insurer registrations.

---

## 🚀 Quick start

**Prerequisites:** Node ≥ 18, Python ≥ 3.10, MongoDB (local or Atlas).

```bash
git clone https://github.com/Shubh16Gupta/BitBite-Gssoc-2026.git
cd BitBite-Gssoc-2026
```

**1. Backend** — runs on :5050 (the frontend dev proxy expects that port)

```bash
cd backend && npm install && cp .env.example .env
# fill in MONGO_URI and JWT_SECRET, then:
PORT=5050 npm run dev
```

**2. ML service** (optional — the backend falls back to a mocked score without it)

```bash
cd ml-service && python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --port 8000
# then set AI_SERVICE_URL=http://localhost:8000 in backend/.env
```

**3. Frontend**

```bash
cd frontend-gsoc && npm install && npm run dev
```

Open http://localhost:5173 and sign in with any valid 10-digit Indian mobile number
— with no SMS gateway configured the OTP is returned on screen and auto-filled.

**Admin access** requires seeding, since there is no admin signup endpoint:

```bash
cd backend && SEED_ADMIN_EMAIL="admin@farmtrust.in" SEED_ADMIN_PASSWORD="Admin@12345" npm run seed:admin
```

---

## 🔐 Security

- **Aadhaar is never stored in plaintext** — only a SHA-256 hash for duplicate
  detection plus a masked display value (`XXXXXXXX1234`)
- Passwords and OTPs are bcrypt-hashed; OTPs expire, lock out after 5 attempts, and
  are single-use
- Every farmer query is scoped by owner, so one farmer cannot read another's records
- helmet, rate limiting, NoSQL-injection sanitising, and a CORS allowlist
- Photo forensics reject reused, relocated, or back-dated images before they can
  influence a lending score

> **Demo-mode caveat:** with no SMS gateway configured, the OTP is returned in the
> API response so the login flow is demonstrable without an SMS account. That is a
> demo affordance, not a production auth flow — set a gateway key to disable it.

---

## 🚢 Deployment

| Service | Platform | Notes |
|---|---|---|
| Frontend | Vercel | Root directory `frontend-gsoc`; set `VITE_API_URL` **including** `/api` |
| Backend + ML | Render | `render.yaml` at the repo root deploys both |
| Database | MongoDB Atlas | Allow `0.0.0.0/0` — managed hosts have no fixed egress IP |
| Images | Cloudinary | Required in production; local disk is ephemeral |

Free-tier instances sleep after ~15 minutes idle. The backend wakes the ML service
and retries automatically, and `.github/workflows/keep-alive.yml` can ping both on a
schedule (leave it off outside demos — it exceeds the free monthly instance-hours).

---

## 🗺️ Roadmap

- [x] Farmer, bank, insurer, and admin portals
- [x] Backend API with crop-cycle pipeline
- [x] Crop-health ML service and AnnScore
- [x] Insurance and loan flows
- [x] Photo anti-fraud (GPS, timestamp, duplicate detection)
- [ ] Trained crop-health model to replace the vegetation-index scorer
- [ ] Real SMS OTP delivery (DLT-registered gateway)
- [ ] Voice-first interface and wider language coverage
- [ ] Automated loan-document generation and e-sign
- [ ] Mobile app

The yield engine and health scorer are deliberately isolated behind single
functions (`predict(input)` and `score(patch)`), so trained models can replace them
without touching the pipeline.

---

## 🙏 Acknowledgments

Agriculture Census 2015-16 (Government of India) · NABARD Rural Financial Inclusion
Survey · Agmarknet mandi price data · Open-Meteo weather API

## 🏆 Built for

**GSSoC / IDEATHON 2026** — Team 8Bit-Bite

<p align="center"><b>AnnData</b> — AI for better harvests, fairer futures 🌾</p>
