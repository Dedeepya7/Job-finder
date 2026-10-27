# Project Issues Postmortem

A record of the recent mistakes and blocking issues that stopped the Job-finder
project from running, what caused each one, how it was fixed, and its current
status. This is a debugging log, not a design spec.

**Stack:** Spring Boot (Java) + PostgreSQL backend on `:8080`, React 18 + Vite 6 +
MUI 6 frontend on `:5173`.

---

## Summary table

| # | Area | Symptom | Root cause | Status |
|---|------|---------|-----------|--------|
| 1 | Backend | App won't start (`jwtEncoder` bean error) | `JWT_SECRET` env var not set | Fixed (runtime) |
| 2 | Backend | Startup crash even with secret set | Secret shorter than 32 bytes | Fixed (runtime) |
| 3 | Frontend | Completely blank page | Wrong-cased import `./App.jsx` (Vite is case-sensitive) | Fixed |
| 4 | Frontend | Blank page + `React is not defined` | No `vite.config.js` → React plugin never loaded | Fixed |
| 5 | Jobs | Create/Edit job → 400 "Validation failed" | `recruiter` field marked `@NotNull` on request body | Diagnosed (fix pending) |
| 6 | Applications | Apply → 400 | Payload missing required `JobApplication` fields | Fixed (frontend) |
| 7 | Applications | List applications → 500 | `job_applications` table missing `candidate_id` / `job_id` columns | Open (needs DB fix) |
| 8 | Frontend | Filters/stats showing nothing or wrong | UI referenced backend fields that don't exist | Fixed (frontend) |
| 9 | Layout | Large empty gap between sidebar & content | Content centered with `maxWidth` + `mx:auto` | Fixed |

---

## 1 & 2 — Backend fails to start (JWT secret)

**Symptom:** Spring Boot crashes on launch with an
`UnsatisfiedDependencyException` around the `jwtEncoder` bean.

**Root cause:** `application.properties` reads `app.jwt.secret=${JWT_SECRET}` with
no default. `SecurityConfig.secretKey()` also throws if the key is under 32 bytes.
So the app fails when the variable is unset **or** too short.

**Fix:** Start the backend with a ≥32-byte secret in the same shell:
```powershell
$env:JWT_SECRET="jobtrack-dev-secret-key-change-me-please-32bytes"
cd Backend; .\mvnw.cmd spring-boot:run
```

**Lesson:** The secret is an environment variable, not a code change. Every fresh
terminal must set it before `spring-boot:run`.

---

## 3 — Blank page: case-sensitive import

**Symptom:** Frontend serves HTML but renders nothing.

**Root cause:** `main.jsx` imported `./App.jsx` while the real file is `app.jsx`.
The production build is case-insensitive on Windows so it "worked", but the Vite
dev server is case-sensitive and failed to resolve the module.

**Fix:** `import App from "./app.jsx";` (lowercase, matching the file).

**Lesson:** A passing `npm run build` does NOT prove the dev server works — Vite
dev enforces exact file-name casing.

---

## 4 — Blank page: "React is not defined" (the big one)

**Symptom:** Page is blank; console shows `React is not defined` and a React
error boundary stack pointing at `<App>`.

**Root cause:** There was **no `vite.config.js`**, so `@vitejs/plugin-react`
(listed in `package.json` but never registered) didn't load. Without it, Vite
uses the classic JSX transform, which requires `import React` in every file —
and the components don't import React. The whole app crashed before anything
rendered.

**Fix:** Created `Frontend/vite.config.js`:
```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({ plugins: [react()], server: { port: 5173, strictPort: true } });
```
Then restarted the dev server (Vite re-optimizes deps when config changes).

**Lesson:** A `200` on the HTML shell only means the server is up — it does NOT
mean React mounted. Always confirm the app actually renders in a browser.

---

## 5 — Create/Edit job → 400 "Validation failed"

**Symptom:** Publishing a job from Manage Jobs fails with a generic
"Validation failed" alert; list stays empty.

**Root cause:** The `Job` entity annotates `recruiter` with `@NotNull`, and the
controller validates the request body with `@Valid @RequestBody Job job`. The
frontend correctly does NOT send a recruiter (the service sets it from the JWT in
`JobService.create`). Validation runs before the service can populate it, so
`recruiter == null` fails the check.

**Fix (pending — backend one-liner):** remove `@NotNull` from the `recruiter`
field in `Job.java`. The DB column stays `NOT NULL` (`@JoinColumn(nullable=false)`)
and the service still assigns the recruiter before saving.

**Note:** `@Size(max = 150)` on `title` / `companyName` / `location` will also
trigger "Validation failed" if a value is too long.

---

## 6 — Apply for a job → 400

**Symptom:** Clicking Apply returned a 400.

**Root cause:** The frontend only sent `{ jobId }`, but `JobApplication` requires
`companyName`, `jobTitle`, `applicationDate`, `status`, and a `job` reference.

**Fix:** Frontend now sends the full payload (`job.id`, `jobTitle`, `companyName`,
`location`, `jobUrl`, `applicationDate`, `status`, `notes`).

---

## 7 — List applications → 500 (still open)

**Symptom:** `GET /api/applications` returns 500; backend log shows Hibernate DDL
warnings at startup.

**Root cause:** The `job_applications` table is missing its `candidate_id` /
`job_id` foreign-key columns. Hibernate's `ddl-auto=update` couldn't add them as
`NOT NULL` because the existing rows contain nulls, so the ALTER silently failed
and the queries reference columns that don't exist.

**Fix (pending — stays on PostgreSQL):** drop the broken table and let Hibernate
recreate it correctly:
```sql
DROP TABLE IF EXISTS job_applications;
```
Then restart the backend. This clears the 2 bad rows but does not change the
database engine (still PostgreSQL).

---

## 8 — Frontend showing dead/incorrect data

**Symptom:** Work-mode filter returned zero results; dashboard stats always 0.

**Root cause:** UI was built around backend fields that don't exist on `Job`
(`workMode`, `salary`, `jobType`, `applicantCount`, `status`).

**Fix:** Removed the work-mode filter and salary chip; replaced the dashboard
stats with values derived from real fields (total listings, distinct locations,
added-this-week via `createdAt`).

**Convention going forward:** the frontend is aligned to the CURRENT backend
contract; missing fields are removed from the UI rather than invented.

---

## 9 — Layout gap between sidebar and content

**Symptom:** At 100% zoom on wide screens, a large empty gutter appeared between
the sidebar and the main content.

**Root cause:** `AppLayout` centered the main area with `maxWidth: 1500` +
`mx: "auto"`, so content was pushed toward the middle and no longer lined up with
the header.

**Fix:** Left-aligned the content (`ml: 0, mr: "auto"`, `maxWidth: 1600`).

---

## How to run the project cleanly

**Backend (PowerShell):**
```powershell
$env:JWT_SECRET="jobtrack-dev-secret-key-change-me-please-32bytes"
cd Backend
.\mvnw.cmd spring-boot:run
```

**Frontend (PowerShell, separate terminal):**
```powershell
cd Frontend
npm run dev
```

- Backend: http://localhost:8080  (API, headless)
- Frontend: http://localhost:5173
- CORS origin is fixed to `http://localhost:5173`.

## Two things still blocking full functionality
1. **Job posting** — needs the `@NotNull` removal on `recruiter` (backend, #5).
2. **Applications** — needs the `job_applications` table rebuilt (PostgreSQL, #7).
