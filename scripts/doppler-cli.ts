import { type SpawnSyncOptionsWithStringEncoding, spawnSync } from "node:child_process";

/** Set by scripts/coolify/ensure-doppler.sh — e.g. "doppler" or "bunx doppler". */
export function resolveDopplerInvocation(): { command: string; prefixArgs: string[] } {
  const fromEnv = process.env["PADELSKI_DOPPLER_CMD"]?.trim();
  if (fromEnv) {
    const parts = fromEnv.split(/\s+/).filter(Boolean);
    if (parts.length > 0) {
      return { command: parts[0] ?? "doppler", prefixArgs: parts.slice(1) };
    }
  }
  return { command: "doppler", prefixArgs: [] };
}

export function spawnDoppler(
  args: string[],
  options?: SpawnSyncOptionsWithStringEncoding,
): ReturnType<typeof spawnSync> {
  const { command, prefixArgs } = resolveDopplerInvocation();
  return spawnSync(command, [...prefixArgs, ...args], {
    encoding: "utf8",
    ...options,
  });
}
