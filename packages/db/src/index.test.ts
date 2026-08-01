import { describe, expect, it } from "vitest";
import { auditFields } from "./schema/audit";

describe("audit fields", () => {
  it("defines id, timestamps, soft-delete, and user audit columns", () => {
    expect(auditFields).toHaveProperty("id");
    expect(auditFields).toHaveProperty("createdAt");
    expect(auditFields).toHaveProperty("updatedAt");
    expect(auditFields).toHaveProperty("deletedAt");
    expect(auditFields).toHaveProperty("createdBy");
    expect(auditFields).toHaveProperty("updatedBy");
  });
});
