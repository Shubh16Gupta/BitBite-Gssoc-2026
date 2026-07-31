# AnnData — Frontend

React + Vite single-page app for the AnnData platform. It serves four portals from
one bundle — farmer, bank, insurer, and admin — each gated on the role stored with
the session.

Talks to the Express API in `../backend`.

---

## Stack

React 18 · Vite 5 · Tailwind CSS 3 · React Router 6 · Axios · Framer Motion ·
Recharts · react-hook-form + Zod · react-hot-toast · i18next (English + Hindi) ·
Leaflet (field GPS picker)

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
```

In development, `vite.config.js` proxies `/api` and `/uploads` to
`http://localhost:5050`, so run the backend on that port and no env file is needed.

| Script | Purpose |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |

## Environment

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | API base URL. Defaults to `/api` (the dev proxy). In production set the full URL **including `/api`**, e.g. `https://your-api.onrender.com/api` |
| `VITE_DEMO_ADMIN_EMAIL` / `VITE_DEMO_ADMIN_PASSWORD` | Optional. Values used by the admin login's "Quick Fill" button, so real credentials need not live in the repo |

Vite inlines env vars at **build** time — changing one in your host's dashboard
requires a redeploy, not just a restart.

---

## Structure

```
src/
  pages/         route shells: Home, About, Directory, and one portal per role
  components/
    auth/        login, signup, OTP verification per actor
    farmer/      dashboard, fields, crop upload, analytics, insurance, loans, profile
    bank/        dashboard, loan requests, farmer drill-down, monitoring
    insurer/     application queue, farmer crop report
    admin/       bank and insurer approvals
    layout/      navbar, footer, layout shell
    common/      button, card, input, spinner, language toggle
  services/      one Axios module per domain — the only place API calls live
  context/       AuthContext (session in localStorage)
  i18n/          en + hi bundles
```

Components never call `axios` directly; every request goes through `src/services/`.
`api.js` attaches the JWT, unwraps the backend's `{ success, message, data }`
envelope, and on a `401` clears the session and redirects to login. Its
`getErrorMessage` also folds field-level validation errors into the message, so a
failed form says *which* field is wrong rather than "Validation failed".

## Routes

| Path | Access |
|---|---|
| `/`, `/about`, `/directory` | public |
| `/login`, `/farmer/signup`, `/verify-otp` | public (farmer auth) |
| `/bank/login`, `/bank/register`, `/insurer/login`, `/admin/login` | public |
| `/farmer/*` | farmer — dashboard, fields, analytics, crop upload, insurance, loans, profile |
| `/bank/*` | bank — dashboard, requests, loan details, monitoring |
| `/insurer/*` | insurer — application queue |
| `/admin/*` | admin — approvals |

The session (JWT + role) lives in `localStorage` via `AuthContext`; each portal
route checks the role before rendering.

## Key flows

**Farmer login is OTP-only** — no password. When the backend runs in demo mode the
code comes back in the response, is shown in a toast, and auto-fills the six input
boxes, so no SMS gateway is required.

**Crop analysis** — pick a field, start a cycle, then submit 3–5 photos per growth
phase. Photos are verified server-side for location, time, and originality. The
first submission after an idle spell can take ~30 s while the ML service wakes.

**Profile** — shows the live AnnScore, Aadhaar front/back and land-document
thumbnails with a verified badge, and warns when documents are missing.

---

## Deployment (Vercel)

1. Import the repo and set **Root Directory** to `frontend-gsoc`.
2. Add `VITE_API_URL` (with the `/api` suffix).
3. Deploy — `vercel.json` supplies the framework preset and, importantly, the SPA
   rewrite. Without that rewrite, refreshing on a nested route like
   `/farmer/fields` returns a 404, since those paths don't exist as files.

Any static host works; the only requirements are the SPA fallback and a build-time
`VITE_API_URL`.
