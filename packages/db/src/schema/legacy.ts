import { pgTable, text } from "drizzle-orm/pg-core";
import { auditFields } from "./audit";

/** Better Auth / org stub tables — expanded in auth integration stories */
export const users = pgTable("users", {
  ...auditFields,
  email: text("email").notNull().unique(),
  name: text("name"),
});

export const organizations = pgTable("organizations", {
  ...auditFields,
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});
