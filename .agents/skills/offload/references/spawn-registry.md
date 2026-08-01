# Spawn registry

`role` = protocol name in reports. `spawn-target` = what Task actually calls.

| role | spawn-target | readonly | when |
| --- | --- | --- | --- |
| coordinator | generalPurpose | no | L1 orchestrates L2 |
| scout | explore | de facto | map codebase |
| runner | shell | no | terminal-heavy |
| worker | generalPurpose | no | implement / multi-step |
| verifier | verasic-offload-verifier | yes | done gate + scope-widening |
| bugbot | verasic-bugbot-reviewer | yes | diff bug review |
| secbot | verasic-secbot-reviewer | yes | security review |
| commit-auditor | verasic-git-commit-auditor | audit-only | pre-push commit audit |
| gh-governor | verasic-github-governor | — | mutating gh ops |

Pick the narrowest spawn-target that fits. Built-ins first; custom when repo-specific behavior is needed.
