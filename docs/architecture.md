# Architecture

## System overview

```
Browser (React SPA, served by nginx)
   │  http://localhost:8080 (API Gateway, the ONLY public backend entry point)
   ▼
API Gateway — JWT gate, routing, CORS, rate limiting, correlation IDs,
              resolves X-Department-Id for employees (anonymous-feedback orchestration)
   ├─► Auth Service           — users, JWT, refresh rotation, admin user mgmt
   ├─► Organization Service   — orgs, departments, employee profiles, audit logs
   ├─► Survey Service         — survey CRUD, participation tracking
   ├─► Feedback Service       — anonymous feedback, CSV import, receipts
   ├─► Analytics Service      — aggregation, alerts, CSV export
   └─► Notification Service   — in-app notifications, optional SMTP

Feedback Service ◄─(poll)── Analysis Service ──► AI Service (FastAPI)
Analysis Service ──(push, best-effort)──► Analytics Service
Analytics Service ──(push, best-effort)──► Auth Service (resolve HR) + Notification Service

MongoDB: one container, one logical database per service - never shared.
```

Only `api-gateway` and `mailpit` publish host ports (see the note at the top of
`docker-compose.yml`) — the frontend and a developer's browser never talk to a microservice
directly.

## Why this many services

- **Privacy is structural.** Feedback Service's schema has no `userId` field at all. Survey
  Service tracks participation separately, with no link back to feedback content.
- **The AI pipeline fails independently.** If AI/Analysis are down, Feedback Service keeps
  accepting submissions (`analysisStatus: "pending"`); Analysis Service polls and catches up.
- **Honest trade-off:** this adds real operational complexity a small team wouldn't choose
  outside an assignment explicitly asking for a microservices demonstration.

## Request flow: anonymous feedback submission

```
Employee → POST /api/feedback {comment}
Gateway  → verifies JWT, resolves departmentId via organization-service, injects
           X-Department-Id, proxies to Feedback Service
Feedback → masks PII, generates a receipt (only its hash stored), creates the Feedback
           document — NO userId, NO IP, NO user-agent
Analysis → polls Feedback's pending queue, calls AI Service, stores the result,
           reports status back, pushes to Analytics (idempotent, dedup by feedbackId)
Analytics→ updates org-wide AND department daily rollups (DailyStat)
HR       → /api/analytics/* reads from those rollups, gated by k-anonymity
```

## Frontend architecture

React 18 + TypeScript + Vite, built as a static SPA (nginx in Docker).

```
frontend/src/
  components/ui/       Button, Card, Badge, Input, Select, Dialog, Tabs, Table, Toast
  components/domain/   SentimentBadge, PrivacyNotice, PrivacyGate, KpiCard, AlertCard, States
  components/charts/   Recharts wrappers
  components/layout/   AppShell, Sidebar, Topbar, ProtectedRoute, per-role nav config
  features/<domain>/   api.ts (axios) + hooks.ts (TanStack Query), one per backend service
  pages/public|employee|hr|admin|system/   one file per screen
  i18n/                react-i18next: fr (default) / en / ar (RTL-prepared)
  lib/                 axios instance with single-flight refresh, in-memory token store
```

State: TanStack Query owns all server state. Auth state lives in a small React context backed
by an in-memory access token plus the backend's httpOnly refresh cookie (see `docs/privacy.md`).
