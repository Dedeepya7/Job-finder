# JobFinder Backend

Spring Boot REST API for authentication, job listings, and job applications.
It uses PostgreSQL in local development and H2 for automated tests.

## Prerequisites

- Java 21.
- PostgreSQL with a database named `jobtrack_db`.

## Local setup

1. If this is a fresh database, run `database/schema.sql` in pgAdmin's Query
   Tool while connected to `jobtrack_db`. The script creates missing tables
   and indexes and is safe to rerun; it does not delete existing data or alter
   existing tables.
2. Run `.\start.ps1` from this folder. On the first run, it creates `.env` from
   `.env.example` and stops so you can set `DB_PASSWORD` to your PostgreSQL
   password.
3. Run `.\start.ps1` again. It generates and saves a private `JWT_SECRET` if
   one is not already set, then starts the API at `http://localhost:8080`.

The local `.env` file is ignored by Git. Never commit or share its secrets.
Keep the terminal open while using the app and press Ctrl+C to stop the server.

## Tests

Run the backend test suite with:

```powershell
.\mvnw.cmd test
```

Tests use an in-memory H2 database and do not require the local PostgreSQL
server or `.env` file.

See [../docs/api-contract.md](../docs/api-contract.md) for API endpoints and
request/response details.
