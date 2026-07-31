import { playSessionStatusSchema } from "@padelski/domain";
import { describe, expect, it } from "vitest";

describe("web scaffold", () => {
  it("imports domain types", () => {
    expect(playSessionStatusSchema.options).toContain("setup");
  });
});
