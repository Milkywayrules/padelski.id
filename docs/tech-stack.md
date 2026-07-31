# Tech stack snapshot — padelski.id

**Phase:** 0 (resolved from batch grill + personal tech stack)  
**Date:** 2026-07-31  
**Status:** locked for Phase 0.5 scaffold · BMAD implements from this baseline

This document is the **project-local** stack snapshot. Personal defaults live in `knowledge-base-of-king-the-user/docs/personal/tech-stack.md`; padelski.id picks the TypeScript/Bun monorepo subset below.

## Summary

| Layer | Choice |
| --- | --- |
| Runtime / package manager | **Bun** |
| Monorepo | **Turborepo** |
| Language | **TypeScript** (strict) |
| Validation / SoT | **Zod** (infer types — no duplicate interfaces) |
| Env | **t3-env** (`APP_ENV`: `dev` \| `prod`, fail-fast) |
| Secrets | **Doppler** (`dev`, `prod`, `dev_personal`) |
| Lint / format | **Biome** + **ultracite** |
| Git hooks | **lefthook** |
| Tests | **Vitest** (unit, colocated `*.test.*`) · **Playwright** (E2E stub) |

## Frontend — `apps/web`

| Concern | Choice |
| --- | --- |
| Framework | **Next.js** (App Router, client-first, routes under `/app`) |
| UI | **Mantine** (+ shared `packages/ui`) |
| Data fetching | **TanStack Query** |
| URL state | **nuqs** |
| Forms | **React Hook Form** |
| Client UI state | **Zustand** (ephemeral only — not domain SoT) |
| Animation | **motion.dev** |
| Public env | Runtime config / server injection — **not** env-specific `NEXT_PUBLIC_*` in prod |

## Backend — `apps/api`

| Concern | Choice |
| --- | --- |
| HTTP | **Elysia** (compiled) |
| API prefix | **`/v1`** |
| OpenAPI | **Scalar** stub |
| Telemetry | **OpenTelemetry** stub |
| Realtime | **WebSocket** via `packages/ws-protocol` (`v1` stub) |

## Data & auth — packages

| Package | Choice |
| --- | --- |
| `packages/db` | **PostgreSQL** + **Drizzle ORM** (audit fields on tables) |
| `packages/auth` | **Better Auth** — GitHub OAuth now; Google later; org stub |
| `packages/email` | **Resend** + **React Email** stub |
| `packages/domain` | Hand-rolled state machines (PlaySession, Match, SlotClaim) |
| `packages/activity-log` | Append-only audit stub (distinct from ephemeral ScoreEvent) |
| `packages/env` | Shared t3-env schema |
| `packages/config` | Shared Biome/Turbo/TS config |

## Cache & infra

| Concern | Choice |
| --- | --- |
| Cache / pub-sub | **Redis** (wired in compose; used when live score/WS needs it) |
| Object storage | **Cloudflare R2** (per-env buckets — Phase 0.5 wire) |
| Containers | **Docker** + **docker-compose.yml** |
| Deploy | **Coolify v4.1.2** on Contabo VPS · Pattern A `doppler run` |
| DNS | **Cloudflare** |
| CI | **GitHub Actions** (`ci` status check) |
| IaC (optional) | **OpenTofu** (governance harness — not app runtime) |

## Authorization

| Concern | Choice |
| --- | --- |
| Base model | Scoped **RBAC** (Platform / Org / PlaySession scopes) |
| API checks | **CASL** stub — thin abilities in Phase 0.5 |
| Domain guards | State machine legal transitions before side effects |

## Explicitly not in MVP stack

| Deferred | Reason |
| --- | --- |
| **XState** | Hand-rolled domain SM + tests; deterministic, agent-friendly |
| **PWA** | Responsive web first |
| **i18n** | English-first UI; add when demand proven |
| **Prisma** | Drizzle chosen for this repo |
| **Staging env** | `dev` / `prod` / `dev_personal` only |

## Tooling & agents

| Concern | Choice |
| --- | --- |
| IDE / agents | **Cursor** · Composer 2.5 fast |
| Method | **BMAD** from Phase 1 |
| Analytics | **Umami** (when prod traffic) |
| Diagrams | **Mermaid** in docs |

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
