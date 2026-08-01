# padelski.id

Recreational padel PlaySession orchestration — friendly matches, live unofficial scoring, and SlotClaim identity binding. One term per concept; no dual language.

## Language rule

Use exactly one canonical term per concept in code, docs, UI copy, and conversation. When a synonym exists, list it under `_Avoid_` and never use it in product language.

## Core aggregates

**PlaySession**:
A bounded session of friendly padel play at a court datetime block — roster, matches, scoring, and SlotClaim window. Owns lifecycle from setup through archive.
_Avoid_: session, event, open play, game night

**Match**:
One scored padel contest inside a PlaySession. Carries a permanent result after finish; may be voided before or during play.
_Avoid_: game (when meaning a full padel match), fixture, round

**Slot**:
A roster seat in a PlaySession. Match history and leaderboard rows attach to `slotId`, never to a nickname string. Bound to either a Guest or a Player.
_Avoid_: seat, position, roster entry, player slot

**SlotClaim**:
The process by which a Player binds their account to a Guest Slot in a PlaySession, pending Organizer approval.
_Avoid_: claim, profile claim, account claim, guest claim

## People and roles

**Organizer**:
The single registered Player who creates and manages a PlaySession — roster, matches, SlotClaim approval, and session close. Exactly one per PlaySession in MVP.
_Avoid_: host, admin, creator, owner

**Participant**:
A role: a Player who holds a Slot in a PlaySession. Guest is not a Participant.
_Avoid_: member, attendee, player (when meaning the role in a session)

**Player**:
A registered identity (OAuth-backed) with account-wide public nickname and private full name. Exists independently of any PlaySession; may bind to many Slots across sessions.
_Avoid_: user, account, member, profile

**Guest**:
An unregistered Slot binding identified by nickname only — no Player, no OAuth. Not a Participant role.
_Avoid_: anonymous user, temp user, visitor, spectator

**nickname**:
Human-readable label shown in play. On a Guest Slot: session-scoped (often randomly generated). On a Player: account-wide public identity (MMORPG-style).
_Avoid_: display name, handle, username, alias (except as optional secondary label after SlotClaim)

**Spectator**:
A read-only viewer of live scoring via shareable link — not on a Slot, cannot score.
_Avoid_: viewer, audience, observer

## Scoring

**ScoreEvent**:
An append-only, ephemeral log entry recording who tapped what during live scoring (+1, −1, type, undo). Purged when the PlaySession is archived; Match result remains.
_Avoid_: activity log, match log, audit log (for ScoreEvent specifically)

**Activity log**:
Durable Postgres append-only record of domain events for product timelines — who did what on a PlaySession (created, activated, SlotClaim requested, and similar). Shown in session UI under `/app/play-sessions/*` to Organizer and in-scope Participants.
_Avoid_: audit trail, audit log, ScoreEvent, platform-admin log

**Audit trail**:
Append-only Postgres record of PlatformAdmin and security-sensitive support actions (detach, cross-tenant support, auth elevation). Shown only at `/app/platform-admin/audit` — PlatformAdmin scope.
_Avoid_: activity log, ScoreEvent, org admin log, `/admin` route segment

**auditFields**:
Mandatory `createdBy` and `updatedBy` FK columns to users on every domain table. ScoreEvent uses `actorSlotId` for the scoring actor instead — see [ADR-0005](./docs/adr/0005-activity-and-audit-logs.md).
_Avoid_: audit trail, activity log (for row-level columns)

Platform operator UI (PlatformAdmin) lives under the **`/app/platform-admin/*`** route segment — not `/admin` and not Org-scoped admin paths.

## Scope

**Platform scope**:
padelski.id operators — PlatformAdmin for abuse support and dispute escalation across tenants.
_Avoid_: global admin, super admin, system scope

**Org scope**:
Future club/tenant boundary — OrgAdmin and OrgMember for club-owned features. MVP PlaySession logic lives outside Org scope except where a Player belongs to an Org.
_Avoid_: club scope, tenant scope (use Org scope in docs), team scope
