import { describe, expect, it } from "vitest";
import {
  type PlaySessionStatus,
  canTransitionPlaySession,
  transitionPlaySession,
} from "./play-session";

type TransitionCase = {
  from: PlaySessionStatus;
  event: Parameters<typeof transitionPlaySession>[1];
  to: PlaySessionStatus;
};

const validTransitions: TransitionCase[] = [
  { from: "setup", event: { type: "ACTIVATE" }, to: "active" },
  { from: "active", event: { type: "COMPLETE" }, to: "completed" },
  { from: "completed", event: { type: "ARCHIVE" }, to: "archived" },
  { from: "completed", event: { type: "REOPEN" }, to: "active" },
];

describe("PlaySession transitions", () => {
  it.each(validTransitions)("allows $from + $event.type -> $to", ({ from, event, to }) => {
    expect(transitionPlaySession(from, event)).toBe(to);
    expect(canTransitionPlaySession(from, event)).toBe(true);
  });

  it("rejects invalid transitions", () => {
    expect(() => transitionPlaySession("setup", { type: "COMPLETE" })).toThrow(
      "Invalid PlaySession transition",
    );
    expect(canTransitionPlaySession("archived", { type: "ACTIVATE" })).toBe(false);
  });
});
