import { describe, expect, it } from "vitest";
import { z } from "zod";

import { forbiddenKeysForConfig, requiredKeysForConfig } from "./manifest";

const COMPOSE_URL_KEYS = [
  "API_CORS_ORIGIN",
  "BETTER_AUTH_URL",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_API_URL",
] as const;

const appEnvSchema = z.enum(["dev", "prod"]);

describe("env schema", () => {
  it("accepts dev and prod", () => {
    expect(appEnvSchema.parse("dev")).toBe("dev");
    expect(appEnvSchema.parse("prod")).toBe("prod");
  });

  it("rejects unknown values", () => {
    expect(() => appEnvSchema.parse("staging")).toThrow();
  });
});

describe("manifest URL key classification", () => {
  it("forbids all four URL keys in dev deploy config", () => {
    const forbidden = forbiddenKeysForConfig("dev");
    for (const key of COMPOSE_URL_KEYS) {
      expect(forbidden).toContain(key);
    }
  });

  it("forbids all four URL keys in prod deploy config", () => {
    const forbidden = forbiddenKeysForConfig("prod");
    for (const key of COMPOSE_URL_KEYS) {
      expect(forbidden).toContain(key);
    }
  });

  it("requires all four URL keys in dev_personal config", () => {
    const required = requiredKeysForConfig("dev_personal");
    for (const key of COMPOSE_URL_KEYS) {
      expect(required).toContain(key);
    }
  });

  it("does not require URL keys in dev deploy config", () => {
    const required = requiredKeysForConfig("dev");
    for (const key of COMPOSE_URL_KEYS) {
      expect(required).not.toContain(key);
    }
  });
});
