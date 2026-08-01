# Offload protocol (L0 only)

Read this once per `/offload` invoke. L1/L2 get `templates/layer-rules.txt` + spawn packet — not this file.

## When to offload

Offload when work is context-heavy, verbose, or disposable — not when ≤2 trivial tool steps.

## L0 workflow

1. Read the user's task (text after `/offload`).
2. Trivial (≤2 steps)? Do inline → report → stop.
3. Decide `exec: parallel | sequential` — if step B needs step A's output, sequential.
4. Build spawn packet from `templates/spawn-packet.md` + `references/spawn-registry.md`.
5. Spawn subagent(s). Background default for dirty work; foreground when you must block.
6. Wait for relay per `references/relay-contract.md`.
7. Worker claimed done? Spawn `verasic-offload-verifier` (readonly) with scope-in/scope-out from the worker packet.
8. Verifier pass + evidence? One compressed relay to human. Else resume worker or report blockers.

## L0 constraints

- Match repo conventions; no scope creep or drive-by refactors.
- Never push to `main` — feature branches and PR only.
- No commit, push, or GitHub mutation unless the user explicitly scoped it in `scope-in` **and** confirmed in main chat.
- `gh-governor` spawns require explicit human confirmation in main chat before spawn.
- Do not dump subagent tool narration into the human chat.
- Pair with `/harden` when production polish is needed after offload work lands.

## Parallel fan-out

Independent slices → multiple Task calls in one message. Dependent steps → sequential spawns.

## Resume

Same slice, more work → resume with agent id + short delta. New slice or role → fresh spawn packet.
