import { describe, expect, it } from "vitest";
import { createActivityLogStub } from "./index";

describe("activity-log stub", () => {
  it("appends entries with generated id and timestamp", async () => {
    const log = createActivityLogStub();
    const entry = await log.append({
      action: "play_session.created",
      actorId: "00000000-0000-4000-8000-000000000001",
      subjectType: "PlaySession",
      subjectId: "00000000-0000-4000-8000-000000000002",
    });

    expect(entry.action).toBe("play_session.created");
    expect(entry.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });
});
