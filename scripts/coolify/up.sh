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

COOLIFY_PROXY_NETWORK="${COOLIFY_PROXY_NETWORK:-coolify}"

compose_config_text() {
  local compose="$1"
  docker compose -f "$compose" config 2>/dev/null || true
}

discover_api_web_services() {
  local compose="$1"
  local services=""

  services="$(
    compose_config_text "$compose" \
      | grep -E '^  (api|web)(-pr-[0-9]+)?:$' \
      | sed 's/^  //;s/:$//' || true
  )"

  if [[ -z "$services" ]]; then
    services="$(
      docker compose -f "$compose" config --services 2>/dev/null \
        | grep -E '^(api|web)(-pr-[0-9]+)?$' || true
    )"
  fi

  if [[ -z "$services" ]]; then
    services="$(
      grep -E '^  (api|web)(-pr-[0-9]+)?:' "$compose" 2>/dev/null \
        | sed 's/^  //;s/:$//' || true
    )"
  fi

  printf '%s' "$services"
}

router_port_for_id() {
  local router_id="$1"
  case "$router_id" in
    *web*) echo 3000 ;;
    *api*) echo 3001 ;;
    *) echo "" ;;
  esac
}

collect_traefik_router_ids() {
  local config_text="$1"
  printf '%s\n' "$config_text" \
    | grep -oE 'traefik\.http\.routers\.((http|https)-0-[^.]+)\.' \
    | sed 's/traefik\.http\.routers\.//;s/\.$//' \
    | sort -u || true
}

label_present() {
  local config_text="$1"
  local needle="$2"
  grep -Fq "$needle" <<< "$config_text"
}

service_for_router() {
  local router_id="$1"
  local services="$2"
  case "$router_id" in
    *web*) printf '%s\n' "$services" | grep -E '^web(-pr-[0-9]+)?$' | head -1 || true ;;
    *api*) printf '%s\n' "$services" | grep -E '^api(-pr-[0-9]+)?$' | head -1 || true ;;
    *) echo "" ;;
  esac
}

# Coolify regenerates deploy compose and injects shared 127.0.0.1:3000/3001 host binds
# from domain UI config — repo-level `ports: !reset []` is not preserved. Preview deploys
# also omit traefik loadbalancer.server.port labels (coolify#6832). Merge a runtime override.
write_coolify_override() {
  local compose="$ROOT/docker-compose.yml"
  local override="$ROOT/docker-compose.override.yml"
  local merged_config=""
  local services=""
  local router_ids=""
  local patched=0

  if [[ ! -f "$compose" ]]; then
    echo "error: docker-compose.yml not found at $compose" >&2
    exit 1
  fi

  merged_config="$(compose_config_text "$compose")"
  services="$(discover_api_web_services "$compose")"

  if [[ -z "$services" ]]; then
    echo "warn: no api/web compose services — skipping coolify override" >&2
    rm -f "$override"
    return 0
  fi

  declare -A label_lines=()
  router_ids="$(collect_traefik_router_ids "$merged_config")"
  while IFS= read -r router_id; do
    [[ -z "$router_id" ]] && continue

    local port target_svc service_label router_service_label
    port="$(router_port_for_id "$router_id")"
    [[ -z "$port" ]] && continue

    target_svc="$(service_for_router "$router_id" "$services")"
    [[ -z "$target_svc" ]] && continue

    service_label="traefik.http.services.${router_id}.loadbalancer.server.port=${port}"
    router_service_label="traefik.http.routers.${router_id}.service=${router_id}"

    if ! label_present "$merged_config" "$service_label"; then
      label_lines["$target_svc"]+=$'\n'"      - ${service_label}"
      patched=$((patched + 1))
    fi
    if ! label_present "$merged_config" "traefik.http.routers.${router_id}.service="; then
      label_lines["$target_svc"]+=$'\n'"      - ${router_service_label}"
      patched=$((patched + 1))
    fi
  done <<< "$router_ids"

  while IFS= read -r svc; do
    [[ -z "$svc" ]] && continue
    local network_label="traefik.docker.network=${COOLIFY_PROXY_NETWORK}"
    if ! label_present "$merged_config" "$network_label"; then
      label_lines["$svc"]+=$'\n'"      - ${network_label}"
      patched=$((patched + 1))
    fi
  done <<< "$services"

  {
    echo "services:"
    while IFS= read -r svc; do
      [[ -z "$svc" ]] && continue
      printf '  %s:\n    ports: !reset []\n' "$svc"
      if [[ -n "${label_lines[$svc]:-}" ]]; then
        echo "    labels:"
        printf '%s\n' "${label_lines[$svc]}" | sed '/^$/d'
      fi
    done <<< "$services"
  } > "$override"

  echo "port-strip override for:$(printf ' %s' $services)"
  if (( patched > 0 )); then
    echo "traefik port labels patched: ${patched}"
  fi
}

write_coolify_override

doppler_run docker compose up -d --wait --remove-orphans "$@"
bash "$ROOT/scripts/coolify/smoke.sh"
