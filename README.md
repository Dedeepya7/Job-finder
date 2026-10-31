# Job Finder

Job Finder is a full-stack job search application. Candidates can browse jobs
and track applications; recruiters can post jobs and manage applicants.

## Project structure

- `Frontend/` — React and Vite web application.
- `Backend/` — Spring Boot REST API.
- `Backend/database/schema.sql` — PostgreSQL tables and indexes. Safe to rerun;
  it creates missing tables and indexes without deleting existing data.
- `docs/` — API documentation and project notes.

## Prerequisites

- Node.js 18+ and npm.
- Java 21.
- PostgreSQL.

## Run locally (Windows PowerShell)

1. Create a PostgreSQL database named `jobtrack_db` in pgAdmin if it does not
   already exist.
2. For a database without the application tables, run
   `Backend/database/schema.sql` in pgAdmin's Query Tool while connected to
   `jobtrack_db`. The script does not reset existing tables or data.
3. In a PowerShell terminal, configure and start the backend:

   ```powershell
   Set-Location "C:\path\to\Job-finder\Backend"
   .\start.ps1
   ```

   On first run, the script creates `Backend/.env`. Add your local PostgreSQL
   password as `DB_PASSWORD` in that file, then run `.\start.ps1` again. The
   script generates a private JWT secret automatically. `.env` is ignored by
   Git; do not share or commit it.

4. In a second PowerShell terminal, install frontend dependencies and start
   the web app:

   ```powershell
   Set-Location "C:\path\to\Job-finder\Frontend"
   npm install
   npm run dev -- --host 127.0.0.1
   ```

5. Open <http://localhost:5173>. Use `localhost` (not `127.0.0.1`) in the
   browser so it matches the backend's configured CORS origin.

Keep both terminal windows open while using the app. Press Ctrl+C in each to
stop its server. The backend reads its database and JWT settings from
`Backend/.env`; the frontend API URL is configured by `Frontend/.env`.

## Verify changes

```powershell
Set-Location "Frontend"
npm run build

Set-Location "..\Backend"
.\mvnw.cmd test
```

See [Backend/readme.md](Backend/readme.md), [Frontend/readme.md](Frontend/readme.md),
and [docs/api-contract.md](docs/api-contract.md) for module and API details.
