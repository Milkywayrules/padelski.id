# Tech stack snapshot — padelski.id

**Phase:** 0 (resolved from batch grill + personal tech stack)  
**Date:** 2026-07-31  
**Status:** locked for Phase 0.5 scaffold · BMAD implements from this baseline

This document is the **project-local** stack snapshot. Personal defaults live in `knowledge-base-of-king-the-user/docs/personal/tech-stack.md`; padelski.id picks the TypeScript/Bun monorepo subset below.

## Summary

| Layer                     | Choice                                                              |
| ------------------------- | ------------------------------------------------------------------- |
| Runtime / package manager | **Bun**                                                             |
| Monorepo                  | **Turborepo**                                                       |
| Language                  | **TypeScript** (strict)                                             |
| Validation / SoT          | **Zod** (infer types — no duplicate interfaces)                     |
| Env                       | **t3-env** (`APP_ENV`: `dev` \| `prod`, fail-fast)                  |
| Secrets                   | **Doppler** (`dev`, `prod`, `dev_personal`)                         |
| Lint / format             | **Biome** + **ultracite**                                           |
| Git hooks                 | **lefthook**                                                        |
| Tests                     | **Vitest** (unit, colocated `*.test.*`) · **Playwright** (E2E stub) |

## Frontend — `apps/web`

| Concern         | Choice                                                                                                                                                                                                                       |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework       | **Next.js** (App Router, client-first, routes under `/app`; PlatformAdmin under `/app/platform-admin/*`)                                                                                                                                                                  |
| UI              | **Mantine** (+ shared `packages/ui`)                                                                                                                                                                                         |
| Icons           | **[lucide-animated](https://lucide-animated.com/)** (Motion + Lucide; per-icon install into `packages/ui/src/icons/`). Static **`lucide-react`** only for high-frequency score controls where hover animation would distract |
| Data fetching   | **TanStack Query**                                                                                                                                                                                                           |
| URL state       | **nuqs**                                                                                                                                                                                                                     |
| Forms           | **React Hook Form**                                                                                                                                                                                                          |
| Client UI state | **Zustand** (ephemeral only — not domain SoT)                                                                                                                                                                                |
| Animation       | **motion.dev**                                                                                                                                                                                                               |
| Public env      | Runtime config / server injection — **not** env-specific `NEXT_PUBLIC_*` in prod                                                                                                                                             |

## Backend — `apps/api`

| Concern    | Choice                                               |
| ---------- | ---------------------------------------------------- |
| HTTP       | **Elysia** (compiled)                                |
| API prefix | **`/v1`**                                            |
| OpenAPI    | **Scalar** stub                                      |
| Telemetry  | **OpenTelemetry** stub                               |
| Realtime   | **WebSocket** via `packages/ws-protocol` (`v1` stub) |

## Data & auth — packages

| Package                 | Choice                                                                                                                                                                                                                        |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/db`           | **PostgreSQL** + **Drizzle ORM** — **`auditFields`**: mandatory `createdBy` / `updatedBy` FK → users on domain tables; ScoreEvent uses `actorSlotId` for scoring actor ([ADR-0005](./adr/0005-activity-and-audit-logs.md)) |
| `packages/auth`         | **Better Auth** — GitHub OAuth now; Google later; org stub                                                                                                                                                                    |
| `packages/email`        | **Resend** + **React Email** stub                                                                                                                                                                                             |
| `packages/domain`       | Hand-rolled state machines (PlaySession, Match, SlotClaim)                                                                                                                                                                    |
| `packages/activity-log` | **Domain activity log** — durable Postgres append-only product events (e.g. `play_session.created`, `slot_claim.requested`). Timeline UI under `/app/play-sessions/*`. Distinct from **ScoreEvent** (ephemeral live scoring) and **audit trail** (PlatformAdmin). Stub today |
| `packages/audit-trail`  | **PlatformAdmin audit trail** — append-only Postgres; dual-write enum for detach, cross-tenant support, auth elevation. UI at `/app/platform-admin/audit`. New package per [ADR-0005](./adr/0005-activity-and-audit-logs.md) |
| `packages/s3-storage`   | **S3-compatible object storage** (Cloudflare R2 in prod) — client stub in `packages/s3-storage`; real uploads when avatar/asset stories ship (deferred past MVP). `R2_PREFIX` (`dev/` \| `prod/`) validated against `APP_ENV` in `packages/env` |
| `packages/env`          | Shared t3-env schema                                                                                                                                                                                                          |
| `packages/config`       | Shared Biome/Turbo/TS config                                                                                                                                                                                                  |

## Cache & infra

| Concern         | Choice                                                                                                                                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Cache / pub-sub | **Redis** — `redis` service in `docker-compose.yml`; `REDIS_URL` in `packages/env`. No `packages/redis` — `apps/api` connects directly (e.g. ioredis) for WS pub/sub fanout when live score ships. Channel contract in `packages/ws-protocol` (`padelski:v1:session:{playSessionId}`) |
| Object storage  | **S3-compatible** (`packages/s3-storage`; Cloudflare R2 in prod) — stub now; optional `R2_*` keys in `packages/env`. Real client when avatar/asset uploads ship — deferred past MVP                                                                                                 |
| Containers      | **Docker** + **docker-compose.yml**                                                                                                                                                                    |
| Deploy          | **Coolify v4.1.2** on Contabo VPS · native Docker Compose build pack · Doppler CLI in **api** container only · per-service domains (`https://host:PORT`) · no host port bindings                                                                                    |
| DNS             | **Cloudflare**                                                                                                                                                                                         |
| CI              | **GitHub Actions** (`ci` status check)                                                                                                                                                                 |
| IaC (optional)  | **OpenTofu** (governance harness — not app runtime)                                                                                                                                                    |

## Authorization

| Concern       | Choice                                                |
| ------------- | ----------------------------------------------------- |
| Base model    | Scoped **RBAC** (Platform / Org / PlaySession scopes) |
| API checks    | **CASL** stub — thin abilities in Phase 0.5           |
| Domain guards | State machine legal transitions before side effects   |

## Explicitly not in MVP stack

| Deferred        | Reason                                                       |
| --------------- | ------------------------------------------------------------ |
| **XState**      | Hand-rolled domain SM + tests; deterministic, agent-friendly |
| **PWA**         | Responsive web first                                         |
| **i18n**        | English-first UI; add when demand proven                     |
| **Prisma**      | Drizzle chosen for this repo                                 |
| **Staging env** | `dev` / `prod` / `dev_personal` only                         |

## Tooling & agents

| Concern      | Choice                         |
| ------------ | ------------------------------ |
| IDE / agents | **Cursor** · Composer 2.5 fast |
| Method       | **BMAD** from Phase 1          |
| Analytics    | **Umami** (when prod traffic)  |
| Diagrams     | **Mermaid** in docs            |

## Local dev quick reference

```bash
# Secrets from Doppler
doppler run --config dev_personal -- bun dev

# Compose (Postgres + Redis + api + web)
doppler run --config dev -- docker compose up
```

## Related ADRs

- [0001 Product foundation](./adr/0001-product-foundation.md)
- [0002 Deploy secrets Doppler Coolify](./adr/0002-deploy-secrets-doppler-coolify.md)
- [0003 Domain lifecycle and scoring](./adr/0003-domain-lifecycle-and-scoring.md)
- [0004 Object storage and Redis wiring](./adr/0004-object-storage-and-redis-wiring.md)
- [0005 Activity and audit logs](./adr/0005-activity-and-audit-logs.md)
