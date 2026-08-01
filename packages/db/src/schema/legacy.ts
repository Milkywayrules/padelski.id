import { pgTable, text } from "drizzle-orm/pg-core";
import { auditFields } from "./audit";

export const organizations = pgTable("organizations", {
  ...auditFields,
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});
