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

  # coolify-helper:1.0.14 — Alpine + docker/curl only (no bun, no gnupg). Use apk repo per Doppler docs.
  if command -v apk >/dev/null 2>&1; then
    if bootstrap_doppler_alpine; then
      DOPPLER=(doppler)
      return 0
    fi
  fi

  echo "error: doppler CLI not found (install on host or provide bun for bunx doppler)" >&2
  exit 1
}

bootstrap_doppler_alpine() {
  local key_path="/etc/apk/keys/cli@doppler-8004D9FF50437357.rsa.pub"
  local repo_line="https://packages.doppler.com/public/cli/alpine/any-version/main"

  if ! command -v doppler >/dev/null 2>&1; then
    if command -v curl >/dev/null 2>&1; then
      curl -fsSL --retry 3 --proto '=https' \
        'https://packages.doppler.com/public/cli/rsa.8004D9FF50437357.key' \
        -o "$key_path"
    elif command -v wget >/dev/null 2>&1; then
      wget -q -t3 'https://packages.doppler.com/public/cli/rsa.8004D9FF50437357.key' -O "$key_path"
    else
      return 1
    fi

    if ! grep -qF "$repo_line" /etc/apk/repositories 2>/dev/null; then
      echo "$repo_line" >>/etc/apk/repositories
    fi

    apk add --no-cache doppler
  fi

  command -v doppler >/dev/null 2>&1
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
