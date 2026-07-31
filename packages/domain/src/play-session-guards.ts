import type { MatchStatus } from "./match";

export type CompletePlaySessionBlockReason =
  | { blocked: true; reason: "match_in_progress"; matchIds: string[] }
  | { blocked: false; scheduledToVoid: string[] };

export function evaluateCompletePlaySession(
  matchStatuses: { id: string; status: MatchStatus }[],
): CompletePlaySessionBlockReason {
  const inProgress = matchStatuses.filter((m) => m.status === "in_progress");
  if (inProgress.length > 0) {
    return { blocked: true, reason: "match_in_progress", matchIds: inProgress.map((m) => m.id) };
  }
  const scheduled = matchStatuses.filter((m) => m.status === "scheduled");
  return { blocked: false, scheduledToVoid: scheduled.map((m) => m.id) };
}

export function canArchivePlaySession(status: string): boolean {
  return status === "completed";
}
