#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

# shellcheck source=scripts/coolify/ensure-doppler.sh
source "$ROOT/scripts/coolify/ensure-doppler.sh"

if ! command -v docker >/dev/null 2>&1; then
  echo "error: required command not found: docker" >&2
  exit 1
fi

require_doppler_validate "$ROOT"
export DOCKER_BUILDKIT=1

discover_build_services() {
  docker compose config --services 2>/dev/null \
    | grep -E '^(api|web)(-pr-[0-9]+)?$' || true
}

# Build api then web sequentially — parallel compose builds spike RAM during Next.js
# compile and can kill the Coolify helper on small VPS hosts (exit 255, truncated log).
build_services="$(discover_build_services)"
if [[ -z "$build_services" ]]; then
  doppler_run docker compose build "$@"
else
  while IFS= read -r svc; do
    [[ -z "$svc" ]] && continue
    echo "build service: $svc"
    doppler_run docker compose build "$@" "$svc"
  done <<< "$build_services"
fi
