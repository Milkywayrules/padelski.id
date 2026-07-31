import { index, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { auditFields } from "./audit";

export const players = pgTable(
  "players",
  {
    ...auditFields,
    nickname: text("nickname").notNull().unique(),
    fullName: text("full_name"),
    userId: uuid("user_id"),
  },
  (table) => [index("players_user_id_idx").on(table.userId)],
);
