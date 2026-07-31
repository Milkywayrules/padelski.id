import { spawnSync } from "node:child_process";

const DEFAULT_PROJECT = "padelski-id";
const DEFAULT_CONFIG = "dev";

function readLinked(key: "project" | "config"): string | null {
  const result = spawnSync("doppler", ["configure", "get", key, "--plain"], {
    encoding: "utf8",
  });
  if (result.status !== 0) {
    return null;
  }
  const value = result.stdout.trim();
  return value.length > 0 ? value : null;
}

/** Linked config from `doppler setup`, overridable via DOPPLER_PROJECT / DOPPLER_CONFIG. */
export function resolveDopplerTarget(): { project: string; config: string } {
  const project = process.env["DOPPLER_PROJECT"] ?? readLinked("project") ?? DEFAULT_PROJECT;
  const config = process.env["DOPPLER_CONFIG"] ?? readLinked("config") ?? DEFAULT_CONFIG;

  return { project, config };
}

export function isDevDopplerConfig(config: string): boolean {
  return config === "dev" || config.startsWith("dev_");
}
