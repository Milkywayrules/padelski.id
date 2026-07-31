import { describe, expect, it } from "vitest";
import { type SlotClaimStatus, canTransitionSlotClaim, transitionSlotClaim } from "./slot-claim";

type TransitionCase = {
  from: SlotClaimStatus;
  event: Parameters<typeof transitionSlotClaim>[1];
  to: SlotClaimStatus;
};

const validTransitions: TransitionCase[] = [
  {
    from: "requested",
    event: { type: "SUBMIT_TO_ORGANIZER" },
    to: "awaiting_organizer",
  },
  { from: "requested", event: { type: "EXPIRE" }, to: "expired" },
  { from: "requested", event: { type: "DETACH" }, to: "detached" },
  { from: "awaiting_organizer", event: { type: "APPROVE" }, to: "approved" },
  { from: "awaiting_organizer", event: { type: "REJECT" }, to: "rejected" },
  { from: "awaiting_organizer", event: { type: "EXPIRE" }, to: "expired" },
  { from: "approved", event: { type: "APPLY" }, to: "applied" },
  { from: "approved", event: { type: "EXPIRE" }, to: "expired" },
  { from: "applied", event: { type: "DETACH" }, to: "detached" },
  { from: "rejected", event: { type: "RE_REQUEST" }, to: "requested" },
  { from: "expired", event: { type: "RE_REQUEST" }, to: "requested" },
];

describe("SlotClaim transitions", () => {
  it.each(validTransitions)("allows $from + $event.type -> $to", ({ from, event, to }) => {
    expect(transitionSlotClaim(from, event)).toBe(to);
    expect(canTransitionSlotClaim(from, event)).toBe(true);
  });

  it("rejects invalid transitions", () => {
    expect(() => transitionSlotClaim("applied", { type: "APPROVE" })).toThrow(
      "Invalid SlotClaim transition",
    );
    expect(canTransitionSlotClaim("detached", { type: "RE_REQUEST" })).toBe(false);
  });
});
