# Doctor Tracker: frontend

The admin web app for Doctor Tracker, built with Next.js 16 (App Router). Admins sign in, manage doctors and
their patients, and read an analytics dashboard. All data comes from the [Express API](https://github.com/Monjur14/Care_Guide-Doctor_Tracker_Backend)
over REST.

- **Stack:** Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui (Radix) · TanStack Query 5 ·
  nuqs · React Hook Form + Zod · Recharts 3 · Geist
- **Pages:** sign in · dashboard · doctors (list + detail) · patients
- **Themes:** light and dark (follows the system, with a toggle); responsive down to phone width

## Quick start

Requires **Node.js 22.9+** and the [backend](https://github.com/Monjur14/Care_Guide-Doctor_Tracker_Backend) running (default `http://localhost:4000`).

```bash
git clone https://github.com/Monjur14/Care_Guide-Doctor_Tracker_Frontend.git
cd Care_Guide-Doctor_Tracker_Frontend
npm install
cp .env.example .env.local
npm run dev              # http://localhost:3000
```

Sign in with the admin from the backend's `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`, or set the demo
variables below to get a one-click **Use demo admin account** button.

## Configuration

| Variable | Example | Purpose |
|---|---|---|
| `API_URL` | `http://localhost:4000` | Where the Express API runs. Server-side only: Next.js forwards `/api/*` to it |
| `NEXT_PUBLIC_DEMO_EMAIL` | `admin@doctortracker.dev` | Optional. With the password below, shows the demo sign-in button |
| `NEXT_PUBLIC_DEMO_PASSWORD` | | Optional. Must match the seeded admin. **Sent to the browser**, so only use it for a demo account |

Restart `npm run dev` after changing `.env.local`; Next.js reads it at startup.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on port 3000 (Turbopack) |
| `npm run build` / `npm start` | Production build, then serve it |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (Next.js + React Hooks rules) |

## How it talks to the API

```
Browser ──► Next.js (same origin)  /api/*  ──rewrite──►  Express API  ──►  MongoDB
```

- **Same-origin proxy.** `next.config.ts` rewrites `/api/:path*` to `API_URL`, so the browser only ever calls
  its own origin. The session cookie is first-party (works with third-party cookies blocked) and CORS never
  comes into play in the browser.
- **Auth gate.** `src/proxy.ts` redirects to `/login` when there is no session cookie, and away from `/login`
  when there is one. It only checks that the cookie exists; the API verifies it on every request. Any `401`
  clears the query cache and sends the user to `/login?next=…`, and `next` only accepts same-site paths
  (no open redirect).
- **`src/lib/api.ts`** is a small typed `fetch` wrapper. It turns error bodies into an `ApiError` (status,
  code, field details, request ID) and supports aborting requests.

## State and data fetching

- **Server state: TanStack Query.** Each feature has a `queries.ts` with query keys and hooks. Lists use
  `keepPreviousData`, so the current page stays on screen (dimmed) while the next loads. Requests a search
  has made obsolete are cancelled. Mutations invalidate exactly what they affect: a new patient refreshes
  patient lists, that doctor's count and the dashboard stats.
- **UI state: the URL (nuqs).** Search, filters, sort, page and page size live in the query string. Reloads,
  back/forward and shared links all reproduce the same view, and changing a filter resets to page 1.
- **Forms: React Hook Form + the shared Zod schemas** from `shared/` (the local package `@doctor-tracker/shared`, kept identical to the backend repo's copy), the same ones the API validates
  with. Server field errors (for example a `409` duplicate email) are mapped back onto the matching field.
- There is no global client store; the two layers above cover everything.

## Project structure

```
shared/                   @doctor-tracker/shared: Zod schemas, enums and API types (same as the backend repo)
src/
├─ app/
│  ├─ login/              sign-in page (form + live dashboard preview)
│  ├─ (app)/              signed-in area, wrapped in the app shell
│  │  ├─ dashboard/
│  │  ├─ doctors/         list, and [id]/ for a doctor and their patients
│  │  └─ patients/
│  ├─ layout.tsx, providers.tsx, globals.css   (theme tokens, motion keyframes)
├─ features/              one folder per domain: queries + components
│  ├─ auth/               login form, demo fill, sign-in preview
│  ├─ dashboard/          KPI strip, admissions chart, status, top doctors, conditions
│  ├─ doctors/            table, detail page, form drawer, doctor picker (server-searched combobox)
│  ├─ patients/           table (shared by /patients and the doctor page), form drawer, delete dialog
│  └─ meta/               filter options (hospitals, enums)
├─ components/
│  ├─ app-shell/          sidebar, header, Ctrl+K command menu, theme toggle, user menu
│  ├─ data-table/         debounced search, filter select, date range, pagination, sortable header
│  └─ ui/                 shadcn/ui primitives
├─ lib/                   api client, formatting, form error mapping, status colours
└─ proxy.ts               auth gate (Next.js 16's replacement for middleware.ts)
```

## Features

- **Dashboard:** totals, admissions over 30 days or 12 months (with a status breakdown on hover), patient
  status split, top doctors by patient count, and patients by condition.
- **Doctors:** search; filter by specialization, hospital and date added; sort; paginate. Each doctor has a
  page with their contact details and their own patient table, where patients can be added and removed.
  Create and edit happen in a side drawer.
- **Patients:** search; filter by status, condition, gender, doctor and admission date; sort by name, age or
  admission date. Edit (including reassigning the doctor) and delete with confirmation.
- **Ctrl+K command menu:** jump to pages, switch theme, and search doctors and patients by name.
- **Sign-in page:** the real dashboard components render a live preview on the right, fed from a sample
  data snapshot (the stats API needs a session). It's inert and hidden from screen readers.

## UX details

- Loading states are skeletons shaped like the real layout; every list has empty and error states with a retry.
- Dates are shown and edited as calendar days in UTC, so a date picked in a form reads back the same in any
  time zone.
- Keyboard: every action is reachable without a mouse, focus rings are visible, and dialogs trap focus.
- Motion: the sign-in panel eases in with one shared curve, and `prefers-reduced-motion` turns all motion off.
- `cacheComponents` is on: page shells are static and prerendered, while data loads on the client, inside
  Suspense where a route reads the URL or dynamic params.

## Deployment (Vercel)

Import this repo as a Vercel project (framework preset: Next.js, no root directory change needed).

1. Set `API_URL` to the deployed backend URL (no trailing slash).
2. Optionally set `NEXT_PUBLIC_DEMO_EMAIL` / `NEXT_PUBLIC_DEMO_PASSWORD` for reviewers.
3. Add the frontend's domain to the backend's `CORS_ORIGINS`.

GitHub Actions (`.github/workflows/ci.yml`) type checks, lints and builds every push and pull request.

Pages send a strict Content Security Policy and security headers (see `next.config.ts`).
