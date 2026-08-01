import { pgTable, text } from "drizzle-orm/pg-core";
import { auditFields } from "./audit";

/** Domain org stub — separate from Better Auth `organization` (auth plugin). */
export const organizations = pgTable("organizations", {
  ...auditFields,
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});
