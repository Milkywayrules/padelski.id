#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

API_URL="${SMOKE_API_URL:-http://127.0.0.1:3001/v1/health}"
WEB_URL="${SMOKE_WEB_URL:-http://127.0.0.1:3000/}"
CONFIG_URL="${SMOKE_CONFIG_URL:-http://127.0.0.1:3001/v1/config}"
MAX_ATTEMPTS="${SMOKE_MAX_ATTEMPTS:-30}"
SLEEP_SECS="${SMOKE_SLEEP_SECS:-2}"

wait_for() {
  local url="$1"
  local label="$2"
  local attempt=1

  while (( attempt <= MAX_ATTEMPTS )); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      echo "smoke ok: $label ($url)"
      return 0
    fi
    echo "smoke wait: $label attempt $attempt/$MAX_ATTEMPTS"
    sleep "$SLEEP_SECS"
    attempt=$((attempt + 1))
  done

  echo "smoke failed: $label ($url)" >&2
  return 1
}

for cmd in curl; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "error: required command not found: $cmd" >&2
    exit 1
  fi
done

wait_for "$API_URL" "api health"
wait_for "$CONFIG_URL" "api config"
wait_for "$WEB_URL" "web root"

echo "smoke: all checks passed"
