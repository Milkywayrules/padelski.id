#!/usr/bin/env bash
# Regression checks for repo-local governance pre-push hook + gate installer.
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

HOOK="$REPO_ROOT/.github/verasic-governance/hooks/pre-push"
GATE="$REPO_ROOT/scripts/governance/ensure-pre-push-gate.sh"
pass=0
fail=0

assert_fail() {
  local name="$1" cmd="$2"
  if eval "$cmd"; then
    echo "FAIL (expected block): $name"
    fail=$((fail + 1))
  else
    echo "PASS: $name"
    pass=$((pass + 1))
  fi
}

assert_ok() {
  local name="$1" cmd="$2"
  if eval "$cmd"; then
    echo "PASS: $name"
    pass=$((pass + 1))
  else
    echo "FAIL: $name"
    fail=$((fail + 1))
  fi
}

main_sha="$(git rev-parse main 2>/dev/null || echo deadbeef)"
remote_sha="$(git rev-parse origin/main 2>/dev/null || echo cafebabe)"

assert_fail "blocks main -> main" \
  "printf '%s\n' 'refs/heads/main $main_sha refs/heads/main $remote_sha' | bash '$HOOK' origin"

assert_fail "blocks feature:main refspec" \
  "printf '%s\n' 'refs/heads/feat/x $main_sha refs/heads/main $remote_sha' | bash '$HOOK' origin"

assert_fail "blocks delete main" \
  "printf '%s\n' '(delete) $main_sha refs/heads/main $remote_sha' | bash '$HOOK' origin"

assert_fail "fail-closed on empty stdin" \
  "bash '$HOOK' origin < /dev/null"

assert_ok "bypass allows empty stdin" \
  "VERASIC_GOVERNANCE_BYPASS=1 bash '$HOOK' origin < /dev/null"

assert_ok "allows feature branch push" \
  "printf '%s\n' 'refs/heads/feat/x $main_sha refs/heads/feat/x $remote_sha' | bash '$HOOK' origin"

if command -v lefthook >/dev/null 2>&1; then
  LH_BIN="lefthook"
elif [[ -x "$REPO_ROOT/node_modules/.bin/lefthook" ]]; then
  LH_BIN="$REPO_ROOT/node_modules/.bin/lefthook"
else
  LH_BIN=""
fi

if [[ -n "$LH_BIN" ]]; then
  assert_ok "gate installer is idempotent" \
    "bash '$GATE' >/dev/null && bash '$GATE' 2>&1 | grep -q 'already wired'"
  assert_ok "gate marker at top of git hook" \
    "grep -qF 'verasic-governance: pre-push gate' \"\$(git rev-parse --git-path hooks/pre-push)\""
  assert_ok "gate survives lefthook install with re-assert" \
    "bash '$GATE' >/dev/null && '$LH_BIN' install >/dev/null && bash '$GATE' >/dev/null && grep -qF 'verasic-governance: pre-push gate' \"\$(git rev-parse --git-path hooks/pre-push)\""
  main_sha="$(git rev-parse main 2>/dev/null || echo deadbeef)"
  remote_sha="$(git rev-parse origin/main 2>/dev/null || echo cafebabe)"
  assert_fail "composed hook blocks main under LEFTHOOK=0" \
    "printf '%s\n' 'refs/heads/main $main_sha refs/heads/main $remote_sha' | LEFTHOOK=0 sh \"\$(git rev-parse --git-path hooks/pre-push)\" origin"
else
  echo "SKIP: lefthook not installed — gate installer tests"
fi

echo "---"
echo "pre-push regression: $pass passed, $fail failed"
[[ "$fail" -eq 0 ]]
