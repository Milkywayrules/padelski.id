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

# Coolify regenerates deploy compose and injects shared 127.0.0.1:3000/3001 host binds
# from domain UI config — repo-level `ports: !reset []` is not preserved. Merge a runtime
# override so main + concurrent PR previews start without host port collisions.
write_port_strip_override() {
  local compose="$ROOT/docker-compose.yml"
  local override="$ROOT/docker-compose.coolify-runtime.yml"

  if [[ ! -f "$compose" ]]; then
    echo "error: docker-compose.yml not found at $compose" >&2
    exit 1
  fi

  {
    echo "services:"
    grep -E '^  (api|web)(-pr-[0-9]+)?:' "$compose" | sed 's/:$//' | while read -r line; do
      svc="${line#  }"
      printf '  %s:\n    ports: !reset []\n' "$svc"
    done
  } > "$override"

  if ! grep -qE '^  (api|web)' "$override"; then
    echo "warn: no api/web services in compose — skipping port-strip override" >&2
    rm -f "$override"
  fi
}

write_port_strip_override

compose_args=(-f docker-compose.yml)
if [[ -f "$ROOT/docker-compose.coolify-runtime.yml" ]]; then
  compose_args+=(-f docker-compose.coolify-runtime.yml)
fi

doppler_run docker compose "${compose_args[@]}" up -d --wait --remove-orphans "$@"
bash "$ROOT/scripts/coolify/smoke.sh"
