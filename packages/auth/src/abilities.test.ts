import { describe, expect, it } from "vitest";
import { defineAbilitiesFor } from "./abilities";

describe("CASL abilities stub", () => {
  it("grants read to all roles", () => {
    const ability = defineAbilitiesFor("member");
    expect(ability.can("read", "PlaySession")).toBe(true);
    expect(ability.can("manage", "PlaySession")).toBe(false);
  });

  it("grants organizer permissions", () => {
    const ability = defineAbilitiesFor("organizer");
    expect(ability.can("manage", "PlaySession")).toBe(true);
    expect(ability.can("approve", "SlotClaim")).toBe(true);
  });

  it("grants admin organization management", () => {
    const ability = defineAbilitiesFor("admin");
    expect(ability.can("manage", "Organization")).toBe(true);
  });
});
