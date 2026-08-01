# EPICS — remaining MVP work

**Date:** 2026-07-31  
**Phase:** 1 foundation complete · stories below finish full MVP vertical slice

## Epic E1 — PlaySession lifecycle polish

| Story | Acceptance criteria |
| --- | --- |
| E1-S1 Complete confirmation UX | Web dialog lists scheduled matches to void; calls `POST /complete?confirmVoid=true` |
| E1-S2 Archive + ScoreEvent purge | Verify purge on archive; add integration test with real Postgres |
| E1-S3 REOPEN flow | Organizer can reopen completed session; UI control + API route |
| E1-S4 Spectator share link | Public URL with `?spectator=1` forces read-only; no slot selector |

## Epic E2 — Live scoring depth

| Story | Acceptance criteria |
| --- | --- |
| E2-S1 Undo/redo ScoreEvents | API + UI for undo referencing `refEventId`; projection replays log |
| E2-S2 Type-score entry | Direct score entry modal; `type` action with teamA/teamB payload |
| E2-S3 Scoring format presets | G1: Golden Point + best-of-1 only; UI stub for format picker; Star Point/Advantage + Rotation Social later |
| E2-S4 Redis WS fanout | Replace in-memory channel map with Redis pub/sub for multi-instance API |
| E2-S5 Conflict resolution | Document + handle concurrent score taps from two slot holders |

## Epic E3 — SlotClaim end-to-end

| Story | Acceptance criteria |
| --- | --- |
| E3-S1 Guest claim UI | Player picks Guest slot; creates SlotClaim; shows pending state |
| E3-S2 Organizer approve UI | Organizer sees pending claims; approve/reject actions |
| E3-S3 SlotClaim TTL | Configurable expire job; EXPIRE transition on window close |
| E3-S4 Detach flow | Organizer detach with new random nickname; profile attribution drops |
| E3-S5 One Player per session guard | DB constraint or service check blocks duplicate Player slots |

## Epic E4 — Auth & identity

| Story | Acceptance criteria |
| --- | --- |
| E4-S1 Better Auth Drizzle adapter | Persist sessions/users; link `players.user_id` on OAuth signup |
| E4-S2 GitHub OAuth login UI | Web sign-in button; callback creates/links Player |
| E4-S3 CASL route guards | API checks organizer/participant/spectator abilities per ADR |
| E4-S4 Email/password auth | Sign-up/sign-in via Better Auth `emailAndPassword`; enabled in MVP |

## Epic E5 — Player profile & stats

| Story | Acceptance criteria |
| --- | --- |
| E5-S1 Profile visibility opt-out | Player setting hides match history from public |
| E5-S2 player_stats rollup | O(1) W/L dashboard; update on Match FINISH |
| E5-S3 Headline stats UI | Profile page shows games played, win rate |
| E5-S4 Composite index validation | Load test profile history at scale; tune `(player_id, finished_at)` |

## Epic E6 — Quality & deploy

| Story | Acceptance criteria |
| --- | --- |
| E6-S1 API integration tests | Vitest + testcontainers Postgres for full vertical slice |
| E6-S2 Playwright E2E | Create session → score → claim → profile history |
| E6-S3 Doppler dev_personal smoke | Compose up with real secrets |
| E6-S4 Coolify prod deploy | Pattern A smoke on VPS v4.1.2 |

## Explicitly deferred (post-MVP)

- Marketing pages
- PWA / offline
- Tournament engine
- Google OAuth
- Org admin features
- Booking integration (Courtside, AYO)

## Phase 1 foundation delivered

- Drizzle schema: Player, PlaySession, Slot, Match, ScoreEvent, SlotClaim, Org stub
- Domain transition functions + complete guard helpers
- Elysia `/v1` routes: PlaySession, Match, ScoreEvent, SlotClaim, player history, config, WS stub
- Web `/app` routes: list/create sessions, live score view, profile history
- Better Auth GitHub OAuth wired (handler mounted; DB adapter in E4-S1)
- TanStack Query + Zustand score actions pattern
