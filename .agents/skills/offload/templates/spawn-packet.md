Paste verbatim at the top of every L1/L2 Task spawn (after layer-rules.txt):

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

Then the task body: goal, current state, constraints, deliverable per `references/relay-contract.md`.
