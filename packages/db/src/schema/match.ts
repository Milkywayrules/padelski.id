import { index, jsonb, pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { auditFields } from "./audit";
import { playSessions } from "./play-session";

export const matchStatusEnum = pgEnum("match_status", [
  "scheduled",
  "in_progress",
  "finished",
  "voided",
]);

export const matchTeamEnum = pgEnum("match_team", ["A", "B"]);

export const matches = pgTable(
  "matches",
  {
    ...auditFields,
    playSessionId: uuid("play_session_id")
      .notNull()
      .references(() => playSessions.id),
    status: matchStatusEnum("status").notNull().default("scheduled"),
    result: jsonb("result").$type<{ teamA: number; teamB: number }>().notNull().default({
      teamA: 0,
      teamB: 0,
    }),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
  },
  (table) => [
    index("matches_play_session_id_status_idx").on(table.playSessionId, table.status),
    index("matches_finished_at_idx").on(table.finishedAt),
  ],
);

export const matchSlots = pgTable(
  "match_slots",
  {
    ...auditFields,
    matchId: uuid("match_id")
      .notNull()
      .references(() => matches.id),
    slotId: uuid("slot_id").notNull(),
    team: matchTeamEnum("team").notNull(),
  },
  (table) => [
    index("match_slots_match_id_idx").on(table.matchId),
    index("match_slots_slot_id_idx").on(table.slotId),
  ],
);
