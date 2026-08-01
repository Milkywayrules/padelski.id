import { describe, expect, it } from "vitest";
import { createAuditTrailStub } from "./index";

describe("audit-trail stub", () => {
  it("appends entries with generated id and timestamp", async () => {
    const trail = createAuditTrailStub();
    const entry = await trail.append({
      action: "platform_admin.detach",
      actorId: "00000000-0000-4000-8000-000000000001",
      subjectType: "SlotClaim",
      subjectId: "00000000-0000-4000-8000-000000000002",
      metadata: { reason: "support request" },
      requestId: "req-123",
    });

    expect(entry.action).toBe("platform_admin.detach");
    expect(entry.requestId).toBe("req-123");
    expect(entry.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    expect(entry.occurredAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("rejects unknown actions", async () => {
    const trail = createAuditTrailStub();
    await expect(
      trail.append({
        action: "platform_admin.unknown" as "platform_admin.detach",
        actorId: "00000000-0000-4000-8000-000000000001",
        subjectType: "SlotClaim",
        subjectId: "00000000-0000-4000-8000-000000000002",
      }),
    ).rejects.toThrow();
  });
});
