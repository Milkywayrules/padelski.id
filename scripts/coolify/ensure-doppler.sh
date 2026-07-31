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

export_doppler_cmd() {
  resolve_doppler
  export PADELSKI_DOPPLER_CMD="${DOPPLER[*]}"
}

doppler_run() {
  export_doppler_cmd
  "${DOPPLER[@]}" run -- "$@"
}

require_doppler_validate() {
  local root="${1:-.}"

  if [[ -z "${DOPPLER_TOKEN:-}" ]]; then
    echo "error: DOPPLER_TOKEN is unset (Pattern A service token required)" >&2
    exit 1
  fi

  if ! command -v bun >/dev/null 2>&1 || [[ ! -f "$root/package.json" ]]; then
    echo "error: bun required for doppler:validate in deploy scripts" >&2
    exit 1
  fi

  export_doppler_cmd
  doppler_run bun run doppler:validate
}
