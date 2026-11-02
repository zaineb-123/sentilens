# API reference

All public endpoints go through the **API Gateway** at `http://localhost:8080`. Full interactive
docs are at **`http://localhost:8080/api/docs`** (merged from every service's `src/openapi.js`).

## Auth (`/api/auth/*`) — public, no gateway-level JWT gate
`POST /register` (invite-only) · `POST /login` · `POST /refresh` · `POST /logout` ·
`POST /forgot-password` · `POST /reset-password` · `GET /me` (requires JWT) ·
`GET /users`, `POST /users/invite`, `PATCH /users/:id/status` (**admin**)

## Organization
`/api/organizations`, `/api/departments`, `/api/audit-logs`, `/api/settings`, `/api/me/profile` —
JWT required; role checks (`admin` for management, `hr` read access) enforced by the service.

## Survey (`/api/surveys*`, `/api/me/participations`)
`hr`: full CRUD + `/publish`, `/close`, `/:id/participation`. `employee`: `/surveys/available`,
`/surveys/available/:id`, `/me/participations` (gateway-injected with `X-Department-Id`).

## Feedback (`/api/feedback*`)
`employee`: `POST /feedback` (`{surveyId, answers}` or `{comment}`), `GET /feedback/receipt/:code`.
`hr`: `GET /feedback` (explorer, k-anonymity gated), `POST /feedback/import` (CSV),
`GET /feedback/batches/:id`.

## Analytics & Alerts (`hr` only)
`overview`, `sentiment`, `emotions`, `aspects`, `trends`, `departments`, `export` (CSV) — every
response includes a `privacy` object; check `privacy.suppressed` before rendering numbers.
`GET/PATCH /api/alerts*`.

## Notifications
`GET /api/notifications` (optional `?unread=true`), `GET /unread-count`, `PATCH /:id/read`.

## System (`admin` only)
`GET /api/system/health` — aggregates every backend service's own `/health`.

## Error format
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "invalid request", "details": [...] } }
```
Codes: `VALIDATION_ERROR` (422), `UNAUTHORIZED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404),
`CONFLICT` (409), `UPSTREAM_UNAVAILABLE` (503).
