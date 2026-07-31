import { describe, expect, it } from "vitest";
import { z } from "zod";

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
