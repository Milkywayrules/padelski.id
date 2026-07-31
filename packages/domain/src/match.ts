import { z } from "zod";

export const matchStatusSchema = z.enum(["scheduled", "in_progress", "finished", "voided"]);

export type MatchStatus = z.infer<typeof matchStatusSchema>;

export type MatchEvent =
  | { type: "START" }
  | { type: "FINISH" }
  | { type: "VOID" }
  | { type: "RESCHEDULE" };

const transitions: Record<MatchStatus, Partial<Record<MatchEvent["type"], MatchStatus>>> = {
  scheduled: { START: "in_progress", VOID: "voided" },
  in_progress: { FINISH: "finished", VOID: "voided" },
  finished: { RESCHEDULE: "scheduled" },
  voided: { RESCHEDULE: "scheduled" },
};

export function transitionMatch(status: MatchStatus, event: MatchEvent): MatchStatus {
  const next = transitions[status][event.type];
  if (!next) {
    throw new Error(`Invalid Match transition: ${status} + ${event.type}`);
  }
  return next;
}

export function canTransitionMatch(status: MatchStatus, event: MatchEvent): boolean {
  return transitions[status][event.type] !== undefined;
}
