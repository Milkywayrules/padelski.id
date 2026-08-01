import { describe, expect, it } from "vitest";
import { deriveBaseNickname, sanitizeNickname } from "./link-player";

describe("link player nickname helpers", () => {
  it("sanitizes nicknames to lowercase alphanumeric", () => {
    expect(sanitizeNickname("  Foo Bar!  ")).toBe("foobar");
    expect(sanitizeNickname("***")).toBe("player");
  });

  it("prefers display name over email local part", () => {
    expect(
      deriveBaseNickname({
        id: "00000000-0000-0000-0000-000000000001",
        email: "dio@padelski.id",
        name: "Dio Player",
      }),
    ).toBe("dioplayer");
  });

  it("falls back to email local part when name is empty", () => {
    expect(
      deriveBaseNickname({
        id: "00000000-0000-0000-0000-000000000002",
        email: "court.captain@padelski.id",
        name: "   ",
      }),
    ).toBe("courtcaptain");
  });
});
