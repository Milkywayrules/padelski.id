#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

for cmd in doppler docker; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "error: required command not found: $cmd" >&2
    exit 1
  fi
done

export DOCKER_BUILDKIT=1

doppler run -- bun run doppler:validate
exec doppler run -- docker compose build "$@"
