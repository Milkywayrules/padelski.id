#!/usr/bin/env bash
# Install governance pre-push gate at the TOP of .git/hooks/pre-push (before LEFTHOOK=0).
# Idempotent. Requires lefthook — run `lefthook install` first if the hook is missing.
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

HOOK_PATH="$(git rev-parse --git-path hooks/pre-push)"
GOV_HOOK="$REPO_ROOT/.github/verasic-governance/hooks/pre-push"
MARKER="# verasic-governance: pre-push gate"

if [[ ! -f "$GOV_HOOK" ]]; then
  echo "ensure-pre-push-gate: missing $GOV_HOOK" >&2
  exit 1
fi

if ! command -v lefthook >/dev/null 2>&1; then
  echo "ensure-pre-push-gate: lefthook not found — install lefthook first" >&2
  exit 1
fi

if [[ ! -f "$HOOK_PATH" ]] || ! grep -q 'call_lefthook run "pre-push"' "$HOOK_PATH" 2>/dev/null; then
  lefthook install >/dev/null 2>&1
fi

if [[ ! -f "$HOOK_PATH" ]]; then
  echo "ensure-pre-push-gate: missing $HOOK_PATH after lefthook install" >&2
  exit 1
fi

if grep -qF "$MARKER" "$HOOK_PATH"; then
  echo "ensure-pre-push-gate: already wired at top — $HOOK_PATH"
  exit 0
fi

lefthook install >/dev/null 2>&1

tmp="$(mktemp)"
{
  echo '#!/bin/sh'
  echo "$MARKER — runs before lefthook; not skippable via LEFTHOOK=0"
  cat <<'GATE'
_verasic_repo="$(git rev-parse --show-toplevel 2>/dev/null)" || exit 1
_verasic_refs="$(cat)"
if [ "${VERASIC_GOVERNANCE_BYPASS:-}" != "1" ]; then
  if [ -z "$_verasic_refs" ]; then
    echo "verasic-github-governance: pre-push received no ref list — refusing push (fail-closed)" >&2
    exit 1
  fi
  printf '%s\n' "$_verasic_refs" | bash "$_verasic_repo/.github/verasic-governance/hooks/pre-push" "$1" || exit 1
fi
GATE
  tail -n +2 "$HOOK_PATH" | sed '/^call_lefthook run "pre-push"/c\
printf "%s\\n" "$_verasic_refs" | call_lefthook run "pre-push" "$@"\
exit $?'
} >"$tmp"
if ! grep -q 'printf "%s\\n" "$_verasic_refs" | call_lefthook run "pre-push"' "$tmp"; then
  echo "ensure-pre-push-gate: failed to patch call_lefthook line in $HOOK_PATH" >&2
  rm -f "$tmp"
  exit 1
fi
mv "$tmp" "$HOOK_PATH"
chmod +x "$HOOK_PATH"
echo "ensure-pre-push-gate: wired governance gate at top of $HOOK_PATH"
