import { z } from "zod";

export const activityActionSchema = z.enum([
  "play_session.created",
  "play_session.activated",
  "match.scheduled",
  "slot_claim.requested",
]);

export type ActivityAction = z.infer<typeof activityActionSchema>;

export const activityEntrySchema = z.object({
  id: z.string().uuid(),
  action: activityActionSchema,
  /** FK to users.id — the authenticated user who performed the action. */
  actorId: z.string().uuid(),
  subjectType: z.string(),
  subjectId: z.string().uuid(),
  playSessionId: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional(),
  occurredAt: z.string().datetime(),
});

export type ActivityEntry = z.infer<typeof activityEntrySchema>;

export interface ActivityLogWriter {
  append(entry: Omit<ActivityEntry, "id" | "occurredAt">): Promise<ActivityEntry>;
}

export function createActivityLogStub(): ActivityLogWriter {
  return {
    async append(entry) {
      return activityEntrySchema.parse({
        ...entry,
        id: crypto.randomUUID(),
        occurredAt: new Date().toISOString(),
      });
    },
  };
}
