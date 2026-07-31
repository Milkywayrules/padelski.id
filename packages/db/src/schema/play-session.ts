import { index, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { auditFields } from "./audit";
import { players } from "./player";

export const playSessionStatusEnum = pgEnum("play_session_status", [
  "setup",
  "active",
  "completed",
  "archived",
]);

export const playSessionVisibilityEnum = pgEnum("play_session_visibility", ["public", "private"]);

export const playSessions = pgTable(
  "play_sessions",
  {
    ...auditFields,
    organizerPlayerId: uuid("organizer_player_id")
      .notNull()
      .references(() => players.id),
    courtBlockRef: text("court_block_ref").notNull(),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    status: playSessionStatusEnum("status").notNull().default("setup"),
    visibility: playSessionVisibilityEnum("visibility").notNull().default("public"),
  },
  (table) => [
    index("play_sessions_scheduled_at_idx").on(table.scheduledAt),
    index("play_sessions_organizer_player_id_idx").on(table.organizerPlayerId),
  ],
);
