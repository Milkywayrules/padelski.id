import { describe, expect, it } from "vitest";
import { auditFields } from "./schema/audit";

describe("audit fields", () => {
  it("defines id, createdAt, updatedAt, deletedAt", () => {
    expect(auditFields).toHaveProperty("id");
    expect(auditFields).toHaveProperty("createdAt");
    expect(auditFields).toHaveProperty("updatedAt");
    expect(auditFields).toHaveProperty("deletedAt");
  });
});
