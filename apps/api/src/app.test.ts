import { describe, expect, it } from "vitest";
import { z } from "zod";

const healthSchema = z.object({
  status: z.literal("ok"),
  version: z.literal("v1"),
});

describe("api health schema", () => {
  it("validates health response", () => {
    expect(healthSchema.parse({ status: "ok", version: "v1" })).toEqual({
      status: "ok",
      version: "v1",
    });
  });
});
