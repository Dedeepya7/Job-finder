# Job Finder API

Protected endpoints require `Authorization: Bearer <accessToken>`. Access tokens are signed JWTs valid for one hour. The backend uses the user ID and role inside the token; clients must not send user IDs to claim ownership.

## Authentication

| Method | Path | Result |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Creates a candidate or recruiter; returns a safe user object with `201 Created`. |
| `POST` | `/api/auth/login` | Verifies credentials and returns a bearer access token and safe user object. |

Register request:

```json
{
	"name": "Sam Candidate",
	"email": "sam@example.com",
	"password": "a-long-password",
	"role": "CANDIDATE"
}
```

Login request:

```json
{
	"email": "sam@example.com",
	"password": "a-long-password"
}
```

Registration stores only a BCrypt password hash. Passwords must be at least 8 characters and no more than 72 UTF-8 bytes. Duplicate email returns `409 Conflict`; invalid login returns a generic `401 Unauthorized` response. The response never includes the password or hash.

Before starting the backend, set `JWT_SECRET` to a private random value of at least 32 bytes. The backend refuses to start without it; never commit the secret.

For local PowerShell testing, set it for the current terminal session before running Maven: `$env:JWT_SECRET = 'replace-with-a-private-random-value-at-least-32-bytes'`.

## Jobs

Jobs have a server-generated `id`, `title`, `companyName`, optional `description`, `location`, and `jobUrl`, recruiter reference, and server-managed timestamps. Job browsing is public; create/update/delete/applicant listing require a recruiter token. Ownership is determined from the token.

| Method | Path | Access/result |
| --- | --- | --- |
| `POST` | `/api/jobs` | Recruiter; creates an owned job; returns `201 Created`. |
| `GET` | `/api/jobs` | Public; returns all jobs. |
| `GET` | `/api/jobs/{id}` | Public; returns one job. |
| `PUT` | `/api/jobs/{id}` | Owning recruiter only. |
| `DELETE` | `/api/jobs/{id}` | Owning recruiter only; returns `204 No Content`. |
| `GET` | `/api/jobs/{id}/applications` | Owning recruiter only; returns applicants for that job. |

Example job create request (with recruiter bearer token):

```json
{
	"title": "Software Engineer",
	"companyName": "Example Inc.",
	"description": "Build backend services",
	"location": "Remote",
	"jobUrl": "https://example.com/jobs/123"
}
```

## Job applications

Base URL: `/api/applications`

All request and response bodies use JSON. Dates use ISO-8601 format (`YYYY-MM-DD`), and `status` is one of `SAVED`, `APPLIED`, `INTERVIEW`, `OFFER`, `REJECTED`, or `WITHDRAWN`.

## Job application fields

- `id`: server-generated numeric ID.
- `companyName`: required company name.
- `jobTitle`: required job title.
- `location`: optional location.
- `jobUrl`: optional job posting URL.
- `applicationDate`: required date.
- `status`: status enum; defaults to `APPLIED` when omitted.
- `candidate`: the authenticated candidate; assigned by the server and not supplied in create requests.
- `job`: required job reference, supplied as `{ "id": <jobId> }`.
- `notes`: optional notes.
- `createdAt` and `updatedAt`: server-managed timestamps.

## Endpoints

| Method | Path | Result |
| --- | --- | --- |
| `POST` | `/api/applications` | Candidate; creates an application for the authenticated candidate. |
| `GET` | `/api/applications` | Candidate; returns only their applications. |
| `GET` | `/api/applications/{id}` | Candidate; returns only their application (404 if not theirs). |
| `PUT` | `/api/applications/{id}` | Candidate; updates only their application. |
| `DELETE` | `/api/applications/{id}` | Candidate; deletes only their application. |

Example create request:

```json
{
	"companyName": "Example Inc.",
	"jobTitle": "Software Engineer",
	"location": "Remote",
	"jobUrl": "https://example.com/jobs/123",
	"applicationDate": "2026-10-16",
	"status": "APPLIED",
	"job": { "id": 2 },
	"notes": "Applied through the company site"
}
```
