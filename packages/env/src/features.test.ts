import { describe, expect, it } from "vitest";
import { defaultR2PrefixForAppEnv } from "./features";

describe("defaultR2PrefixForAppEnv", () => {
  it("maps dev to dev/", () => {
    expect(defaultR2PrefixForAppEnv("dev")).toBe("dev/");
  });

  it("maps prod to prod/", () => {
    expect(defaultR2PrefixForAppEnv("prod")).toBe("prod/");
  });
});
