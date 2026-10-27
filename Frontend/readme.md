# JobFinder — Frontend

The React single-page application for **JobFinder**, a two-sided job board.
Candidates search and track jobs; recruiters post roles and manage applicants.
It talks to a Spring Boot + PostgreSQL backend over a JWT-secured REST API.

---

## Table of contents
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Available scripts](#available-scripts)
- [Environment configuration](#environment-configuration)
- [How the frontend connects to the backend](#how-the-frontend-connects-to-the-backend)
- [Project structure](#project-structure)
- [Routing & access control](#routing--access-control)
- [Features](#features)
  - [Candidate](#1-candidate)
  - [Recruiter / Company](#2-recruiter--company)
- [Services layer](#services-layer)
- [Authentication & session](#authentication--session)
- [Application statuses](#application-statuses)
- [Theme & design system](#theme--design-system)
- [Data flow](#data-flow)
- [API reference (as consumed here)](#api-reference-as-consumed-here)
- [Gotchas & troubleshooting](#gotchas--troubleshooting)

---

## Tech stack

| Concern | Choice | Version |
|---|---|---|
| UI library | React | ^18.3 |
| Build tool / dev server | Vite | ^6.0 |
| Component library | MUI (Material UI) + Emotion | ^6.4 |
| Icons | @mui/icons-material | ^6.4 |
| Routing | React Router | ^6.28 |
| HTTP client | Axios | ^1.7 |
| Language | JavaScript (ESM, JSX) | — |

No TypeScript, no global state library — state is local to each page and the
session lives in `localStorage`.

---

## Prerequisites
- **Node.js 18+** and npm.
- The **backend running on `http://localhost:8080`** (see `Backend/readme.md`).
- A PostgreSQL database reachable by the backend.

---

## Getting started

```bash
# 1. install dependencies
cd Frontend
npm install

# 2. configure the backend URL (see Environment configuration)
#    Frontend/.env  ->  VITE_API_BASE_URL=http://localhost:8080

# 3. start the dev server (http://localhost:5173)
npm run dev

# 4. production build + local preview
npm run build
npm run preview
```

The dev server runs on **port 5173** (fixed via `vite.config.js`, `strictPort`).

---

## Available scripts

| Script | Command | What it does |
|---|---|---|
| `npm run dev` | `vite` | Starts the dev server with HMR on `:5173`. |
| `npm run build` | `vite build` | Type-checks-free production build into `dist/`. |
| `npm run preview` | `vite preview` | Serves the built `dist/` locally to sanity-check it. |

---

## Environment configuration

All config is read from **`Frontend/.env`**:

```env
VITE_API_BASE_URL=http://localhost:8080
```

- The `VITE_` prefix is what exposes a variable to client code via
  `import.meta.env.VITE_API_BASE_URL`.
- Change this one value to point the app at a different/staging backend.
- **Restart `npm run dev` after editing `.env`** — Vite only reads it on boot.

---

## How the frontend connects to the backend

Three glue points (all in `src/services/api.js` + backend `SecurityConfig`):

1. **Base URL** — a single Axios instance is created with `baseURL` from
   `VITE_API_BASE_URL`. Every service call uses relative paths (`/api/...`).
2. **CORS** — the backend allows origin `http://localhost:5173`. If these don't
   match, the browser blocks responses.
3. **JWT** — after login, the token is stored in `localStorage` and a **request
   interceptor** attaches `Authorization: Bearer <token>` to every call. A
   **response interceptor** clears the session on any `401`.

```js
// src/services/api.js (essentials)
const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080" });
api.interceptors.request.use((c) => {
  const token = localStorage.getItem("jobfinder_token");
  if (token) c.headers.Authorization = `Bearer ${token}`;
  return c;
});
```

---

## Project structure

```
Frontend/
├─ index.html                # Loads Google Fonts (Manrope + Fraunces), #root mount
├─ vite.config.js            # Registers @vitejs/plugin-react, pins port 5173
├─ .env                      # VITE_API_BASE_URL
└─ src/
   ├─ main.jsx               # ReactDOM root: ThemeProvider + CssBaseline + Router
   ├─ app.jsx                # Route table (public + role-scoped app routes)
   ├─ theme.js               # MUI theme: palette, typography, component overrides
   ├─ index.css              # Global base styles
   ├─ components/
   │  ├─ AppLayout.jsx       # Shell: sidebar + top bar + <Outlet/> content area
   │  ├─ Sidebar.jsx         # Role-aware navigation + sign-out (desktop + mobile drawer)
   │  └─ PageHeadder.jsx     # Reusable page heading (eyebrow / title / description / action)
   ├─ services/
   │  ├─ api.js              # Axios instance + JWT/CORS wiring (the connection point)
   │  ├─ authService.js      # register/login + saveSession/logout (localStorage)
   │  ├─ jobService.js       # /api/jobs CRUD + per-job applicants
   │  └─ applicationService.js # /api/applications + recruiter status PATCH
   └─ pages/
      ├─ auth/       LoginPage.jsx, RegisterPage.jsx
      ├─ candidate/  CandidateDashboard.jsx, JobSearchPage.jsx, MyApplicationsPage.jsx
      └─ company/    CompanyDashboard.jsx, ManageJobsPage.jsx, ApplicantsPage.jsx
```

---

## Routing & access control

Defined in `src/app.jsx`.

| Path | Page | Access |
|---|---|---|
| `/` | → redirect to `/login` | public |
| `/login` | LoginPage | public |
| `/register` | RegisterPage | public |
| `/candidate/dashboard` | CandidateDashboard | signed-in (candidate shell) |
| `/candidate/jobs` | JobSearchPage | signed-in (candidate shell) |
| `/candidate/applications` | MyApplicationsPage | signed-in (candidate shell) |
| `/company/dashboard` | CompanyDashboard | signed-in (company shell) |
| `/company/jobs` | ManageJobsPage | signed-in (company shell) |
| `/company/applicants` | ApplicantsPage | signed-in (company shell) |
| `*` | → redirect to `/login` | public |

All app routes render inside **`AppLayout`** (sidebar + header). The sidebar's
links and the landing route are chosen by the stored **role**. Real
authorization is enforced server-side via the JWT `role` claim; the frontend
role only drives navigation/UI.

> **Role mapping:** backend `RECRUITER`/`COMPANY` → frontend `"company"`;
> anything else → `"candidate"` (see `saveSession` in `authService.js`).

---

## Features

### 1. Candidate

**Dashboard** (`CandidateDashboard.jsx`)
- Personalized greeting (first name from the stored user).
- Stat cards: **Available jobs**, **Applications sent**, **Awaiting a response**.
- "Recent applications" list (latest 5) with status chips + quick links.
- Loads jobs and applications in parallel (`Promise.allSettled`) so one failure
  doesn't blank the whole page.

**Find jobs** (`JobSearchPage.jsx`)
- Lists all open jobs; **live search** by title/company/skill/description and a
  separate **location** filter (client-side, `useMemo`).
- **Apply** button per job. Already-applied jobs show a disabled **"Applied"**
  state — the page loads your existing applications on mount so the state
  survives refreshes.
- One application per candidate per job is also enforced by the backend
  (`409 Conflict` on duplicates).
- "View original listing" external link when a job has a URL.

**My applications** (`MyApplicationsPage.jsx`)
- A unified tracker combining:
  - **JobFinder applications** (from the backend, read-only status chips), and
  - **External applications** you log yourself (stored in `localStorage`,
    full create / edit / delete via a dialog).
- Stat cards (All / In progress / Offers), search, **status** and **source**
  filters.
- Per-row actions: open link, edit, delete; inline status dropdown for
  external rows.
- **Export filtered** to CSV (with formula-injection-safe cells).

### 2. Recruiter / Company

**Dashboard** (`CompanyDashboard.jsx`)
- Stat cards: **Total listings**, **Locations covered**, **Added this week**.
- Shortcut panels to manage jobs and review applicants.

**Manage jobs** (`ManageJobsPage.jsx`)
- Full **CRUD**: create/edit a listing in a dialog (title, location, company,
  optional URL, description), delete with confirmation.
- Search by title or location; empty & loading states.

**Applicants** (`ApplicantsPage.jsx`)
- Aggregates applicants across **your** jobs (reads each job's applications).
- Stat cards: **Matching applications**, **Distinct candidates**.
- Search + filter by **job listing** and **application status**.
- **Update an applicant's status** inline (recruiter-scoped `PATCH` endpoint —
  the backend verifies you own the job).
- **Export filtered** to CSV.

---

## Services layer

Thin, promise-based wrappers around the Axios instance. Each returns
`response.data`.

| File | Functions → Endpoint |
|---|---|
| `authService.js` | `registerUser` → `POST /api/auth/register`, `loginUser` → `POST /api/auth/login`, `saveSession`, `logoutUser` |
| `jobService.js` | `getJobs`, `getJobById`, `createJob`, `updateJob`, `deleteJob`, `getJobApplications(jobId)` |
| `applicationService.js` | `getMyApplications`, `getApplicationById`, `applyForJob`, `updateApplication`, `deleteApplication`, `updateApplicationStatus(jobId, appId, status)` |

---

## Authentication & session

Handled in `authService.js`. On a successful login/register:

```js
localStorage.setItem("jobfinder_token", token);   // JWT, sent as Bearer on every request
localStorage.setItem("jobfinder_role", role);      // "candidate" | "company"
localStorage.setItem("jobfinder_user", JSON.stringify({ id, name, email, role }));
```

- **`jobfinder_token`** — read by the request interceptor in `api.js`.
- **`jobfinder_role`** — drives sidebar links and the post-login landing route.
- **`jobfinder_user`** — powers the header avatar/name and dashboard greeting.
- A `401` response automatically wipes all three and you fall back to login.
- **Sign out** (in `Sidebar.jsx`) clears the same keys.
- External-tracker rows live under **`jobfinder_external_applications`**.

---

## Application statuses

The **recruiter** Applicants dropdown must match the backend `ApplicationStatus`
enum exactly, or the API rejects the update:

```
SAVED · APPLIED · INTERVIEW · OFFER · REJECTED · WITHDRAWN
```

The **candidate** external tracker uses its own friendlier, frontend-only set:
`Saved, Applied, Assessment, Interview, Offer, Rejected, Withdrawn` (stored
locally, not sent to the backend).

---

## Theme & design system

Defined in `src/theme.js` and applied via `ThemeProvider` in `main.jsx`.

**Palette**

| Token | Hex | Use |
|---|---|---|
| cream | `#F5F1EA` | app background |
| charcoal | `#30312E` | primary / text |
| terracotta | `#BD8069` | accent / highlights |
| wine/plum | `#713D49` | secondary accent, links |
| muted | `#77756F` | secondary text |
| border | `#E7E2D9` | hairlines |

**Typography**
- **Manrope** — body/UI font (default).
- **Fraunces** — elegant serif used for large auth headings; brand wordmarks use
  a two-tone treatment (`job` charcoal + `finder` terracotta).

**Component overrides** — buttons (no elevation, rounded), cards (hairline
border, no shadow), outlined inputs (white fill, charcoal focus), table heads,
chips, and dialogs. `shape.borderRadius = 10`.

Fonts are loaded in `index.html` from Google Fonts.

---

## Data flow

```
React page
   │  calls a function from services/*
   ▼
api.js  (adds Bearer token; baseURL from VITE_API_BASE_URL)
   │  HTTP  /api/...   →  http://localhost:8080
   ▼
Spring Boot  (CORS → Security/JWT → Controller → Service → Repository)
   ▼
PostgreSQL
   ▲  JSON
   │
React renders response.data
```

---

## API reference (as consumed here)

**Auth**
- `POST /api/auth/register` `{ name, email, password, role }`
- `POST /api/auth/login` `{ email, password }` → `{ accessToken, user }`

**Jobs**
- `GET /api/jobs` · `GET /api/jobs/{id}`
- `POST /api/jobs` · `PUT /api/jobs/{id}` · `DELETE /api/jobs/{id}` *(recruiter)*
- `GET /api/jobs/{id}/applications` *(recruiter)*
- `PATCH /api/jobs/{jobId}/applications/{applicationId}/status` `{ status }` *(recruiter)*

**Applications** *(candidate)*
- `GET /api/applications` · `GET /api/applications/{id}`
- `POST /api/applications` · `PUT /api/applications/{id}` · `DELETE /api/applications/{id}`

Full contract lives in [`docs/api-contract.md`](../docs/api-contract.md).

---

## Gotchas & troubleshooting

- **Blank page / "React is not defined"** → `vite.config.js` must register
  `@vitejs/plugin-react` (it provides the automatic JSX runtime). It's committed;
  don't delete it.
- **`.env` change not applied** → restart `npm run dev`.
- **Requests fail only in the browser but work in Postman** → CORS origin
  mismatch (`5173` vs the backend's `app.cors.allowed-origin`).
- **Everything 401s after a while** → the JWT expired; the interceptor clears
  the session — just sign in again.
- **Status update or apply returns 403** → you're using the wrong role's
  endpoints; recruiters act through `/api/jobs/...`, candidates through
  `/api/applications/...`.
- **Duplicate "Applied" not showing after refresh** → the backend must be
  running; the page reads your history via `GET /api/applications` on mount.
- **Case-sensitive imports** → Vite is strict about file name casing
  (note the component is literally `PageHeadder.jsx`). Keep imports exact.
- **Backend code changes** → Spring Boot does **not** hot-reload; rebuild and
  restart the backend. Frontend changes hot-reload automatically.
