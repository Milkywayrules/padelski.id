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
  local override="$ROOT/docker-compose.override.yml"
  local services=""

  if [[ ! -f "$compose" ]]; then
    echo "error: docker-compose.yml not found at $compose" >&2
    exit 1
  fi

  # Prefer parsed service names — Coolify may rename api/web to api-pr-N in the deploy artifact.
  services="$(
    docker compose -f "$compose" config --services 2>/dev/null \
      | grep -E '^(api|web)(-pr-[0-9]+)?$' || true
  )"

  if [[ -z "$services" ]]; then
    services="$(
      grep -E '^  (api|web)(-pr-[0-9]+)?:' "$compose" 2>/dev/null \
        | sed 's/^  //;s/:$//' || true
    )"
  fi

  if [[ -z "$services" ]]; then
    echo "warn: no api/web compose services — skipping port-strip override" >&2
    rm -f "$override"
    return 0
  fi

  {
    echo "services:"
    while IFS= read -r svc; do
      [[ -z "$svc" ]] && continue
      printf '  %s:\n    ports: !reset []\n' "$svc"
    done <<< "$services"
  } > "$override"

  echo "port-strip override for:$(printf ' %s' $services)"
}

write_port_strip_override

doppler_run docker compose up -d --wait --remove-orphans "$@"
bash "$ROOT/scripts/coolify/smoke.sh"
