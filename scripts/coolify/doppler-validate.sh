#!/usr/bin/env bash
# Minimal doppler:validate for Coolify helper (no bun). Full checks: bun run doppler:validate locally/CI.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
COMPOSE="${ROOT}/docker-compose.yml"

if [[ -z "${DOPPLER_TOKEN:-}" ]]; then
  echo "error: DOPPLER_TOKEN is unset" >&2
  exit 1
fi

if ! command -v doppler >/dev/null 2>&1; then
  echo "error: doppler CLI not found" >&2
  exit 1
fi

# Keep in sync with packages/env/src/manifest.ts (dev/prod deploy configs).
required_keys=(
  APP_ENV
  API_CORS_ORIGIN
  BETTER_AUTH_SECRET
  BETTER_AUTH_URL
  EMAIL_FROM
  NEXT_PUBLIC_APP_URL
  NEXT_PUBLIC_API_URL
  OAUTH_GITHUB_CLIENT_ID
  OAUTH_GITHUB_CLIENT_SECRET
  RESEND_API_KEY
  POSTGRES_PASSWORD
)

failed=0
compose="$(cat "$COMPOSE")"

for key in "${required_keys[@]}"; do
  if [[ "$compose" != *"\${${key}}"* ]]; then
    echo "docker-compose.yml missing passthrough for ${key}" >&2
    failed=1
  fi
done

if ! names_json="$(doppler secrets --only-names --json 2>/dev/null)"; then
  echo "doppler secrets failed — check DOPPLER_TOKEN" >&2
  exit 1
fi

for key in "${required_keys[@]}"; do
  if ! grep -q "\"${key}\"" <<<"$names_json"; then
    echo "missing required key in Doppler: ${key}" >&2
    failed=1
  fi
done

if (( failed != 0 )); then
  exit 1
fi

count="$(grep -c '":' <<<"$names_json" || true)"
echo "Doppler keys OK (helper validate, ${count} secrets)"
