#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

API_URL="${SMOKE_API_URL:-http://127.0.0.1:3001/v1/health}"
WEB_URL="${SMOKE_WEB_URL:-http://127.0.0.1:3000/}"
CONFIG_URL="${SMOKE_CONFIG_URL:-http://127.0.0.1:3001/v1/config}"
MAX_ATTEMPTS="${SMOKE_MAX_ATTEMPTS:-30}"
SLEEP_SECS="${SMOKE_SLEEP_SECS:-2}"
SMOKE_MODE="${SMOKE_MODE:-auto}"

resolve_smoke_mode() {
  if [[ "$SMOKE_MODE" != "auto" ]]; then
    echo "$SMOKE_MODE"
    return
  fi

  # Host loopback works when smoke runs on the same machine as published ports (local dev).
  if curl -fsS --connect-timeout 2 --max-time 3 "$API_URL" >/dev/null 2>&1; then
    echo "loopback"
    return
  fi

  # Coolify runs smoke inside the helper container; published 127.0.0.1 ports live on the
  # Docker host, not helper loopback. Reach services via compose exec instead.
  if command -v docker >/dev/null 2>&1 && docker compose ps --status running api 2>/dev/null | grep -q api; then
    echo "compose-exec"
    return
  fi

  echo "loopback"
}

check_loopback() {
  curl -fsS "$1" >/dev/null 2>&1
}

check_compose_exec() {
  local service="$1"
  local url="$2"
  docker compose exec -T "$service" bun -e \
    "fetch('${url}').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" \
    >/dev/null 2>&1
}

wait_for() {
  local url="$1"
  local label="$2"
  local service="$3"
  local mode="$4"
  local attempt=1

  while (( attempt <= MAX_ATTEMPTS )); do
    local ok=0
    case "$mode" in
      loopback)
        check_loopback "$url" && ok=1
        ;;
      compose-exec)
        check_compose_exec "$service" "$url" && ok=1
        ;;
      *)
        echo "smoke failed: unknown SMOKE_MODE=$mode" >&2
        return 1
        ;;
    esac

    if (( ok == 1 )); then
      echo "smoke ok: $label ($url via $mode)"
      return 0
    fi

    echo "smoke wait: $label attempt $attempt/$MAX_ATTEMPTS ($mode)"
    sleep "$SLEEP_SECS"
    attempt=$((attempt + 1))
  done

  echo "smoke failed: $label ($url via $mode)" >&2
  return 1
}

MODE="$(resolve_smoke_mode)"
echo "smoke mode: $MODE"

if [[ "$MODE" == "loopback" ]] && ! command -v curl >/dev/null 2>&1; then
  echo "error: required command not found: curl" >&2
  exit 1
fi

if [[ "$MODE" == "compose-exec" ]] && ! command -v docker >/dev/null 2>&1; then
  echo "error: required command not found: docker" >&2
  exit 1
fi

wait_for "$API_URL" "api health" "api" "$MODE"
wait_for "$CONFIG_URL" "api config" "api" "$MODE"
wait_for "$WEB_URL" "web root" "web" "$MODE"

echo "smoke: all checks passed"
