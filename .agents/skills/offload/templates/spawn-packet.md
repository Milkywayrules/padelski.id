Build every L1/L2 Task spawn in this order (paste each block verbatim):

```text
## offload-meta
layer: L1 | L2
role: scout | runner | worker | coordinator | verifier | bugbot | secbot | commit-auditor | gh-governor
spawn-target: explore | shell | generalPurpose | verasic-offload-verifier | verasic-bugbot-reviewer | verasic-secbot-reviewer | verasic-git-commit-auditor | verasic-github-governor
exec: parallel | sequential
scope-in: <exact allowed work>
scope-out: <explicit exclusions — commits, deps, refactors, docs, scope-widening>
relay-to: main | parent
```

Then paste `templates/layer-rules.txt` verbatim.

Then paste this governance block verbatim:

```text
## governance
- never push to main — feature branches and PR only
- no commit, push, or gh mutation unless scope-in explicitly includes it AND human confirmed in main chat
- gh-governor spawns require explicit human confirmation in main chat before spawn
```

Then the task body: goal, current state, constraints, deliverable per `references/relay-contract.md`.
