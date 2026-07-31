import { z } from "zod";

export const playSessionStatusSchema = z.enum(["setup", "active", "completed", "archived"]);

export type PlaySessionStatus = z.infer<typeof playSessionStatusSchema>;

export type PlaySessionEvent =
  | { type: "ACTIVATE" }
  | { type: "COMPLETE" }
  | { type: "ARCHIVE" }
  | { type: "REOPEN" };

const transitions: Record<
  PlaySessionStatus,
  Partial<Record<PlaySessionEvent["type"], PlaySessionStatus>>
> = {
  setup: { ACTIVATE: "active" },
  active: { COMPLETE: "completed" },
  completed: { ARCHIVE: "archived", REOPEN: "active" },
  archived: {},
};

export function transitionPlaySession(
  status: PlaySessionStatus,
  event: PlaySessionEvent,
): PlaySessionStatus {
  const next = transitions[status][event.type];
  if (!next) {
    throw new Error(`Invalid PlaySession transition: ${status} + ${event.type}`);
  }
  return next;
}

export function canTransitionPlaySession(
  status: PlaySessionStatus,
  event: PlaySessionEvent,
): boolean {
  return transitions[status][event.type] !== undefined;
}
