import { describe, expect, it } from "vitest";
import { evaluateCompletePlaySession } from "./play-session-guards";

describe("evaluateCompletePlaySession", () => {
  it("blocks when any match is in_progress", () => {
    const result = evaluateCompletePlaySession([
      { id: "m1", status: "finished" },
      { id: "m2", status: "in_progress" },
    ]);
    expect(result).toEqual({
      blocked: true,
      reason: "match_in_progress",
      matchIds: ["m2"],
    });
  });

  it("lists scheduled matches to void when allowed", () => {
    const result = evaluateCompletePlaySession([
      { id: "m1", status: "finished" },
      { id: "m2", status: "scheduled" },
    ]);
    expect(result).toEqual({ blocked: false, scheduledToVoid: ["m2"] });
  });
});
