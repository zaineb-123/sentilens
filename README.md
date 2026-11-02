# SentiLens: Understand feedback. Improve the workplace.

AI-powered employee feedback intelligence — microservices backend (Node/Express + Python/FastAPI),
React frontend, MongoDB, Docker. University project, ISET Mahdia (MDW).

## 1. What was implemented

**Backend — 8 Node microservices + 1 Python AI service + API Gateway:**

| Service | Responsibility | Tests |
|---|---|---|
| AI Service (FastAPI) | Language detection (FR/EN/AR), sentiment incl. Mixed, emotions, aspect-based sentiment | 28 pass, 3 skipped* |
| Auth Service | Invite-only registration, JWT, refresh rotation, admin user management | 47 |
| Organization Service | Orgs, departments, employee profiles, k-anonymity threshold, audit logs | 21 |
| Survey Service | CRUD, multilingual questions, publish/close, participation tracking | 27 |
| Feedback Service | Anonymous submission (no userId/IP/UA), receipts, PII masking, CSV import | 42 |
| Analysis Service | MongoDB job queue: Feedback → AI, retries, attempts | 12 |
| Analytics Service | Aggregation, k-anonymity + complementary suppression, alerts, CSV export | 53 |
| Notification Service | In-app notifications, optional SMTP (Mailpit) | 18 |
| API Gateway | Single entry point, JWT gate, routing, department-header orchestration, merged Swagger, health monitoring | 42 |

**262 Node tests + 28 Python tests = 290 tests, all passing.**

**Frontend — complete React + TypeScript + Vite SPA. `npm run build` succeeds: zero TypeScript
errors, 2664 modules transformed into a production bundle.**

- Design system: Tailwind tokens (navy/indigo primary, teal/orange/red/violet semantic colors),
  Inter font, component library on Radix primitives (Button, Card, Badge, Input, Select, Dialog,
  Tabs, Table, Toast) plus domain components (SentimentBadge, EmotionBadge,
  **PrivacyNotice/PrivacyGate**, KpiCard, AlertCard, Empty/Error/Loading states).
- i18n: French (default) and English at full parity; Arabic prepared with RTL (nav/auth/system
  translated, rest honestly partial — see limitations).
- Auth: real JWT flow, in-memory access token (never localStorage), httpOnly refresh cookie,
  single-flight silent refresh, role-based protected routes.
- **40+ screens**, all wired to real API calls (TanStack Query), no permanent mock data:
  Public (Landing, How It Works, Privacy, Login, Register, Forgot/Reset Password, Demo),
  Employee (Dashboard, Surveys, dynamic survey answering, Anonymous feedback, Success+receipt
  with live AI-processing poll, Participation history, Profile, Privacy settings),
  HR (Dashboard, Sentiment, Emotions, Aspects, Trends, Department comparison with complementary
  suppression UI, Feedback Explorer + CSV import, Survey management, **Survey Builder**, Survey
  Results, Alerts, Reports/CSV export), Admin (Dashboard, Users with invite dialog, Organizations
  with live threshold editing, Departments, Roles — honest static display, Audit Logs, live
  Monitoring, Settings), System (404, Unauthorized, Service Unavailable, Notification Center).
- Charts: Recharts (sentiment pie, trend area, emotion/aspect bars), rendered only after passing
  the privacy gate.

**Also implemented:** 3 small, tested backend additions the frontend genuinely needed (admin
user management on Auth, aggregated system health on the Gateway, CSV export on Analytics);
`frontend/Dockerfile` (multi-stage Vite build → nginx, SPA fallback) wired into
`docker-compose.yml`; `seed/seed.js` (bootstraps a fictional org + 3 demo accounts directly in
MongoDB, then uses the **real API** to publish a survey, import 110 fictional FR/EN/AR feedback
rows via CSV, and submit 2 feedback items — exercising the genuine pipeline, not fake rows);
`docs/architecture.md`, `docs/api.md`, `docs/privacy.md`, `docs/development.md` (+ `docs/ai.md`).

## 2. What tests passed (and how)

**UNIT TESTED** (actually run, passing): all 290 backend tests; frontend `npx tsc -b --noEmit`
(zero errors, forced non-incremental); frontend `npx vite build` (succeeds, 2664 modules).

**NOT VERIFIED:** `docker compose up --build` has never been executed; no backend service has
been tested against real MongoDB (all 262 Node tests mock Mongoose); the frontend has never been
opened in a real browser against a live backend; `seed/seed.js` has never been run; the AI
service has never run its real Hugging Face models (lexicon dev fallback only).

**INTEGRATION TESTED:** none, strictly — nothing here crosses a real process boundary with a
real database. The next real integration test is: run `docker compose up --build`, run the seed
script, and click through the app yourself.

## 3. Exact commands to run locally

```bash
cd sentilens
cp .env.example .env
openssl rand -hex 32   # generate secrets, replace every "replace-me-..." placeholder in .env

docker compose up --build
# First build downloads AI models (several GB) - can take several minutes.

cd seed
npm install
MONGO_ROOT_PASSWORD=<same value as in .env> npm run seed
# See seed/README.md if MongoDB isn't reachable from your host.
```

## 4. Exact URL to open

**http://localhost:5173**

(Gateway + Swagger: http://localhost:8080/api/docs; Mailpit: http://localhost:8025.)

## 5. Demo credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin.demo@acme-sentilens.test` | `Demo!Admin2026` |
| HR | `hr.demo@acme-sentilens.test` | `Demo!HR2026` |
| Employee | `employee.demo@acme-sentilens.test` | `Demo!Employee2026` |

Fictional accounts, fictional organization ("Acme Sentilens Demo"). Use `/demo` on the frontend
for one-click login.

## 6. Known limitations — read before your defense

- **Nothing has been run against a real database or in a real browser.** Budget time to run
  `docker compose up`, fix whatever breaks, and click through before presenting.
- **AI models unverified** — `AI_ENGINE=transformers` has never executed here (no Hugging Face
  Hub access). Verify model licenses and run `AI_RUN_MODEL_TESTS=1 pytest
  tests/test_transformers_engine.py` yourself — see `docs/ai.md`.
- **Arabic translation is partial** (nav/auth/system only), not full parity. RTL direction
  switching works today.
- **Roles & Permissions is a static display**, not configurable — backend has exactly 3 fixed
  roles, no granular permission model.
- **Reports/export is CSV only** — no PDF.
- **No automated end-to-end test** (Playwright/Cypress).
- **Shrinking a department below threshold doesn't retroactively hide historical rollups** —
  documented gap in `docs/privacy.md`.
- **Participation rate KPI** on the HR dashboard is a placeholder (`—`).
- Production bundle is a single ~1.1MB JS chunk (320KB gzipped) — code-splitting would be the
  natural next optimization.

## 7. Repository layout

```
sentilens/
├── frontend/                 React + Vite + TypeScript SPA
├── services/                 api-gateway, auth, organization, survey, feedback,
│                              analysis, analytics, notification, ai-service
├── shared/                   Common error envelope, JWT/RBAC middleware (Node)
├── seed/                     Demo data script
├── docs/                     architecture.md, api.md, privacy.md, development.md, ai.md
├── docker-compose.yml
├── .env.example
└── README.md
```
