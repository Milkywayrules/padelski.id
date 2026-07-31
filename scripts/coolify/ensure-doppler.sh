#!/usr/bin/env bash
# Resolve Doppler CLI for Coolify helper containers: global `doppler` or `bunx doppler`.
set -euo pipefail

DOPPLER=()

resolve_doppler() {
  if command -v doppler >/dev/null 2>&1; then
    DOPPLER=(doppler)
    return 0
  fi

  if command -v bun >/dev/null 2>&1; then
    DOPPLER=(bunx doppler)
    return 0
  fi

  echo "error: doppler CLI not found (install on host or provide bun for bunx doppler)" >&2
  exit 1
}

doppler_run() {
  if ((${#DOPPLER[@]} == 0)); then
    resolve_doppler
  fi
  "${DOPPLER[@]}" run -- "$@"
}

maybe_validate_doppler_config() {
  local root="${1:-.}"

  if ! command -v bun >/dev/null 2>&1 || [[ ! -f "$root/package.json" ]]; then
    echo "note: skipping doppler:validate (bun unavailable in this environment)"
    return 0
  fi

  doppler_run bun run doppler:validate
}
