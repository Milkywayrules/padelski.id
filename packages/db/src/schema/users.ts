import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { baseAuditFields } from "./audit-base";

/** Better Auth user stub — expanded in auth integration stories */
export const users = pgTable("users", {
  ...baseAuditFields,
  createdBy: uuid("created_by").references((): AnyPgColumn => users.id),
  updatedBy: uuid("updated_by").references((): AnyPgColumn => users.id),
  email: text("email").notNull().unique(),
  name: text("name"),
});
