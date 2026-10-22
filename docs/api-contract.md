# Job applications API

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
- `notes`: optional notes.
- `createdAt` and `updatedAt`: server-managed timestamps.

## Endpoints

| Method | Path | Result |
| --- | --- | --- |
| `POST` | `/api/applications` | Creates an application; returns `201 Created` and the created record. |
| `GET` | `/api/applications` | Returns all applications. |
| `GET` | `/api/applications/{id}` | Returns one application; returns `404` if missing. |
| `PUT` | `/api/applications/{id}` | Replaces editable fields; returns `404` if missing. |
| `DELETE` | `/api/applications/{id}` | Deletes an application; returns `204 No Content` or `404` if missing. |

Example create request:

```json
{
	"companyName": "Example Inc.",
	"jobTitle": "Software Engineer",
	"location": "Remote",
	"jobUrl": "https://example.com/jobs/123",
	"applicationDate": "2026-10-16",
	"status": "APPLIED",
	"notes": "Applied through the company site"
}
```
