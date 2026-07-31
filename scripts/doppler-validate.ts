#!/usr/bin/env bun
/**
 * Validates Doppler config keys against packages/env manifest (config-as-code).
 * Values are SoT in Doppler — this checks key presence, forbidden keys, mirrors.
 *
 * Target: linked config from `doppler setup`, overridable via DOPPLER_PROJECT / DOPPLER_CONFIG.
 */
import { spawnSync } from "node:child_process";

import {
  DOPPLER_CONFIG_TO_APP_ENV,
  DOPPLER_MIRROR_PAIRS,
  type DopplerConfigSlug,
  forbiddenKeysForConfig,
  requiredKeysForConfig,
} from "@padelski/env/manifest";

import { resolveDopplerTarget } from "./doppler-target";

const { project: PROJECT, config } = resolveDopplerTarget();

if (!(config in DOPPLER_CONFIG_TO_APP_ENV)) {
  console.error(`unknown Doppler config: ${config}`);
  process.exit(1);
}

const dopplerConfig = config as DopplerConfigSlug;

function getSecretPlain(key: string): string | null {
  const result = spawnSync(
    "doppler",
    ["secrets", "get", key, "--plain", "-p", PROJECT, "-c", dopplerConfig],
    { encoding: "utf8" },
  );
  if (result.status !== 0) {
    return null;
  }
  return result.stdout.trim();
}

const result = spawnSync(
  "doppler",
  ["secrets", "--only-names", "--json", "-p", PROJECT, "-c", dopplerConfig],
  { encoding: "utf8" },
);

if (result.status !== 0) {
  console.error(result.stderr || "doppler secrets failed — run bun run doppler:setup");
  process.exit(1);
}

const present = new Set(Object.keys(JSON.parse(result.stdout) as Record<string, unknown>));
const required = requiredKeysForConfig(dopplerConfig);
const forbidden = forbiddenKeysForConfig(dopplerConfig);
const expectedAppEnv = DOPPLER_CONFIG_TO_APP_ENV[dopplerConfig];

let failed = false;

for (const key of required) {
  if (!present.has(key)) {
    console.error(`missing required key in Doppler ${dopplerConfig}: ${key}`);
    failed = true;
  }
}

for (const key of forbidden) {
  if (present.has(key)) {
    console.error(`forbidden key in Doppler ${dopplerConfig}: ${key}`);
    failed = true;
  }
}

if (present.has("APP_ENV")) {
  const value = getSecretPlain("APP_ENV");
  if (value && value !== expectedAppEnv) {
    console.error(
      `APP_ENV mismatch in Doppler ${dopplerConfig}: got "${value}", expected "${expectedAppEnv}"`,
    );
    failed = true;
  }
}

for (const [left, right] of DOPPLER_MIRROR_PAIRS) {
  if (!present.has(left) || !present.has(right)) {
    continue;
  }
  const leftValue = getSecretPlain(left);
  const rightValue = getSecretPlain(right);
  if (leftValue && rightValue && leftValue !== rightValue) {
    console.error(
      `mirror mismatch in Doppler ${dopplerConfig}: ${left} (${leftValue}) != ${right} (${rightValue})`,
    );
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log(
  `Doppler ${PROJECT}/${dopplerConfig} keys OK (${present.size} secrets, APP_ENV=${expectedAppEnv})`,
);
