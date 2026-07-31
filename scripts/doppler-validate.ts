#!/usr/bin/env bun
/**
 * Validates Doppler config keys against packages/env manifest (config-as-code).
 * Values are SoT in Doppler — this checks key presence, forbidden keys, mirrors.
 *
 * Target: linked config from `doppler setup`, overridable via DOPPLER_PROJECT / DOPPLER_CONFIG.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  DOPPLER_CONFIG_TO_APP_ENV,
  DOPPLER_DEPLOY_KEYS,
  DOPPLER_MIRROR_PAIRS,
  DOPPLER_RUNTIME_KEYS,
  type DopplerConfigSlug,
  forbiddenKeysForConfig,
  requiredKeysForConfig,
} from "@padelski/env/manifest";

import { spawnDoppler } from "./doppler-cli";
import { resolveDopplerTarget } from "./doppler-target";

const ROOT = join(import.meta.dir, "..");
const COMPOSE_PATH = join(ROOT, "docker-compose.yml");

const { project: PROJECT, config } = resolveDopplerTarget();

if (!(config in DOPPLER_CONFIG_TO_APP_ENV)) {
  console.error(`unknown Doppler config: ${config}`);
  process.exit(1);
}

const dopplerConfig = config as DopplerConfigSlug;

function getSecretPlain(key: string): string | null {
  const result = spawnDoppler(["secrets", "get", key, "--plain", "-p", PROJECT, "-c", dopplerConfig]);
  if (result.status !== 0) {
    return null;
  }
  return result.stdout.trim();
}

function assertComposePassthrough(): boolean {
  let ok = true;
  const compose = readFileSync(COMPOSE_PATH, "utf8");

  for (const key of DOPPLER_RUNTIME_KEYS) {
    if (!compose.includes(`\${${key}}`)) {
      console.error(`docker-compose.yml missing Doppler passthrough for ${key} (Pattern A Option 2)`);
      ok = false;
    }
  }

  for (const key of DOPPLER_DEPLOY_KEYS) {
    if (!compose.includes(`\${${key}}`)) {
      console.error(`docker-compose.yml missing passthrough for deploy key ${key}`);
      ok = false;
    }
  }

  return ok;
}

const result = spawnDoppler(["secrets", "--only-names", "--json", "-p", PROJECT, "-c", dopplerConfig]);

if (result.status !== 0) {
  console.error(result.stderr || "doppler secrets failed — run bun run doppler:setup");
  process.exit(1);
}

const present = new Set(Object.keys(JSON.parse(result.stdout) as Record<string, unknown>));
const required = requiredKeysForConfig(dopplerConfig);
const forbidden = forbiddenKeysForConfig(dopplerConfig);
const expectedAppEnv = DOPPLER_CONFIG_TO_APP_ENV[dopplerConfig];

let failed = false;

if (!assertComposePassthrough()) {
  failed = true;
}

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
    console.error(`mirror mismatch in Doppler ${dopplerConfig}: ${left} != ${right} (values redacted)`);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log(
  `Doppler ${PROJECT}/${dopplerConfig} keys OK (${present.size} secrets, APP_ENV=${expectedAppEnv})`,
);
