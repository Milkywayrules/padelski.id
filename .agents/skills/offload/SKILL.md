---
name: offload
description: Offload dirty, context-heavy work to subagents so the main chat stays clean. Use when the user runs /offload, wants disposable delegated work, isolated exploration, or relay-only summaries back to the human.
disable-model-invocation: true
---

# Offload — delegated dirty work

## First step

Read `references/protocol.md` and follow it exactly.

## Source of truth

| File | Role |
| --- | --- |
| `references/protocol.md` | L0 orchestration — read once per invoke |
| `references/spawn-registry.md` | role → spawn-target map |
| `references/relay-contract.md` | subagent report shape |
| `templates/layer-rules.txt` | paste verbatim on every L1/L2 spawn |
| `templates/spawn-packet.md` | how to build each spawn |

## L0 rules (summary)

1. Respect the repo ecosystem — no drift, scope creep, or padding.
2. Trivial work stays inline; everything else gets packaged and spawned.
3. Paste `templates/layer-rules.txt` on every L1/L2 spawn.
4. Verifier gate: spawn `verasic-offload-verifier` when a worker claims done.
5. Relay one compressed summary to the human — not subagent noise.

## vs /harden

| | `/offload` | `/harden` |
| --- | --- | --- |
| Purpose | move dirty work off main chat | production-readiness on current changes |
| Where work runs | subagents (disposable context) | main agent (or subagent you choose) |
| Done gate | verifier + scope-widening | tests/lint/smoke on the diff |

Use both when needed: offload implementation, then harden before merge.
