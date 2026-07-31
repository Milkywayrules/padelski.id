#!/usr/bin/env bash
# Skip dev hooks in Docker/CI environments without git (see apps/*/Dockerfile --ignore-scripts).
set -euo pipefail

if ! command -v git >/dev/null 2>&1; then
  exit 0
fi

if ! command -v lefthook >/dev/null 2>&1; then
  exit 0
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
lefthook install
bash "$ROOT/scripts/governance/ensure-pre-push-gate.sh"
