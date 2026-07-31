#!/usr/bin/env bun
/**
 * Deletes every user-managed secret from a Doppler config.
 * Doppler-injected DOPPLER_* keys cannot be removed, so they are skipped.
 * Output is captured, never printed — `doppler secrets delete` echoes values.
 *
 * Target: linked config from `doppler setup`, overridable via DOPPLER_PROJECT / DOPPLER_CONFIG.
 */
import { spawnSync } from "node:child_process";

import { isDevDopplerConfig, resolveDopplerTarget } from "./doppler-target";

const { project: PROJECT, config: CONFIG } = resolveDopplerTarget();
const confirmed = process.argv.includes("--yes");

if (!(isDevDopplerConfig(CONFIG) || confirmed)) {
  console.error(`refusing to clear ${PROJECT}/${CONFIG} without --yes`);
  process.exit(1);
}

const listed = spawnSync(
  "doppler",
  ["secrets", "--only-names", "--json", "-p", PROJECT, "-c", CONFIG],
  { encoding: "utf8" },
);

if (listed.status !== 0) {
  console.error(listed.stderr || `cannot read ${PROJECT}/${CONFIG}`);
  process.exit(1);
}

const names = Object.keys(JSON.parse(listed.stdout) as Record<string, unknown>);
const deletable = names.filter((name) => !name.startsWith("DOPPLER_"));

if (deletable.length === 0) {
  console.log(`Doppler ${PROJECT}/${CONFIG} already clear`);
  process.exit(0);
}

const deleted = spawnSync(
  "doppler",
  ["secrets", "delete", "-p", PROJECT, "-c", CONFIG, "-y", "--silent", ...deletable],
  { encoding: "utf8" },
);

if (deleted.status !== 0) {
  console.error(deleted.stderr || `failed to clear ${PROJECT}/${CONFIG}`);
  process.exit(1);
}

console.log(`Doppler ${PROJECT}/${CONFIG} cleared (${deletable.length} secrets deleted)`);
