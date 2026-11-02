# Local development

## Full stack
```bash
cp .env.example .env
openssl rand -hex 32   # per secret, replace every "replace-me-..." placeholder
docker compose up --build
```
- App: **http://localhost:5173**
- Gateway + Swagger: **http://localhost:8080/api/docs**
- Mailpit: **http://localhost:8025**

Then seed demo data — see `seed/README.md`.

## One Node service outside Docker
```bash
cd services/<name>
npm install
npm run dev
```
Needs `MONGO_URI` and sibling `*_SERVICE_URL` env vars reachable.

## AI service (dev fallback, no heavy models)
```bash
cd services/ai-service
python3 -m venv .venv && source .venv/bin/activate
pip install fastapi "uvicorn[standard]" pydantic pydantic-settings lingua-language-detector
AI_ENGINE=lexicon AI_EAGER_LOAD=false uvicorn app.main:app --reload
```

## Frontend only
```bash
cd frontend
npm install
npm run dev         # http://localhost:5173
npm run typecheck   # tsc -b --noEmit
npm run build        # production build (same as the Dockerfile)
```

## Tests
```bash
cd services/<name> && npm test   # any backend service

cd services/ai-service
python -m venv .venv && source .venv/bin/activate
pip install fastapi "uvicorn[standard]" pydantic pydantic-settings lingua-language-detector pytest httpx
python -m pytest
```

**Caveat:** every Node service's tests mock Mongoose — none have run against real MongoDB.
"290 tests pass" means the business logic and HTTP layer are solid, not that it's been verified
against a real database. Run `docker compose up` and click through yourself.

## Code layout
Every Node service: `src/config`, `src/models`, `src/validators` (Zod), `src/services`,
`src/controllers`, `src/routes` (public + `internal`), `src/app.js`, `src/server.js`,
`src/openapi.js`. `shared/` holds the common error envelope, Zod `validate()`, JWT helpers, and
`requireAuth`/`requireRole` middleware every service reuses.
