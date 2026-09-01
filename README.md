# Instant Mechanic — Live Operations Platform

A full-stack, real-time vehicle service platform built for Instant Mechanic's Full Stack
Developer Intern take-home assignment. Beyond the requested operations dashboard, it's a
complete three-sided platform in a single deployment: customers book a service and track it
live, mechanics manage the jobs assigned to them, and ops oversees bookings, mechanics,
customers, and revenue — all backed by one Express API and one Postgres database, with every
change reflected instantly across every open screen via WebSockets.

**Live app:** https://frontend-rho-amber-16.vercel.app
**Live API:** https://instant-mechanic.duckdns.org
**API docs:** https://instant-mechanic.duckdns.org/api-docs

### Demo accounts (password `password123` for all — also shown on the login screen)

| Role     | Email                              |
|----------|-------------------------------------|
| Ops      | `ops@instantmechanic.demo`          |
| Mechanic | `mechanic1@instantmechanic.demo`    |
| Customer | `emma_bartell@yahoo.com`            |

---

## Project Overview

Instant Mechanic needed a way to run day-to-day vehicle service operations: see what's
booked, who's working on what, and how the business is doing, updated live as it happens.
Rather than build a single read-only dashboard, this project treats the dashboard as one part
of a real product — the same backend also lets a customer actually book a service (which
auto-assigns an available mechanic on the spot) and lets a mechanic manage their own jobs from
assignment through completion. That turns the assignment's one open-ended requirement into a
system with a genuine end-to-end flow: a booking is created, live-assigned, worked, and
completed, with every party seeing the parts of that flow relevant to them, live.

## Tech Stack

**Frontend**
- React 19 + Vite, plain JavaScript
- Tailwind CSS v4
- React Router v7
- Recharts (dashboard charts)
- Socket.io-client (live updates)
- lucide-react (icons)

**Backend**
- Node.js + Express 5 (ESM)
- PostgreSQL via `pg` (no ORM — hand-written, parameterized SQL)
- Socket.io (live broadcast)
- JWT auth (`jsonwebtoken` + `bcryptjs`)
- Swagger / OpenAPI (`swagger-jsdoc` + `swagger-ui-express`)
- `@faker-js/faker` for realistic seed data

**Infrastructure**
- **Frontend:** Vercel
- **Backend:** Oracle Cloud VM, Nginx reverse proxy, HTTPS via Let's Encrypt/Certbot, process-managed with PM2
- **Database:** Neon (managed serverless Postgres)
- **Domain:** DuckDNS
- **Source control:** GitHub

## Architecture

```
React SPA (Vercel)
      │  HTTPS + WebSocket
      ▼
Nginx (Oracle VM) — TLS termination, reverse proxy
      │  proxied to 127.0.0.1 only
      ▼
Express API + Socket.io (single Node process, PM2-managed)
      │  parameterized SQL
      ▼
PostgreSQL (Neon)
```

The frontend never talks to the database directly — every read and write goes through the
Express API, which is the only thing holding a database connection. Socket.io runs on the
same HTTP server as the REST API (not a separate service): when a booking is created or its
status changes, the server updates Postgres, then broadcasts the change over the socket
connection so every open screen updates without a page reload.

**Three roles, one application.** Rather than three separate apps, this is a single React
app and a single Express API, with access controlled by role at both layers:
- **Customer** — books a service (auto-assigned to an available mechanic immediately, or left
  pending for ops to assign if everyone's busy), and sees only their own bookings.
- **Mechanic** — sees only the jobs assigned to them, and can move each one forward
  (assigned → on the way → completed).
- **Ops** — the full dashboard: overview stats, live charts, the complete bookings table with
  search/filter/sort/pagination, the mechanic roster, and the customer list, plus the ability
  to manually assign a mechanic to any booking still waiting for one.

Every request carries a JWT, and the API enforces scoping server-side — a customer's or
mechanic's queries are always narrowed to their own data regardless of what's asked for, so
the access control doesn't depend on the frontend behaving correctly.

## Local Setup

**Prerequisites:** Node.js 20+, a PostgreSQL database (e.g. a free [Neon](https://neon.tech) project).

```bash
git clone https://github.com/Bharatjagoar/InstantMechanic.git
cd InstantMechanic
```

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in DATABASE_URL, SEED_SECRET, JWT_SECRET (see below)

# Create the schema
psql "$DATABASE_URL" -f db/schema.sql

# Seed realistic sample data (550+ bookings, 60+ customers, 20+ mechanics, 10 services)
npm run dev             # start the server, then:
curl -X POST http://localhost:4000/api/seed -H "x-seed-key: <your SEED_SECRET>"

# Seed the demo login accounts (one per role)
npm run seed:users
```

The API is now running at `http://localhost:4000`, with docs at `http://localhost:4000/api-docs`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_BASE_URL=http://localhost:4000
npm run dev
```

Open the printed local URL, and log in with any of the demo accounts above.

## Environment Variables

**`backend/.env`**

| Variable       | Description                                                          |
|----------------|------------------------------------------------------------------------|
| `PORT`         | Port the API listens on (default `4000`)                              |
| `HOST`         | Interface to bind to — `0.0.0.0` for local dev, `127.0.0.1` behind a reverse proxy |
| `DATABASE_URL` | Postgres connection string                                            |
| `SEED_SECRET`  | Shared secret required in the `x-seed-key` header to call the seed endpoint |
| `JWT_SECRET`   | Signs and verifies login tokens                                       |

**`frontend/.env`**

| Variable              | Description                              |
|------------------------|------------------------------------------|
| `VITE_API_BASE_URL`   | Base URL of the backend API              |

## API Documentation

Full interactive documentation (request/response schemas, auth requirements, try-it-out) is
served from the backend at **`/api-docs`**, generated directly from JSDoc comments above each
route — the docs can't drift from the actual routes.

Major endpoints:

| Method | Path                          | Who              | Description                                      |
|--------|-------------------------------|------------------|---------------------------------------------------|
| POST   | `/api/auth/register`          | Public           | Create a customer account + first vehicle, returns a JWT |
| POST   | `/api/auth/login`             | Public           | Log in, returns a JWT                              |
| GET    | `/api/auth/me`                | Any logged-in    | Current user                                       |
| GET    | `/api/dashboard`               | Ops              | Overview stats + chart data                        |
| GET    | `/api/bookings`                 | Any logged-in    | List bookings — auto-scoped to the caller's role   |
| GET    | `/api/bookings/:id`             | Any logged-in    | Single booking (with ownership check)              |
| POST   | `/api/bookings`                  | Customer         | Create a booking (auto-assigns a mechanic if one's free) |
| PATCH  | `/api/bookings/:id/status`       | Ops, Mechanic    | Update a booking's status, broadcast live          |
| PATCH  | `/api/bookings/:id/assign`       | Ops              | Manually assign a mechanic to a pending booking     |
| GET    | `/api/mechanics`                  | Ops              | Mechanic roster with live workload stats            |
| GET    | `/api/customers`                  | Ops              | Customer list with derived stats                    |
| GET    | `/api/vehicles/mine`               | Customer         | The logged-in customer's own vehicles               |
| GET    | `/api/services`                    | Any logged-in    | Service catalog                                     |
| POST   | `/api/seed`                          | Guarded by key   | Seed the database with sample data                  |
| DELETE | `/api/delete`                        | Guarded by key   | Delete all data from every table (irreversible)     |

Live updates are pushed over Socket.io as `booking:created` and `booking:updated` events.

## Deployment

**Frontend** is deployed to **Vercel**, built from this repository with `VITE_API_BASE_URL`
pointing at the production API. A `vercel.json` rewrite ensures every client-side route
(e.g. a direct link to `/bookings`, or a page refresh) is served correctly rather than 404ing.

**Backend** runs on an Oracle Cloud "Always Free" VM:
- **Nginx** terminates HTTPS (Let's Encrypt via Certbot) and reverse-proxies to the Express
  app, which is bound to `127.0.0.1` and never directly exposed.
- **PM2** keeps the Node process running and restarts it automatically if it ever crashes.
- **DuckDNS** provides the public domain name for the free-tier VM's IP.

**Database** is a managed **Neon** Postgres instance, used by both local development and the
deployed backend.

## Future Scope

The current design is deliberately sized for its actual load — a single Node process handles
this comfortably, so no extra infrastructure has been introduced ahead of a real need. The
natural next additions if traffic grew significantly would be:

- **Socket.io horizontal scaling via Redis Pub/Sub.** If the backend ever ran as multiple
  instances behind a load balancer, the `@socket.io/redis-adapter` would let every instance
  publish and receive events through Redis, so a live update handled by one instance still
  reaches clients connected to another. This is the standard pattern for scaling WebSockets
  horizontally, and it slots in without changing how events are emitted from the controllers.
- **Caching the dashboard aggregates.** `GET /api/dashboard` computes several aggregate
  queries; at higher traffic these would be cached in Redis with a short TTL (a few seconds) —
  cheap enough to stay effectively real-time while sparing Postgres repeated identical work.
- **Rate limiting on the auth endpoints**, backed by Redis so request counts are tracked
  consistently across instances rather than in a single process's memory.
- **Token revocation** via a Redis denylist of revoked JWTs (TTL matched to token expiry), to
  support an explicit "log out everywhere" or an immediate response to a compromised account.
- **Mechanic presence**, tracking which mechanics currently have an active socket connection
  in Redis, layered on top of the existing `available`/`busy`/`offline` status column for a
  more precise live picture.

Notably, the one place Redis would *not* be the right tool is the mechanic auto-assignment
race condition — that's already handled correctly, and more simply, by Postgres's native
`SELECT ... FOR UPDATE SKIP LOCKED`, the right mechanism for a single-database system, with no
need for a distributed lock.

## AI Usage

This project was built hands-on with **Claude Code** (Anthropic) as a coding partner
throughout the entire build — from initial architecture and schema design through every
feature, the auth/role system, deployment, and debugging.

**What it was used for:** writing the React and Express code, designing the database schema
and SQL queries, building the Socket.io real-time layer, setting up the Swagger/OpenAPI docs,
configuring and executing the Oracle Cloud and Vercel deployments, generating realistic seed
data, and debugging issues as they came up (including a Nginx SPA-routing fix, a Neon DNS
resolution issue, and a live-notification scoping bug).

**How it was used:** every architectural and product decision — the framework choices,
Postgres over NoSQL, Socket.io for live updates, the three-role auth model, the auto-assign
mechanic logic, the deployment target — was discussed and decided deliberately rather than
generated blind, with the reasoning behind each one understood and defensible (see the
decisions written up alongside this README). Every feature was verified working end-to-end in
a real browser, against the live deployment, before being considered done — not just checked
by reading the code.
