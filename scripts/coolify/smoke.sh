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
SMOKE_PUBLIC_URLS="${SMOKE_PUBLIC_URLS:-auto}"

discover_service() {
  local base="$1"
  local out=""

  out="$(
    docker compose config --services 2>/dev/null \
      | grep -E "^${base}(-pr-[0-9]+)?$" || true
  )"

  if [[ -z "$out" ]]; then
    out="$(
      docker compose ps --services 2>/dev/null \
        | grep -E "^${base}(-pr-[0-9]+)?$" || true
    )"
  fi

  printf '%s' "${out%%$'\n'*}"
}

API_SERVICE="${SMOKE_API_SERVICE:-$(discover_service api)}"
WEB_SERVICE="${SMOKE_WEB_SERVICE:-$(discover_service web)}"

resolve_smoke_mode() {
  if [[ "$SMOKE_MODE" != "auto" ]]; then
    echo "$SMOKE_MODE"
    return
  fi

  # Loopback works when api/web publish host ports (local dev); Coolify previews use compose-exec.
  if curl -fsS --connect-timeout 2 --max-time 3 "$API_URL" >/dev/null 2>&1; then
    echo "loopback"
    return
  fi

  # Coolify runs smoke inside the helper container; published 127.0.0.1 ports live on the
  # Docker host, not helper loopback. Coolify renames services to api-pr-N / web-pr-N.
  if command -v docker >/dev/null 2>&1 && [[ -n "$API_SERVICE" ]]; then
    if [[ -n "$(docker compose ps -q "$API_SERVICE" 2>/dev/null || true)" ]]; then
      echo "compose-exec"
      return
    fi
  fi

  echo "loopback"
}

check_loopback() {
  curl -fsS "$1" >/dev/null 2>&1
}

check_compose_exec() {
  local service="$1"
  local url="$2"
  docker compose exec -T -e "SMOKE_URL=$url" "$service" bun -e \
    "fetch(process.env.SMOKE_URL).then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" \
    >/dev/null 2>&1
}

wait_for() {
  local url="$1"
  local label="$2"
  local service="$3"
  local mode="$4"
  local attempt=1

  if [[ "$mode" == "compose-exec" && -z "$service" ]]; then
    echo "smoke failed: $label (compose-exec requires a service name)" >&2
    return 1
  fi

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

public_url_enabled() {
  case "$SMOKE_PUBLIC_URLS" in
    always) return 0 ;;
    never) return 1 ;;
    auto)
      [[ -n "${SERVICE_URL_API_3001:-}" || -n "${SERVICE_URL_WEB_3000:-}" ]]
      ;;
    *)
      echo "smoke failed: unknown SMOKE_PUBLIC_URLS=$SMOKE_PUBLIC_URLS" >&2
      return 1
      ;;
  esac
}

join_url() {
  local base="${1%/}"
  local path="$2"
  if [[ "$path" == /* ]]; then
    printf '%s%s' "$base" "$path"
  else
    printf '%s/%s' "$base" "$path"
  fi
}

wait_for_public() {
  local url="$1"
  local label="$2"
  local attempt=1

  while (( attempt <= MAX_ATTEMPTS )); do
    if curl -fsS --connect-timeout 3 --max-time 10 "$url" >/dev/null 2>&1; then
      echo "smoke ok: $label ($url via public)"
      return 0
    fi

    echo "smoke wait: $label attempt $attempt/$MAX_ATTEMPTS (public)"
    sleep "$SLEEP_SECS"
    attempt=$((attempt + 1))
  done

  echo "smoke failed: $label ($url via public)" >&2
  return 1
}

check_public_urls() {
  if ! public_url_enabled; then
    echo "smoke public: skipped (SMOKE_PUBLIC_URLS=$SMOKE_PUBLIC_URLS)"
    return 0
  fi

  if ! command -v curl >/dev/null 2>&1; then
    echo "error: required command not found: curl (public URL smoke)" >&2
    return 1
  fi

  echo "smoke public: enabled"

  if [[ -n "${SERVICE_URL_API_3001:-}" || -n "${SMOKE_PUBLIC_API_URL:-}" ]]; then
    local api_public="${SMOKE_PUBLIC_API_URL:-$(join_url "${SERVICE_URL_API_3001:-}" /v1/health)}"
    wait_for_public "$api_public" "api health public"
  fi

  if [[ -n "${SERVICE_URL_WEB_3000:-}" || -n "${SMOKE_PUBLIC_WEB_URL:-}" ]]; then
    local web_public="${SMOKE_PUBLIC_WEB_URL:-$(join_url "${SERVICE_URL_WEB_3000:-}" /)}"
    wait_for_public "$web_public" "web root public"
  fi
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

if [[ "$MODE" == "compose-exec" ]]; then
  echo "smoke services: api=$API_SERVICE web=$WEB_SERVICE"
fi

wait_for "$API_URL" "api health" "$API_SERVICE" "$MODE"
wait_for "$CONFIG_URL" "api config" "$API_SERVICE" "$MODE"
wait_for "$WEB_URL" "web root" "$WEB_SERVICE" "$MODE"

check_public_urls

echo "smoke: all checks passed"
