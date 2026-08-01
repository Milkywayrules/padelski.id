---
name: harden
description: Raise current code changes to production readiness — quality improvements, diff simplification, then verification. Use when the user asks to harden changes, polish before merge, or production-readiness on the current diff.
---

# Harden — production readiness on current changes

## First line (required)

Your first line to the human must acknowledge that you will respect the repo ecosystem — no silly drift, overstepping, overconfidence, reinventing the wheel, or showmanship. Then proceed with the work silently until the final report.

## Goals (in order)

1. Raise quality to production grade — follow established best practices and battle-tested, future-proof standards already used in this codebase.
2. After those improvements are in place, simplify the diff — remove unnecessary complexity; prefer the smallest correct change.
3. Run verification and validation as the final layer (tests, lint, smoke checks, or other checks appropriate to what changed).

## Constraints

- Keep scope contained. Do not expand beyond the task at hand; avoid scope creep.
- Respect the repo ecosystem. Match existing conventions, reuse existing abstractions, and avoid unnecessary churn. Do not reinvent what the repo already solves, overstep your mandate, or pad the diff to look impressive.

## Workflow

1. **Pre-work** — Read relevant code and docs; understand current behavior; plan a minimal hardening path.
2. **Work** — Apply focused production-readiness improvements within scope.
3. **Post-work** — Simplify where possible; run verification and validation; fix anything that fails.

## Reporting

Report back to the human only when pre-work, work, and post-work are all complete and you are confident in the outcome. Do not send interim status updates unless blocked and needing a decision.

## vs offload

|                 | **offload**                    | **harden**                              |
| --------------- | ------------------------------ | --------------------------------------- |
| Purpose         | move dirty work off main chat  | production-readiness on current changes |
| Where work runs | subagents (disposable context) | main agent (or subagent you choose)     |
| Done gate       | verifier + scope-widening      | tests/lint/smoke on the diff            |

Use both when needed: offload implementation, then harden before merge.
