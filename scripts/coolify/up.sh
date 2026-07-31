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

doppler_run docker compose up -d --wait --remove-orphans "$@"
bash "$ROOT/scripts/coolify/smoke.sh"
