import { readFileSync } from "node:fs";
import { join } from "node:path";

import { COMPOSE_WIRED_AT_DEPLOY } from "@padelski/env/manifest";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { z } from "zod";

const healthSchema = z.object({
  status: z.literal("ok"),
  version: z.literal("v1"),
});

const readySchema = z.object({
  status: z.literal("ready"),
  version: z.literal("v1"),
});

describe("Dockerfile preserve-env drift guard", () => {
  it("lists exactly COMPOSE_WIRED_AT_DEPLOY keys", () => {
    const dockerfilePath = join(process.cwd(), "Dockerfile");
    const dockerfile = readFileSync(dockerfilePath, "utf8");
    const preserveEnvMatch = dockerfile.match(/"(--preserve-env=[^"]+)"/);
    expect(preserveEnvMatch).not.toBeNull();

    const preserveEnvValue = preserveEnvMatch?.[1]?.slice("--preserve-env=".length) ?? "";
    const dockerKeys = preserveEnvValue.split(",").sort();
    const manifestKeys = [...COMPOSE_WIRED_AT_DEPLOY].sort();

    expect(dockerKeys).toEqual(manifestKeys);
  });
});

describe("api health schema", () => {
  it("validates health response", () => {
    expect(healthSchema.parse({ status: "ok", version: "v1" })).toEqual({
      status: "ok",
      version: "v1",
    });
  });
});

describe("api readiness schema", () => {
  it("validates ready response", () => {
    expect(readySchema.parse({ status: "ready", version: "v1" })).toEqual({
      status: "ready",
      version: "v1",
    });
  });
});

describe("checkReadiness", () => {
  let checkReadiness: (query: () => Promise<unknown>, timeoutMs?: number) => Promise<boolean>;

  beforeAll(async () => {
    process.env["API_CORS_ORIGIN"] = "https://web.example.com";
    process.env["BETTER_AUTH_SECRET"] = "abcdefghijklmnopqrstuvwxyz123456";
    process.env["BETTER_AUTH_URL"] = "https://api.example.com";
    process.env["DB_URL"] = "postgresql://padelski:padelski@localhost:5432/padelski";
    process.env["REDIS_URL"] = "redis://localhost:6379";
    ({ checkReadiness } = await import("./app"));
  });

  it("returns true when the query succeeds", async () => {
    await expect(checkReadiness(async () => undefined)).resolves.toBe(true);
  });

  it("returns false and logs the cause when the query rejects", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    const ok = await checkReadiness(async () => {
      throw new Error("connection refused to postgres:5432");
    });

    expect(ok).toBe(false);
    expect(String(consoleError.mock.calls[0]?.[1])).toContain("connection refused");
    consoleError.mockRestore();
  });

  it("returns false when the query times out", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    const ok = await checkReadiness(() => new Promise(() => {}), 50);

    expect(ok).toBe(false);
    expect(String(consoleError.mock.calls[0]?.[1])).toContain("timed out");
    consoleError.mockRestore();
  });
});

describe("GET /v1/ready", () => {
  it("answers 503 without exposing the database failure", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const { createApp } = await import("./app");
    const { setDb } = await import("./db");

    setDb({
      execute: async () => {
        throw new Error("connection refused to postgres:5432");
      },
    } as unknown as Parameters<typeof setDb>[0]);

    const response = await createApp().handle(new Request("http://localhost/v1/ready"));
    const body = await response.text();

    expect(response.status).toBe(503);
    expect(body).not.toContain("connection refused");
    expect(body).not.toContain("postgres");
    consoleError.mockRestore();
  });
});
