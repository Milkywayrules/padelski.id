#!/usr/bin/env bash
# Resolve Doppler CLI for Coolify helper containers: global `doppler` or `bunx doppler`.
set -euo pipefail

DOPPLER=()

# Coolify writes build-time vars to /artifacts/build-time.env and injects --env-file only
# into `docker compose` commands — not into custom `bash scripts/coolify/*.sh` wrappers.
load_coolify_env() {
  local f
  for f in \
    "${COOLIFY_BUILD_TIME_ENV:-}" \
    "/artifacts/build-time.env" \
    "${COOLIFY_ENV_FILE:-}" \
    ".env"; do
    [[ -z "$f" || ! -f "$f" ]] && continue
    set -a
    # shellcheck disable=SC1090
    source "$f"
    set +a
  done
}

load_coolify_env

resolve_doppler() {
  if command -v doppler >/dev/null 2>&1; then
    DOPPLER=(doppler)
    return 0
  fi

  if command -v bun >/dev/null 2>&1; then
    DOPPLER=(bunx doppler)
    return 0
  fi

  # coolify-helper:1.0.14 — Alpine + docker/curl only (no bun). Bootstrap CLI once per deploy.
  if command -v curl >/dev/null 2>&1; then
    curl -sLf --retry 3 --proto '=https' 'https://cli.doppler.com/install.sh' | sh -s -- --install-path /usr/local/bin
    if command -v doppler >/dev/null 2>&1; then
      DOPPLER=(doppler)
      return 0
    fi
  fi

  echo "error: doppler CLI not found (install on host or provide bun for bunx doppler)" >&2
  exit 1
}

export_doppler_cmd() {
  resolve_doppler
  export PADELSKI_DOPPLER_CMD="${DOPPLER[*]}"
}

doppler_run() {
  export_doppler_cmd
  "${DOPPLER[@]}" run -- "$@"
}

require_doppler_validate() {
  local root="${1:-.}"

  if [[ -z "${DOPPLER_TOKEN:-}" ]]; then
    echo "error: DOPPLER_TOKEN is unset (Pattern A service token required)" >&2
    echo "hint: set DOPPLER_TOKEN in Coolify with Build Variable enabled; custom build/start scripts source /artifacts/build-time.env" >&2
    exit 1
  fi

  export_doppler_cmd

  if command -v bun >/dev/null 2>&1 && [[ -f "$root/package.json" ]]; then
    doppler_run bun run doppler:validate
    return
  fi

  doppler_run bash "$root/scripts/coolify/doppler-validate.sh"
}
