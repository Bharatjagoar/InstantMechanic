# Architecture & Design Decisions

This document explains the reasoning behind the major technical and product decisions made
while building Instant Mechanic — not just what was built, but why, so every choice here is
one I can explain and defend.

## Frontend: React + Vite, plain JavaScript

The assignment allows any modern frontend technology, with Next.js, React, and TypeScript
listed as recommended options. I chose plain React with Vite over Next.js because this is an
internal operations tool with no SEO or server-rendering need — Vite gives a faster, simpler
setup for a client-rendered dashboard, and Vercel supports it natively either way. I used
JavaScript rather than TypeScript to move quickly and keep the codebase approachable, while
still keeping consistent object shapes and clear naming throughout so the lack of static types
doesn't cost clarity.

Tailwind CSS v4 handles styling, using the newer `@tailwindcss/vite` plugin approach rather
than the v3 CLI-based setup. Charts are built with Recharts, kept intentionally simple
(area charts for time series, horizontal bar charts for breakdowns) so the data is the focus.

## Backend: Node.js + Express

Express was chosen over a more opinionated framework like NestJS to keep the codebase easy to
read end-to-end without extra framework machinery, while staying in the same language as the
frontend to simplify the whole stack. Routes are deliberately thin — each one wires an HTTP
method and path to a controller function — with all query logic, validation, and response
shaping living in the controllers, and a small `routes/controllers/middleware` structure
that scales cleanly as endpoints were added (auth, bookings, mechanics, customers, vehicles,
services, seeding).

## Database: PostgreSQL over MongoDB

The domain here — customers, vehicles, mechanics, services, bookings — is inherently
relational: a booking references a customer, a vehicle, a service, and optionally a mechanic,
and the dashboard's own requirements (revenue over time, status breakdowns, category
breakdowns, search/filter/sort) are natural SQL aggregations and joins. PostgreSQL was the
clear fit both technically and for scale (hundreds of rows, not the kind of dataset that
benefits from a document store's flexible schema or horizontal scale), so I used `pg` directly
with parameterized, hand-written SQL rather than an ORM — that keeps every query visible and
easy to reason about.

**Schema highlights:**
- `bookings` is the central fact table, referencing `customers`, `vehicles`, `services`, and a
  nullable `mechanics` FK (null until a mechanic is assigned).
- Status fields use a `CHECK` constraint rather than a native Postgres `ENUM` — simpler to
  extend and easier to read.
- Nothing derived is stored: a mechanic's completed-jobs count, their last booking, and every
  dashboard aggregate are computed live from `bookings` at query time (via `LATERAL` joins and
  `FILTER`-clause aggregates), so there's exactly one source of truth and nothing can drift out
  of sync.
- Money fields use `NUMERIC(10,2)`, never floating point.
- Indexes on `bookings.status`, `scheduled_at`, and every foreign key back the dashboard's
  actual filter, sort, and pagination queries directly.
- A reusable Postgres trigger (`set_updated_at`) keeps `updated_at` timestamps accurate on
  every table without relying on the application layer to set them.

## Live updates: Socket.io

The assignment's live-dashboard requirement has three tiers — polling, Server-Sent Events, and
WebSockets — and I built the top tier: Socket.io, running on the same HTTP server as the REST
API. Rather than simulate live updates with a background timer, every live event corresponds
to a real action: a booking's status actually changes (an ops action or a mechanic advancing
their own job), or a new booking is actually created. The server updates Postgres first, then
broadcasts the resulting row to every connected client as `booking:updated` or
`booking:created`.

On the frontend, pages that show derived aggregates (the dashboard, the mechanic roster)
simply refetch on these events rather than trying to recompute totals client-side — the same
"single source of truth" principle as the schema. The bookings table instead patches the
matching row in place for a snappier feel, using the server's returned data (not an optimistic
guess) as the final answer. A toast notification system surfaces the events that are relevant
to whoever's currently logged in, scoped by role — ops sees every change across the business,
a customer only sees updates to their own bookings, and a mechanic only sees updates to jobs
assigned to them.

## Turning one dashboard into a real platform

The assignment describes a single operations dashboard, but explicitly invites turning an
open-ended requirement into "a useful product" and rewards genuine product thinking. A
dashboard that only displays data seeded once at the start doesn't demonstrate that — so I
extended the same backend and the same React app into a small three-sided platform:
authentication with three roles (customer, mechanic, ops), sharing one database and one API,
distinguished by what each role can see and do.

- **Customers** book their own service and track it.
- **Mechanics** manage the jobs assigned to them.
- **Ops** retains the full dashboard, plus the ability to step in when needed.

This maps directly onto the bonus items the assignment lists — authentication, role-based
access, and admin/operations roles — while giving the app genuine write paths beyond a single
status dropdown, and a live-update story that spans real user actions across roles rather than
one shared screen.

**Authentication** uses JWTs passed as a bearer token, checked on every protected route by a
small `requireAuth` middleware, with a `requireRole` middleware layering role checks on top.
Customers can register themselves — creating their account, their first vehicle, and logging
them in all in one step — while ops and mechanic accounts are provisioned directly, matching
how those roles actually come to exist in a real operation. A set of seeded demo accounts, one
per role, is also shown directly on the login screen, so a reviewer can explore every role
immediately without first registering one.

**Access control lives on the server, not just the UI.** A customer's or mechanic's requests
are always narrowed to their own data by the API itself — for example, `GET /api/bookings`
force-applies a `customer_id` or `mechanic_id` filter server-side depending on the caller's
role, regardless of what query parameters are sent. This single endpoint doubles as "my
bookings" for a customer and "my jobs" for a mechanic, so no duplicate endpoints were needed.
Endpoints that expose other people's contact details or business-wide revenue —
`/api/mechanics`, `/api/customers`, `/api/dashboard` — are restricted to the ops role.

**Booking creation auto-assigns a mechanic.** When a customer books a service, the backend
immediately looks for an available mechanic (using `SELECT ... FOR UPDATE SKIP LOCKED` so two
simultaneous bookings can never grab the same mechanic) and assigns them on the spot, flipping
that mechanic to busy — matching how an "instant" service actually works, rather than sitting
in a queue for a human to dispatch. Ops retains a manual assign action for the case where every
mechanic happens to be busy at the moment a booking comes in. A mechanic automatically returns
to available once their assigned job is marked completed or cancelled, keeping the available
pool accurate without any separate bookkeeping step.

**Mechanics can only move their own jobs forward** — from assigned to on the way to completed —
enforced on the server, with the frontend simply mirroring the same allowed transitions for a
clean UI.

## API design: REST with OpenAPI documentation

The assignment explicitly leaves API structure to the developer and evaluates design quality
rather than any specific shape, while separately calling out that the product doesn't need to
be architecturally maximal — a smaller, polished system is valued over an over-built one. For
a five-entity system used by one team, a clean REST API is the right level of complexity: clear
resource-oriented routes, a consistent routes/controllers split, consistent response shapes
(`{ data, pagination }` for lists, a plain object for single resources, `{ error }` for
failures), and parameterized queries throughout.

What I invested in instead of additional architectural layers was documentation: the full API
is documented with Swagger/OpenAPI, generated from JSDoc comments living directly above each
route definition, so the documentation can never silently drift from the actual endpoints. It's
served interactively at `/api-docs`, covering every request parameter, request body, response
schema, and status code, including the bearer-token security requirement on protected routes.

## Deployment

**Frontend** deploys to Vercel, as required, built directly from this GitHub repository.

**Backend** runs on an Oracle Cloud "Always Free" VM rather than AWS, reusing existing
free-tier infrastructure. The deployment follows a standard, production-style pattern: Nginx
terminates HTTPS (a free Let's Encrypt certificate via Certbot) and reverse-proxies to the
Express application, which is bound only to `127.0.0.1` and never directly reachable from the
internet; PM2 supervises the Node process, restarting it automatically if it ever exits; and a
free DuckDNS domain provides a stable hostname for the VM's IP address. Both the local
development environment and the deployed backend share a single managed **Neon** Postgres
database, so there's one consistent source of data throughout development and in production.

## Seeding realistic data

Sample data is generated through a guarded API route (`POST /api/seed`, protected by a
shared-secret header) rather than a one-off script, using `@faker-js/faker` for names, emails,
and phone numbers, with weighted distributions for booking and mechanic status so the seeded
dashboard reflects a real, uneven operation rather than uniform random noise. It produces 550+
bookings, 60+ customers, 90+ vehicles, 22 mechanics, and 10 services across multiple service
categories — comfortably above the assignment's stated minimums — inserted via chunked
multi-row statements for efficiency. A separate, additive seeding step
(`npm run seed:users`) creates one demo login account per role, linked to real seeded
customer and mechanic records.

A companion route, `POST /api/delete`, wipes every table — including login accounts — using
the same shared-secret guard as `/seed`. It's a full reset rather than a re-seed: nothing is
repopulated afterward, so it's meant for deliberately starting from a completely empty
database, not for everyday use.
