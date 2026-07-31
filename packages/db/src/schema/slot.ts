import { index, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { auditFields } from "./audit";
import { playSessions } from "./play-session";
import { players } from "./player";

export const slots = pgTable(
  "slots",
  {
    ...auditFields,
    playSessionId: uuid("play_session_id")
      .notNull()
      .references(() => playSessions.id),
    nickname: text("nickname").notNull(),
    playerId: uuid("player_id").references(() => players.id),
  },
  (table) => [
    index("slots_play_session_id_idx").on(table.playSessionId),
    index("slots_player_id_idx").on(table.playerId),
  ],
);
