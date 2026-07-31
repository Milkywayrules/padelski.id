import { describe, expect, it } from "vitest";
import { type MatchStatus, canTransitionMatch, transitionMatch } from "./match";

type TransitionCase = {
  from: MatchStatus;
  event: Parameters<typeof transitionMatch>[1];
  to: MatchStatus;
};

const validTransitions: TransitionCase[] = [
  { from: "scheduled", event: { type: "START" }, to: "in_progress" },
  { from: "scheduled", event: { type: "VOID" }, to: "voided" },
  { from: "in_progress", event: { type: "FINISH" }, to: "finished" },
  { from: "in_progress", event: { type: "VOID" }, to: "voided" },
  { from: "finished", event: { type: "RESCHEDULE" }, to: "scheduled" },
  { from: "voided", event: { type: "RESCHEDULE" }, to: "scheduled" },
];

describe("Match transitions", () => {
  it.each(validTransitions)("allows $from + $event.type -> $to", ({ from, event, to }) => {
    expect(transitionMatch(from, event)).toBe(to);
    expect(canTransitionMatch(from, event)).toBe(true);
  });

  it("rejects invalid transitions", () => {
    expect(() => transitionMatch("finished", { type: "START" })).toThrow(
      "Invalid Match transition",
    );
    expect(canTransitionMatch("finished", { type: "START" })).toBe(false);
  });
});
