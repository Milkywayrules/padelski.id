# Scope-widening audit

For every file the worker touched:

1. File path must fall within worker `scope-in` (or be listed with justification).
2. No edits outside declared paths.
3. No new dependencies, config, or docs unless scoped in `scope-in`.
4. No drive-by refactors or "while I was here" changes.
5. No commit/push unless explicitly in `scope-in`.
6. Verification commands must match what changed — cite command output.

Any violation → **fail** — not done. Report violations explicitly; do not soften.
