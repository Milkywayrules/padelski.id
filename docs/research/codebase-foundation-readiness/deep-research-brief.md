# Deep research brief — Codebase foundation readiness for Phase 1

**Phase:** padelski.id Phase 0 Wave 3 (T1)  
**Question:** What must this monorepo prepare for agreed intents — packages layout, auth multi-tenant org stub, `/app` vs marketing, ws-protocol live score, CASL scoped RBAC, index strategy for player profile, agent harness BMAD handoff, Phase 0.5 scaffold gaps?  
**Pre-flight:** depth `adversarial-deep` · output `files-only` · path `./docs/research/codebase-foundation-readiness/` · source-boundary `public-extended` · languages English  
**Execution:** degraded T1 sequential single-context (subagent constraint); verify-before-cite on repo audit + external vendor docs  
**Date:** 2026-07-31  

---

## answer

The monorepo **Phase 0.5 scaffold is ~65% complete** — Turborepo packages, domain state machines, CI, and Doppler/Coolify wiring exist and tests pass [6][7][8]. **Phase 1 BMAD must not start feature work until eight foundation gaps close** (below). Agreed product intents from ADRs and domain spec are **documented and partially stubbed in code**, but **persistence, authorization scopes, realtime protocol, and app routing shells are not yet aligned** with locked vocabulary [1][2][3][5].

### Headline: what Phase 0.5 must finish before Phase 1

| # | Intent area | Current state | Must prepare before BMAD vertical slice |
| --- | --- | --- | --- |
| 1 | **Packages layout** | 10 packages + 2 apps; domain SM complete; db/auth/ws stubs only [6][7][8] | Add domain Drizzle tables + migrations; wire api→db→auth; optional `packages/scoring` facade stub |
| 2 | **Auth + multi-tenant Org stub** | Better Auth + `organization()` plugin factory; generic `users`/`organizations` tables [9][10] | Run Better Auth org migration; Player fields (nickname, full_name); membership roles; PlatformAdmin flag |
| 3 | **`/app` vs marketing** | Single root `page.tsx` marketing placeholder; no `(marketing)` / `(app)` route groups [11] | Route groups: public marketing at `/`, authenticated product under `/app/*`; auth gate layout |
| 4 | **ws-protocol live score** | v1 envelope + ping/pong only [8] | Zod schemas for `score_event`, `match_score_snapshot`, `spectator_join`; Redis channel naming contract |
| 5 | **CASL scoped RBAC** | Flat roles `member\|organizer\|admin`; no PlaySession/Org conditions [7] | Rewrite to PlatformAdmin, OrgAdmin, OrgMember, Organizer, Participant with `{ playSessionId, orgId }` conditions [2][12] |
| 6 | **Player profile indexes** | Spec only in domain doc [5]; db has no `slots`/`matches`/`player_stats` | Implement indexes + `player_match_participation` projection per domain spec |
| 7 | **BMAD agent harness handoff** | `docs/bmad-handoff/PHASE-1-READY.md` + `.bmad-loop/policy.toml` present [13] | Close G0.5 gates (Doppler local, Coolify VPS smoke); no code change |
| 8 | **Phase 0.5 infra gaps** | Compose + CI green; no WS handler, no auth routes, no R2, no runtime `/api/config` [4][14] | API WS upgrade route; Better Auth mount; runtime config endpoint; R2 env keys in t3-env |

### Packages layout — target vs actual

**Agreed layout** (Turborepo, Bun, Zod SoT) [4]:

```text
apps/
  web/          Next.js App Router — marketing + /app product shell
  api/          Elysia /v1 REST + WebSocket upgrade
packages/
  domain/       Pure state machines (PlaySession, Match, SlotClaim) ✅
  db/           Drizzle schema + migrations — stub only ⚠️
  auth/         Better Auth + CASL abilities — partial ⚠️
  ws-protocol/  Versioned WS envelopes — ping/pong only ⚠️
  env/          t3-env shared schema ✅
  ui/           Mantine theme + provider ✅
  activity-log/ Audit append stub (≠ ScoreEvent) ✅
  email/        Resend stub ✅
  config/       Shared TS/Biome ✅
```

**Phase 1 additions (defer implementation, reserve names):**

| Package / module | When | Rationale |
| --- | --- | --- |
| `packages/domain/src/scoring/` or `packages/scoring` | Phase 1 epic 2 | FIP-aligned + Rotation Social engines behind adapter [15] |
| `packages/db` domain tables | Phase 0.5 closeout | PlaySession, Slot, Match, ScoreEvent, SlotClaim, player_stats |
| `apps/api/src/ws/` | Phase 0.5 closeout | Live score fanout + spectator read channel [3] |

Dependency rule: **`apps/*` → `packages/*` only**; domain package stays free of DB/HTTP imports [4].

### Auth multi-tenant Org stub

**Locked intent:** GitHub OAuth now; Google later; nickname + full_name at signup; Org scope deferred for MVP PlaySession logic except Player membership [2]. Better Auth `organization()` plugin is the agreed stub [10].

**Prepare in Phase 0.5:**

1. **Schema** — Better Auth core tables + org plugin tables (`organization`, `member`, `invitation`) via `auth migrate` or hand-written Drizzle equivalent [10].
2. **Player profile** — extend user with `nickname` (unique public), `full_name` (private), `platform_admin` boolean (PlatformAdmin) [1][2].
3. **Org roles stub** — `OrgAdmin`, `OrgMember` on membership record; no Org-scoped PlaySession features in MVP [1].
4. **API mount** — `createAuthStub()` mounted at `/api/auth/*` on Elysia; web client uses Better Auth React client.
5. **Session → ability context** — map session user + PlaySession membership + Org membership into CASL builder input.

**Explicitly defer:** Google OAuth, email/password, Org billing, club SaaS features [2].

### `/app` vs marketing split

**Agreed pattern** [4][13]: client-first Next.js; product routes under `/app`; marketing/public at site root.

**Recommended route tree (Phase 0.5 shell only):**

```text
apps/web/src/app/
  (marketing)/
    layout.tsx          # public chrome, no auth required
    page.tsx            # landing / value prop (move current home here)
  (app)/
    layout.tsx          # auth gate, app chrome, TanStack Query provider
    app/
      page.tsx          # dashboard stub
      sessions/
        page.tsx        # PlaySession list stub
        [id]/
          page.tsx      # live score shell stub
      profile/
        page.tsx        # player history stub
  layout.tsx            # root Mantine provider (existing)
  api/
    config/route.ts     # runtime public config (ADR-0002: no prod NEXT_PUBLIC bake) [14]
```

Spectator share links should live **outside** `(app)` auth gate — e.g. `/watch/[token]` under `(marketing)` or a dedicated `(spectator)` group with read-only WS client [3].

### ws-protocol live score

**Current:** `WS_PROTOCOL_VERSION = "v1"`; generic envelope `{ v, type, payload }`; ping/pong only [8].

**Must add before Phase 1 scoring epic:**

| Message type | Direction | Purpose |
| --- | --- | --- |
| `session.subscribe` | C→S | Join PlaySession channel (auth or spectator token) |
| `session.unsubscribe` | C→S | Leave channel |
| `score_event.append` | S→C (broadcast) | New ScoreEvent (+1, −1, type, undo ref) |
| `match.score_snapshot` | S→C | Projected score state per Match |
| `session.status` | S→C | PlaySession lifecycle change |
| `error` | S→C | Protocol / auth errors |

**Infra contract:** Redis pub/sub channel `padelski:v1:session:{playSessionId}`; api WS handler validates envelope with Zod before fanout [4]. Spectator tokens are **read-only** — server rejects `score_event.append` from spectator role [3].

### CASL scoped RBAC

**Locked roles** [1][2]: PlatformAdmin (platform scope), OrgAdmin/OrgMember (org scope, future), Organizer/Participant (PlaySession scope).

**Current stub mismatch** [7]: uses generic `member|organizer|admin` without conditions — does not model Platform vs Org vs PlaySession scopes.

**Phase 0.5 target ability matrix (stub + tests):**

| Role | Scope | Example rules |
| --- | --- | --- |
| PlatformAdmin | Platform | `manage` all subjects (support path) |
| OrgAdmin | Org | `manage` Organization `{ orgId }`; read Org members |
| OrgMember | Org | `read` Organization `{ orgId }` |
| Organizer | PlaySession | `manage` PlaySession `{ playSessionId }`; `approve` SlotClaim same session |
| Participant | PlaySession | `read` PlaySession/Match; `create` ScoreEvent on held Slot |
| Spectator | PlaySession | `read` Match score only — no ScoreEvent create |

Use CASL **conditions** on rules (e.g. `{ organizerId: user.id }`, `{ playSessionId }`) per vendor pattern [12]. Integrate with `@casl/ability/extra` or manual guards in Elysia handlers until Drizzle query filtering is needed in Phase 1.

### Player profile index strategy

**Locked query pattern** [5]: history attaches to `slotId`; profile queries by `playerId` via slot participation — never nickname scan.

**Phase 0.5 schema + indexes to implement:**

| Table / index | Definition | Purpose |
| --- | --- | --- |
| `slots(player_id)` partial WHERE `player_id IS NOT NULL` | B-tree partial | All sessions for Player |
| `slots(play_session_id)` | B-tree | Session roster |
| `matches(play_session_id, status)` | Composite | Session match list |
| `player_match_participation(player_id, finished_at DESC)` | Composite | **Primary profile timeline** |
| `play_sessions(scheduled_at)` | B-tree | Date-range filter |
| `player_stats(player_id)` PK | Rollup row | O(1) W/L dashboard (update on Match finish) [5] |

At MVP scale (~12M slot rows theoretical), partial indexes + cursor pagination suffice; materialized participation projection avoids expensive joins on every profile load [5].

### Agent harness BMAD handoff

**Ready artifacts** [13]:

- Frozen vocabulary: `CONTEXT.md` [1]
- ADRs 0001–0003 [2][3][14]
- Domain spec + research briefs (R1–R3) [5][15][16]
- `.bmad-loop/policy.toml` — Cursor adapter, `composer-2.5`, per-epic gates
- `docs/learnings/README.md` — promotion flow for contradictions

**BMAD entry sequence:** load CONTEXT + ADRs → `bmad-create-prd` → sprint planning → first vertical **PlaySession setup→archive → ScoreEvent WS → SlotClaim → profile history** [13].

**Do not re-litigate** without superseding ADR: recreational unofficial realm, ScoreEvent purge on archive, GitHub-first OAuth, Pattern A Doppler, Zod SoT, no XState [2][14].

### Phase 0.5 scaffold gap summary

| Gate | Status | Blocker for Phase 1? |
| --- | --- | --- |
| `bun run typecheck && test && build` | ✅ Green (2026-07-31 audit) | No |
| Domain SM tests match ADR-0003 | ✅ 24 tests pass | No |
| Drizzle domain schema + migrations | ❌ Missing | **Yes** |
| Better Auth mounted + org migration | ❌ Factory only | **Yes** |
| CASL aligned to scoped roles | ❌ Flat stub | **Yes** |
| ws-protocol score message schemas | ❌ ping/pong only | **Yes** (before scoring epic) |
| `/app` route group shell | ❌ Missing | **Yes** |
| Profile indexes in schema | ❌ Spec only | **Yes** (before profile epic) |
| API WebSocket handler | ❌ Missing | **Yes** (before scoring epic) |
| Doppler `dev_personal` local smoke | ⚠️ Unverified in this run | **Yes** (G0.5) |
| Coolify VPS `scripts/coolify/up.sh` | ⚠️ Unverified in this run | **Yes** (G0.5) |
| Runtime `/api/config` | ❌ Missing | Soft (before prod deploy) |
| R2 env wiring | ❌ Missing | No (defer to asset upload stories) |
| Playwright E2E stub | ❌ Not present | No |

---

## reasoning

1. **Intent stack** — Synthesized locked decisions from `CONTEXT.md`, ADR-0001/0003, `docs/tech-stack.md`, and `docs/domain/play-session-model.md` [1][2][3][4][5]. These are T0 internal sources for this repo.

2. **Code audit (Hunter/Practitioner)** — Read `packages/*` and `apps/*` implementations. Domain state machines match ADR-0003 transitions. DB schema stops at generic `users`/`organizations`. Auth exports `createAuthStub` with org plugin but no route mount. ws-protocol stops at ping/pong. Web app has no `/app` segment [6][7][8][9][11].

3. **External alignment (Practitioner)** — Better Auth organization plugin requires DB migration and client plugin for membership roles [10]. CASL supports record-level conditions required for PlaySession-scoped Organizer rules [12].

4. **Research crosswalk** — Competitor gaps validate Phase 1 wedge order: PlaySession + ScoreEvent + spectator before SlotClaim breadth [16]. Padel domain research defines scoring engine presets for Phase 1 `packages/scoring` adapter, not Phase 0.5 [15].

5. **Skeptic** — Claim "65% complete" is judgment on checklist weighting, not measured LOC. Coolify/Doppler smoke unverified in this run — flagged in ## unverified. CASL `@casl/prisma` integration deferred until Drizzle query helpers exist (no official `@casl/drizzle` parity).

6. **Arbiter** — No conflict between ADR role names and CASL stub; stub is **intentionally simplified** and must expand, not replace, ADR vocabulary. `/app` path vs Next route group `(app)` is naming: product URL prefix `/app/*` is locked [4]; implementation uses App Router group `(app)/app/...` or flat `app/` directory — team should pick one convention in Phase 0.5 story.

---

## confidence

**Overall headline: 82/100** (internal-audit pack; repo-verified claims weighted 2×)

Scores are structured estimates, not statistical certainty.

### Axis legend

| Code | Axis | What it measures |
| ---- | ---- | ---------------- |
| SQ | Source Quality | Authority and tier of sources (T0–T3) |
| EC | Evidence Convergence | Independent sources agreeing |
| CG | Claim Grounding | How well excerpts support the claim |
| CO | Coverage | Scope, geography, time, alternatives explored |
| VR | Verification Rigor | Fetch success, ledger quality, recency |

### Per-claim breakdown

#### Claim: Phase 0.5 scaffold is incomplete for Phase 1 vertical slice (8 gap areas)

| Axis | Score | Rationale |
| ---- | ----- | --------- |
| SQ | 95 | Direct repo file audit [6][7][8][9][11] + ADRs [2][3] |
| EC | 88 | PHASE-1-READY checklist aligns [13] |
| CG | 90 | Each gap maps to missing file or stub |
| CO | 85 | All eight user question areas covered |
| VR | 92 | Tests run 2026-07-31; files read same day |
| **Headline** | **88** | |

Weakest axis: **CO** (VPS smoke not executed here).

#### Claim: CASL stub must gain PlaySession/Org conditions before API authorization

| Axis | Score | Rationale |
| ---- | ----- | --------- |
| SQ | 90 | ADR-0001 roles [2] + CASL conditions docs [12] |
| EC | 85 | Internal spec + external vendor pattern agree |
| CG | 88 | Current `abilities.ts` lacks conditions [7] |
| CO | 80 | Instance-level enforcement in services deferred to Phase 1 |
| VR | 90 | Both sources verified |
| **Headline** | **86** | |

Weakest axis: **CO**.

#### Claim: ws-protocol needs score/spectator message types beyond ping/pong

| Axis | Score | Rationale |
| ---- | ----- | --------- |
| SQ | 92 | ADR-0003 spectator + ScoreEvent [3]; code audit [8] |
| EC | 90 | Domain spec + ADR converge |
| CG | 95 | ping/pong only in source |
| CO | 88 | Redis channel naming is convention not yet codified |
| VR | 92 | Verified |
| **Headline** | **91** | |

Weakest axis: **CO**.

#### Claim: Player profile requires participation projection + indexes before scale

| Axis | Score | Rationale |
| ---- | ----- | --------- |
| SQ | 95 | Domain spec explicit [5] |
| EC | 70 | Single internal source; no load test |
| CG | 92 | Index list verbatim from spec |
| CO | 75 | Scale numbers are illustrative |
| VR | 90 | Spec verified; schema not implemented |
| **Headline** | **84** | |

Weakest axis: **EC**.

---

## conflicts

1. **Role naming: CASL `admin` vs ADR `PlatformAdmin`/`OrgAdmin`** [2][7] — Current stub collapses platform and org into one `admin` role. **Resolution:** rename in Phase 0.5 to ADR vocabulary; use conditions to separate scopes.

2. **Next.js `/app` directory vs URL `/app`** [4][11] — Next reserves `app/` for App Router root. **Resolution:** use route group `(app)` with nested `app/` segment for URL prefix, or middleware rewrite — document choice in tech-stack addendum.

none otherwise.

---

## unverified

| Item | Why unverified | Follow-up |
| --- | --- | --- |
| Doppler `dev_personal` loads all t3-env keys locally | Not executed in this audit run | Operator smoke per ADR-0002 G0.5 [14] |
| Coolify v4.1.2 Pattern A on VPS | No VPS access in this run | Run `scripts/coolify/up.sh` on Contabo |
| Better Auth org plugin schema with Drizzle (not Prisma) | Plugin docs show Prisma migrate path [10] | Spike: hand-map org tables to Drizzle |
| `@casl/drizzle` query filtering | No first-party package verified | Manual guards Phase 1; evaluate custom helper |
| Playwright E2E stub existence | tech-stack mentions stub; no `playwright.config` found | Add in Phase 1 or update tech-stack |

If `verasic-fusion` is installed, paste `## unverified` into manual `brief-research` follow-up — opinions only, not ledger verification.

---

## references

[1] padelski.id contributors, "CONTEXT.md — ubiquitous language," repo root, 2026. Available: `CONTEXT.md`. Accessed: 2026-07-31.

[2] padelski.id contributors, "ADR-0001 Product foundation," docs/adr/, 2026-07-31. Available: `docs/adr/0001-product-foundation.md`. Accessed: 2026-07-31.

[3] padelski.id contributors, "ADR-0003 Domain lifecycle and scoring," docs/adr/, 2026-07-31. Available: `docs/adr/0003-domain-lifecycle-and-scoring.md`. Accessed: 2026-07-31.

[4] padelski.id contributors, "Tech stack snapshot," docs/, 2026-07-31. Available: `docs/tech-stack.md`. Accessed: 2026-07-31.

[5] padelski.id contributors, "PlaySession domain model," docs/domain/, 2026-07-31. Available: `docs/domain/play-session-model.md`. Accessed: 2026-07-31.

[6] padelski.id contributors, "packages/domain state machines," packages/domain/src/, 2026-07-31. Accessed: 2026-07-31.

[7] padelski.id contributors, "packages/auth CASL abilities stub," packages/auth/src/abilities.ts, 2026-07-31. Accessed: 2026-07-31.

[8] padelski.id contributors, "packages/ws-protocol v1 stub," packages/ws-protocol/src/index.ts, 2026-07-31. Accessed: 2026-07-31.

[9] padelski.id contributors, "packages/db schema stub," packages/db/src/schema/index.ts, 2026-07-31. Accessed: 2026-07-31.

[10] Better Auth, "Organization plugin," better-auth.com/docs, 2026. Available: https://www.better-auth.com/docs/plugins/organization. Accessed: 2026-07-31.

[11] padelski.id contributors, "apps/web root page," apps/web/src/app/page.tsx, 2026-07-31. Accessed: 2026-07-31.

[12] S. Stalniy, "@casl/ability README — conditions and defineAbilitiesFor," GitHub, 2026. Available: https://github.com/stalniy/casl/blob/master/packages/casl-ability/README.md. Accessed: 2026-07-31.

[13] padelski.id contributors, "Phase 1 ready — BMAD handoff," docs/bmad-handoff/, 2026-07-31. Available: `docs/bmad-handoff/PHASE-1-READY.md`. Accessed: 2026-07-31.

[14] padelski.id contributors, "ADR-0002 Deploy secrets Doppler Coolify," docs/adr/, 2026-07-31. Available: `docs/adr/0002-deploy-secrets-doppler-coolify.md`. Accessed: 2026-07-31.

[15] padelski.id contributors, "Padel domain official sources — deep research brief," docs/research/padel-domain-official-sources/, 2026-07-31. Available: `docs/research/padel-domain-official-sources/deep-research-brief.md`. Accessed: 2026-07-31.

[16] padelski.id contributors, "Competitor gaps USP — deep research brief," docs/research/competitor-gaps-usp/, 2026-07-31. Available: `docs/research/competitor-gaps-usp/deep-research-brief.md`. Accessed: 2026-07-31.

---

## recommendation

### Phase 1 readiness checklist (for BMAD orchestrator)

Copy into sprint `PHASE-1-READY` gate story:

**G0 — Spec frozen (done)**

- [x] CONTEXT.md + ADR 0001–0003
- [x] Domain model + research R1–R3
- [x] BMAD handoff doc

**G0.5 — Monorepo foundation (close before first story)**

- [x] Turborepo + Biome + lefthook + CI `ci` job green
- [x] Domain SM tests (PlaySession, Match, SlotClaim)
- [ ] Drizzle schema: PlaySession, Slot, Match, ScoreEvent, SlotClaim, player_stats, participation projection
- [ ] Drizzle migrations applied locally
- [ ] Better Auth mounted on api + org plugin tables
- [ ] Player fields: nickname, full_name, platform_admin
- [ ] CASL abilities: PlatformAdmin, OrgAdmin, OrgMember, Organizer, Participant + conditions + tests
- [ ] ws-protocol: score + spectator message schemas (Zod) + tests
- [ ] apps/web: `(marketing)` + `(app)` route group shells + auth layout stub
- [ ] apps/api: WebSocket upgrade handler (ping + session.subscribe stub)
- [ ] Runtime `/api/config` route (web)
- [ ] `doppler run --config dev_personal -- bun dev` smoke
- [ ] `scripts/coolify/up.sh` on VPS v4.1.2 smoke

**G1 — First BMAD vertical slice (after G0.5)**

- [ ] PlaySession CRUD + lifecycle (setup→archived)
- [ ] Live ScoreEvent append + WS fanout
- [ ] Spectator read-only link
- [ ] SlotClaim Organizer approve flow
- [ ] Player profile paginated history (indexed path)

**Explicitly defer past G1:** booking integration, Google OAuth, Org admin UI, federation ranking, PWA, Americano/Mexicano scoring UI, R2 uploads.

### Suggested Phase 0.5 closeout story order

1. DB schema + indexes (unblocks everything)
2. Auth mount + Player profile fields + org stub migration
3. CASL scoped rewrite
4. ws-protocol message schemas + API WS route
5. Web route groups `/` vs `/app`
6. Infra smoke (Doppler local + Coolify VPS)

### Drill

Not triggered — headline 82 > 80; gaps are implementation backlog, not contested evidence.
