import { serverEnv } from "./server";

export function assertEnvLoaded(): void {
  if (!serverEnv.APP_ENV) {
    throw new Error("Environment validation failed: APP_ENV is required");
  }
}
