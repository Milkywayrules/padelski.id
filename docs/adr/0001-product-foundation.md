# Product foundation — recreational realm and MVP scope

**Status:** accepted  
**Phase:** 0  
**Date:** 2026-07-31

padelski.id serves **recreational, unofficial** padel — friend groups, community tourneys, and lifestyle play. We do not submit to federation rankings or claim official sanction (no FIP/PBPI-equivalent authority). Our realm mimics official concepts (leagues, divisions) as community features later, not as certified ratings.

## MVP scope

| In | Out (defer) |
| --- | --- |
| PlaySession friendly matches (`setup` → `active` → `completed` → `archived`) | Court booking marketplace |
| Live unofficial scoring with ephemeral ScoreEvent log | Federation ranking integration |
| SlotClaim with **Organizer approval** | Google OAuth (GitHub OAuth now) |
| Spectator read-only link | PWA / offline install |
| Player profile history (indexed) | Club SaaS / Org-heavy features |
| Shareable session orchestration (web-first) | ELO-chasing pro circuit |

Position above booking layer per [competitor research](../research/competitor-landscape/deep-research-brief.md): coexist with Courtside/AYO/Playtomic rather than replace them.

## Auth

- **Now:** Better Auth with **GitHub OAuth** only.
- **Later:** Google OAuth when email/password path is dropped.
- Signup: **nickname** (public), **full name** (private), privacy notice.
- No username-for-auth; nickname is the public game identity.

## SlotClaim

- Guest Slot → Player binding requires **Organizer approval** (`awaiting_organizer`).
- At most **one Slot per Player per PlaySession**.
- Player cannot self un-claim; Organizer or PlatformAdmin may **detach** (see domain spec).

## ScoreEvent lifecycle

- Append-only during `active` and `completed` (review window).
- **Purge ScoreEvent rows on `archived`**; permanent **Match result** projection kept.
- Any **Slot holder** may record score (+1, −1, type, undo as new events).

## API and schema

- REST under **`/v1`**; breaking changes → `/v2`.
- WebSocket protocol versioned in `packages/ws-protocol` (e.g. `v1`).
- **Zod is source of truth** — infer TypeScript types from schemas; no duplicate hand-written interfaces where a schema exists.

## Domain machinery

- **Hand-rolled deterministic state machines** in `packages/domain` (pure `transition(state, event)` functions + tests + mermaid spec).
- **No XState** in MVP; optional later for complex wizards only.
- Future engines (scoring, pairing, competition) as adapters/facades behind stable domain vocabulary — not leaked into CONTEXT terms.

## Authorization

- **Scoped RBAC** base: PlatformAdmin, OrgAdmin/OrgMember (future), Organizer, Participant (PlaySession scope).
- **CASL stub** in Phase 0.5 — thin ability checks; grows with clubs/tournaments.
- ABAC/federation tier rules deferred until Competition engine exists.

## UX principles

- **Power user** on mobile and PC: minimal taps, sticky score controls, quick actions, one-screen live score, keyboard shortcuts on desktop.
- **English-first** UI and docs; i18n architecture deferred until post-MVP demand.
- **Defer PWA** — responsive web only for MVP.

## Research inputs

- [Padel domain official sources](../research/padel-domain-official-sources/deep-research-brief.md) — FIP-aligned scoring as reference, not compliance mandate.
- [Competitor landscape](../research/competitor-landscape/deep-research-brief.md) — whitespace on PlaySession + SlotClaim + live unofficial scoring.
