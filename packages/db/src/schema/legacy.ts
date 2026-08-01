import { pgTable, text } from "drizzle-orm/pg-core";
import { auditFields } from "./audit";

export { users } from "./users";

/** Org stub table — expanded in auth integration stories */
export const organizations = pgTable("organizations", {
  ...auditFields,
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});
