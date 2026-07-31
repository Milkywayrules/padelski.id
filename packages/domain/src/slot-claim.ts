import { z } from "zod";

export const slotClaimStatusSchema = z.enum([
  "requested",
  "awaiting_organizer",
  "approved",
  "applied",
  "rejected",
  "expired",
  "detached",
]);

export type SlotClaimStatus = z.infer<typeof slotClaimStatusSchema>;

export type SlotClaimEvent =
  | { type: "SUBMIT_TO_ORGANIZER" }
  | { type: "APPROVE" }
  | { type: "REJECT" }
  | { type: "APPLY" }
  | { type: "EXPIRE" }
  | { type: "DETACH" }
  | { type: "RE_REQUEST" };

const transitions: Record<
  SlotClaimStatus,
  Partial<Record<SlotClaimEvent["type"], SlotClaimStatus>>
> = {
  requested: { SUBMIT_TO_ORGANIZER: "awaiting_organizer", EXPIRE: "expired", DETACH: "detached" },
  awaiting_organizer: {
    APPROVE: "approved",
    REJECT: "rejected",
    EXPIRE: "expired",
    DETACH: "detached",
  },
  approved: { APPLY: "applied", EXPIRE: "expired", DETACH: "detached" },
  applied: { DETACH: "detached" },
  rejected: { RE_REQUEST: "requested", DETACH: "detached" },
  expired: { RE_REQUEST: "requested", DETACH: "detached" },
  detached: {},
};

export function transitionSlotClaim(
  status: SlotClaimStatus,
  event: SlotClaimEvent,
): SlotClaimStatus {
  const next = transitions[status][event.type];
  if (!next) {
    throw new Error(`Invalid SlotClaim transition: ${status} + ${event.type}`);
  }
  return next;
}

export function canTransitionSlotClaim(status: SlotClaimStatus, event: SlotClaimEvent): boolean {
  return transitions[status][event.type] !== undefined;
}
