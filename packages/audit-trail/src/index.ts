import { z } from "zod";

export const auditActionSchema = z.enum(["platform_admin.detach", "platform_admin.support_action"]);

export type AuditAction = z.infer<typeof auditActionSchema>;

export const auditEntrySchema = z.object({
  id: z.string().uuid(),
  action: auditActionSchema,
  /** FK to users.id — the platform admin who performed the action. */
  actorId: z.string().uuid(),
  subjectType: z.string(),
  subjectId: z.string().uuid(),
  metadata: z.record(z.unknown()).optional(),
  requestId: z.string().optional(),
  occurredAt: z.string().datetime(),
});

export type AuditEntry = z.infer<typeof auditEntrySchema>;

export interface AuditTrailWriter {
  append(entry: Omit<AuditEntry, "id" | "occurredAt">): Promise<AuditEntry>;
}

export function createAuditTrailStub(): AuditTrailWriter {
  return {
    async append(entry) {
      return auditEntrySchema.parse({
        ...entry,
        id: crypto.randomUUID(),
        occurredAt: new Date().toISOString(),
      });
    },
  };
}
