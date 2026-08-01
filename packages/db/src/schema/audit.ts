import { uuid } from "drizzle-orm/pg-core";
import { baseAuditFields } from "./audit-base";
import { users } from "./users";

export const auditFields = {
  ...baseAuditFields,
  createdBy: uuid("created_by").references(() => users.id),
  updatedBy: uuid("updated_by").references(() => users.id),
};

export type AuditFields = typeof auditFields;
