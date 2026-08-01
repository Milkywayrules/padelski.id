#!/usr/bin/env bash
# Gate offload Task spawns: require ## offload-meta with scope-out when layer-rules are present.
set -euo pipefail

input="$(cat)"
task="$(python3 -c 'import json,sys; print(json.load(sys.stdin).get("task",""))' <<<"$input")"

is_offload=0
if [[ "$task" == *"Layer rules:"* ]]; then
  is_offload=1
fi
if [[ "$task" == *"## offload-meta"* ]]; then
  is_offload=1
fi

if [[ "$is_offload" -eq 0 ]]; then
  printf '%s\n' '{"permission":"allow"}'
  exit 0
fi

if [[ "$task" != *"## offload-meta"* ]]; then
  printf '%s\n' '{"permission":"deny","user_message":"Offload spawn blocked: missing ## offload-meta block."}'
  exit 0
fi

if ! printf '%s' "$task" | grep -qE 'scope-out:[[:space:]]*[^[:space:]<]'; then
  printf '%s\n' '{"permission":"deny","user_message":"Offload spawn blocked: missing scope-out in ## offload-meta."}'
  exit 0
fi

printf '%s\n' '{"permission":"allow"}'
