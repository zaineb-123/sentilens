# SentiLens demo seed script

Populates a fictional demo organization so the application looks realistic immediately.

**Status: NOT VERIFIED** — never run against a live stack in the build sandbox (no Docker/MongoDB
there). Run it yourself and report any error.

## What it creates
1. Direct to MongoDB (bootstrap only — no public API to create the first org/admin by design):
   organization "Acme Sentilens Demo", 6 departments, 3 demo accounts.
2. Through the real API Gateway: one published survey, a CSV import of 110 fictional FR/EN/AR
   feedback rows, and 2 feedback items submitted directly by the demo employee.

## Run it
```bash
docker compose up --build
cd seed
npm install
MONGO_ROOT_PASSWORD=<same value as in your .env> npm run seed
```
MongoDB is not published to the host by default — temporarily add `ports: ["27017:27017"]` to
the `mongodb` service in `docker-compose.yml` to run this script from your host machine.

## Demo credentials
| Role | Email | Password |
|---|---|---|
| Admin | `admin.demo@acme-sentilens.test` | `Demo!Admin2026` |
| HR | `hr.demo@acme-sentilens.test` | `Demo!HR2026` |
| Employee | `employee.demo@acme-sentilens.test` | `Demo!Employee2026` |

Give the Analysis Service 1-2 minutes after seeding before expecting populated charts.
