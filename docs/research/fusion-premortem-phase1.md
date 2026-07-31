# Fusion premortem — Phase 0.5 scaffold + Phase 1 BMAD

**Mode:** fusion  
**Template:** premortem  
**Models:** composer-2.5-fast, cursor-grok-4.5-medium, claude-opus-5-medium, gpt-5.6-sol-medium, gemini-3.6-flash-high  
**Upstream:** [padel domain research](./padel-domain-official-sources/deep-research-brief.md), [codebase foundation readiness](./codebase-foundation-readiness/deep-research-brief.md), ADR-0001–0003  
**Horizon:** T+6 months (Phase 1 BMAD vertical slice complete; first real user sessions)  
**Date:** 2026-07-31  
**Roster note:** 5 models (above soft cap of 4; within hard cap of 6).

---

## answer

**Failure scenario (fused):** padelski.id reaches T+6 months with green CI, passing domain state-machine tests, and a BMAD-generated feature backlog — but **no organizer can reliably run a live PlaySession end-to-end on the VPS**. A friend group opens the spectator link during a Saturday match; the score freezes for 30 seconds, then shows stale state. The organizer completes the session; ScoreEvents are purged on archive but the Match result projection is wrong because the scoring engine mishandled Star Point deuce. Deploys fail silently because `t3-env` rejects keys that exist in Doppler but were never smoke-tested locally. BMAD agents keep shipping vertical slices against stubs — auth routes unmounted, CASL checks pass in unit tests but not in API handlers, ws-protocol schemas exist in Zod but the API WebSocket upgrade handler was deferred. Phase 1 closes on paper; the product does not.

**Top root causes (ranked by fused severity):**

| Rank | Root cause | Why it kills Phase 1 |
| --- | --- | --- |
| 1 | **G0.5 foundation gaps shipped into BMAD anyway** | Drizzle schema, auth mount, CASL scopes, WS handler, `/app` route shell all marked blockers in foundation brief — starting feature stories before closeout compounds stub debt [foundation §answer]. |
| 2 | **Live score WS path is under-specified and untested under load** | ping/pong only today; Redis channel contract, spectator read-only enforcement, snapshot vs event ordering, and reconnect semantics are convention-not-code [foundation §ws-protocol; ADR-0003]. |
| 3 | **Scoring domain complexity underestimated in Phase 1 epic sizing** | FIP-aligned engine needs three deuce strategies, tie-break +1 model, void-on-complete rules, undo-as-new-event projection — not a thin CRUD layer [domain research §recommendation; ADR-0003]. |
| 4 | **Doppler/Coolify Pattern A never smoke-verified on VPS** | ADR-0002 locks Pattern A with no fallback; unverified G0.5 gates mean first prod deploy is the first real integration test [foundation §unverified; ADR-0002]. |
| 5 | **Auth org stub + CASL scope mismatch creates authorization holes** | Flat `member\|organizer\|admin` stub vs ADR PlatformAdmin/OrgAdmin/Organizer/Participant; Better Auth org plugin migration path with Drizzle unspiked [foundation §conflicts; ADR-0001]. |
| 6 | **Profile index strategy deferred until "scale" — then retrofitted under traffic** | Participation projection and partial indexes are spec-only; nickname-scan fallback tempts quick fixes [foundation §player profile; domain spec]. |

---

## reasoning

### Early warning signs

**Foundation / BMAD handoff**

- BMAD stories reference PlaySession CRUD before Drizzle migrations exist locally.
- `bun run typecheck && test && build` stays green while integration tests never hit a real Postgres + Redis stack.
- Agents add hand-written TypeScript interfaces alongside existing Zod schemas (violates ADR-0001 Zod SoT).
- `docs/bmad-handoff/PHASE-1-READY.md` G0.5 checkboxes checked without Doppler local or Coolify VPS smoke evidence.

**Doppler / Coolify (ADR-0002)**

- Local dev works with `.env` fallback but `doppler run --config dev_personal -- bun dev` fails on first operator attempt.
- Coolify deploy succeeds but api/web containers exit-loop on `t3-env` validation — keys present in Doppler dev config, missing from prod config.
- Next.js build bakes `NEXT_PUBLIC_*` URLs; prod image behaves differently from local compose despite "same image everywhere" intent.
- `scripts/coolify/up.sh` not executable or Doppler CLI absent on VPS host — discovered only during first deploy, not Phase 0.5.

**Domain / scoring complexity**

- First scoring story estimates "2 points" but scope creeps to deuce handler + tie-break + void-on-complete confirmation UX.
- Golden Point FIP typo ("wins the match") causes implementer confusion; game vs match resolution inconsistent across MatchScore projection and UI.
- Americano/Mexicano requested in same epic as Standard Match — two engines behind one adapter not reserved in package layout.
- PBPI/Indonesia default deuce format never researched; out-of-box preset wrong for target users, blamed on product not config.

**Live score WebSocket**

- ws-protocol gains Zod schemas in `packages/ws-protocol` but `apps/api` has no upgrade route — web client connects to dev mock only.
- Spectator token can POST score events — CASL stub never wired to WS auth path.
- Score updates arrive out of order after reconnect; no `match.score_snapshot` on subscribe.
- Redis pub/sub channel naming diverges between api instances (`padelski:v1:session:{id}` not codified in shared constant).
- Single Redis on VPS becomes hot spot when two PlaySessions run concurrently at a club — acceptable for MVP but no monitoring.

**Auth / org stub**

- `createAuthStub()` factory exists; `/api/auth/*` mount missing — GitHub OAuth flow untested end-to-end.
- Better Auth org plugin migration fails against Drizzle (docs show Prisma path) — spike deferred, org tables hand-rolled incorrectly.
- PlatformAdmin and OrgAdmin collapsed into one `admin` CASL role — support actions and org actions indistinguishable.
- Session → ability context builder not shared between REST and WS — participant can REST-read but WS rejects subscribe.

**Scale / profile**

- Player profile page runs `SELECT * FROM slots WHERE player_id = ?` without partial index — fine at 100 rows, slow at 10k.
- `player_match_participation` projection not updated on Match finish — profile timeline empty despite finished sessions.
- Archive purge deletes ScoreEvents before Match result projection verified — history shows W/L but not scoreline.

### Preventive actions (by area)

**G0.5 gate enforcement (highest leverage)**

1. Treat foundation brief G0.5 checklist as **hard BMAD entry gate** — no PlaySession CRUD story until DB schema + migrations land [foundation §recommendation].
2. Close stories in dependency order: DB schema → auth mount → CASL rewrite → ws-protocol + API WS route → web route groups → infra smoke.
3. Add one integration test path: Postgres + Redis + api WS upgrade + auth session cookie — runs in CI via compose service.

**Doppler / Coolify**

4. Execute G0.5 smokes **before** first BMAD story: `doppler run --config dev_personal -- bun dev` and `scripts/coolify/up.sh` on Contabo VPS [ADR-0002 §Phase 0.5 checklist].
5. Ship runtime `/api/config` on web before any prod deploy — validate no compile-time `NEXT_PUBLIC` prod dependency [ADR-0002 §Runtime config].
6. Document prod Doppler config key parity against `packages/env` schema — fail CI if prod config missing required keys (Doppler API read-only check in GHA).

**Scoring domain**

7. Reserve `packages/domain/src/scoring/` or `packages/scoring` facade in Phase 0.5 — adapter boundary before BMAD epic 2 [foundation §packages layout].
8. Implement Standard Match engine with **Golden Point default** first; Star Point and Advantage as strategy plugins — do not block MVP on full FIP parity [domain research §recommendation].
9. Encode void-on-complete and ScoreEvent purge rules as domain tests **before** UI — ADR-0003 confirmation UX is easy to skip in agent-generated code.
10. Label Americano/Mexicano explicitly out of G1 vertical slice [ADR-0001 §Out].

**Live score WS**

11. Codify Redis channel naming + ws message types in `packages/ws-protocol` with contract tests — not api-local strings [foundation §ws-protocol table].
12. On `session.subscribe`, server sends `match.score_snapshot` immediately — clients must not reconstruct from event log alone.
13. WS auth reuses same CASL ability builder as REST; spectator role hard-denies `score_event.append` at protocol layer [ADR-0003 §Spectator].
14. Spike reconnect + out-of-order delivery in Phase 0.5 closeout — one Playwright or vitest integration case with two WS clients.

**Auth / org stub**

15. Spike Better Auth org plugin + Drizzle migration **in Phase 0.5**, not Phase 1 — unblock org tables and membership roles [foundation §unverified].
16. Rename CASL roles to ADR vocabulary with `{ playSessionId, orgId }` conditions + unit tests per role matrix [ADR-0001 §Authorization].
17. Mount auth on api; web `(app)` layout uses Better Auth React client — GitHub OAuth E2E smoke before BMAD.

**Scale / profile**

18. Implement `player_match_participation` projection + indexes in initial Drizzle migration — not a follow-up "performance story" [foundation §player profile indexes].
19. Update `player_stats` rollup in same transaction as Match `FINISH` transition — avoid async drift.
20. Defer horizontal scale concerns (Redis cluster, WS sticky sessions) — document MVP ceiling (~50 concurrent spectators per session, single VPS) in tech-stack addendum.

---

## conflicts

### #1 root cause ranking

| Rank | composer-2.5-fast | cursor-grok-4.5-medium | claude-opus-5-medium | gpt-5.6-sol-medium | gemini-3.6-flash-high |
| --- | --- | --- | --- | --- | --- |
| 1 | G0.5 gaps → BMAD on stubs | Scoring domain complexity | Live score WS reliability | Doppler/Coolify unverified | Auth/CASL scope holes |
| 2 | Scoring complexity | G0.5 foundation skipped | G0.5 foundation skipped | Scoring engine scope creep | G0.5 foundation skipped |
| 3 | WS under-spec | WS + Redis fanout | Scoring + void/purge UX | Auth org Drizzle spike | WS at concurrent load |

**Tension:** Models split on whether **infrastructure (Doppler/Coolify)**, **realtime (WS)**, **domain (scoring SM)**, or **auth (CASL/org)** is the single highest-risk failure. **Fused pick:** G0.5 foundation bypass is the meta-failure — it enables all four to fail together. WS reliability is the **user-visible** failure mode that kills adoption even if infra is sound.

### BMAD process: gate strictness

| Stance | Models |
| --- | --- |
| **Hard stop — no BMAD until G0.5 100%** | composer-2.5-fast, claude-opus-5-medium, gpt-5.6-sol-medium |
| **Allow parallel BMAD on domain/scoring while infra closes** | cursor-grok-4.5-medium |
| **BMAD velocity risk exceeds stub debt — agents will outrun gates** | gemini-3.6-flash-high |

**Tension:** grok favors parallel tracks; three models insist sequential gate. **Fused pick: sequential** — foundation brief explicitly lists eight blockers; parallel BMAD on scoring without DB schema creates merge conflicts and duplicate vocabulary.

### Scoring MVP depth

| Stance | Models |
| --- | --- |
| **Golden Point + best-of-1 only for G1** | composer-2.5-fast, claude-opus-5-medium |
| **Full three deuce types required for credibility** | cursor-grok-4.5-medium, gemini-3.6-flash-high |
| **Golden Point + best-of-3; defer Star Point to G2** | gpt-5.6-sol-medium |

**Tension:** FIP 2026 pro default is Star Point [domain research §conflicts]; Indonesia club norm unverified. **Fused pick:** Golden Point + best-of-1 for G1 vertical slice; format picker UI stub with one preset — add deuce strategies in G2 after first live sessions.

### Scale: when to worry

| Stance | Models |
| --- | --- |
| **Indexes in initial migration — scale failure is silent until profile epic** | composer, grok, gpt |
| **MVP scale on single VPS sufficient; profile indexes can wait until slow query observed** | claude-opus-5-medium |
| **WS fanout + Redis is the scale cliff before DB** | gemini-3.6-flash-high |

**Tension:** opus treats scale as post-PMF; gemini puts WS ahead of DB. **Fused pick:** indexes in initial migration (cheap insurance); WS/Redis ceiling documented but not optimized pre-PMF.

### Doppler/Coolify failure severity

| Stance | Models |
| --- | --- |
| **Existential for prod — but dev/local can proceed** | composer, grok, opus |
| **Blocks all environments — no staging means prod is first integration** | gpt-5.6-sol-medium |
| **Secondary to feature delivery — ops debt** | gemini-3.6-flash-high |

**Fused pick:** gpt's framing — no staging amplifies Doppler/Coolify miss; treat G0.5 infra smoke as **equal blocker** to WS handler, not ops afterthought.

---

## by model

### composer-2.5-fast

**#1 root cause:** G0.5 foundation gaps (DB, auth mount, CASL, WS route, `/app` shell) ship into BMAD anyway — agents satisfy unit tests on stubs while integration path is broken. **Early warning:** green CI without compose integration test. **Prevention:** hard G0.5 gate; story order from foundation brief §Suggested closeout.

### cursor-grok-4.5-medium

**#1 root cause:** Scoring domain complexity — FIP deuce strategies, tie-break +1, void-on-complete, ScoreEvent purge/projection interaction underestimated in Phase 1 sizing. **Early warning:** scoring epic re-estimated mid-sprint; Golden Point typo confusion. **Prevention:** scoring facade stub in 0.5; Golden Point first; domain tests before UI.

### claude-opus-5-medium

**#1 root cause:** Live score WS path — spectator read-only leak, missing snapshot on subscribe, reconnect staleness; user-visible freeze kills the "paste link in WhatsApp" wedge. **Early warning:** two-phone test shows desync; spectator can score. **Prevention:** contract tests in ws-protocol; snapshot-on-subscribe; shared CASL builder for REST+WS.

### gpt-5.6-sol-medium

**#1 root cause:** Doppler/Coolify Pattern A never smoke-verified — no staging means first prod deploy is first real secret injection; t3-env fail-fast turns config drift into outage. **Early warning:** local `.env` works, `doppler run` fails; Coolify up.sh never run on VPS. **Prevention:** G0.5 smokes mandatory; prod config parity check in CI.

### gemini-3.6-flash-high

**#1 root cause:** Auth org stub + CASL flat roles — authorization holes between PlatformAdmin/OrgAdmin/Organizer/Participant; Better Auth Drizzle migration unspiked; WS and REST auth paths diverge. **Early warning:** OAuth untested E2E; `admin` role does too much. **Prevention:** org plugin Drizzle spike in 0.5; ADR role rename with condition tests; mount auth before BMAD.

---

## recommendation

### Prevention priority (execute in Phase 0.5 closeout, before first BMAD story)

1. **Enforce G0.5 as hard gate** — copy foundation brief checklist into BMAD policy; block epic start until Drizzle schema, auth mount, CASL scopes, ws-protocol score schemas, API WS handler, and web `(marketing)`/`(app)` shells exist [foundation §G0.5].

2. **Run infra smokes on real environments** — `doppler run --config dev_personal -- bun dev` locally; `scripts/coolify/up.sh` on VPS; `/api/config` runtime endpoint live [ADR-0002].

3. **Close the live score contract** — Zod message types + Redis channel constant in `packages/ws-protocol`; API upgrade handler with `session.subscribe` → `match.score_snapshot`; spectator deny on append [ADR-0003].

4. **Spike auth org + CASL before feature work** — Better Auth org tables on Drizzle; rename roles to ADR vocabulary; one GitHub OAuth E2E path through api→web `(app)` gate [ADR-0001].

5. **Ship scoring engine boundary, not full FIP** — `packages/scoring` or domain subfolder stub; Golden Point + best-of-1 for G1; void/purge rules as domain tests first [domain research §MVP scoring spec].

6. **Migrate indexes with schema** — `player_match_participation`, partial `slots(player_id)`, `player_stats` PK — never defer to "scale epic" [foundation §player profile].

7. **Add compose integration test** — Postgres + Redis + api WS + auth session — single CI job that fails if stubs remain disconnected.

8. **Document MVP realtime ceiling** — ~50 spectators/session, single Redis, single VPS — so Phase 1 does not over-engineer horizontal scale.

### What not to premortem-fix in Phase 0.5

- Americano/Mexicano scoring UI, Google OAuth, Org admin UI, federation ranking, R2 uploads, Playwright E2E suite — explicitly deferred [ADR-0001; foundation §G1 defer list].
- PBPI Indonesia default deuce format — user research follow-up, not blocker for Golden Point preset [domain research §unverified].

### Success criterion (avoid false "Phase 1 complete")

Phase 1 succeeds when **one organizer runs setup→active→live score→complete→archive on the VPS** with a spectator on a second device, GitHub-authenticated participant scoring, and profile history showing the finished match — not when BMAD closes stories against stubs.

---

*Fusion output — premortem synthesized from five models against padel domain research, codebase foundation readiness brief, and ADR-0001–0003; not independent ledger verification.*
