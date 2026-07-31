import { index, jsonb, pgEnum, pgTable, uuid } from "drizzle-orm/pg-core";
import { auditFields } from "./audit";
import { matches } from "./match";

export const scoreEventActionEnum = pgEnum("score_event_action", [
  "increment",
  "decrement",
  "type",
  "undo",
]);

export const scoreEventTeamEnum = pgEnum("score_event_team", ["A", "B"]);

export const scoreEvents = pgTable(
  "score_events",
  {
    ...auditFields,
    matchId: uuid("match_id")
      .notNull()
      .references(() => matches.id),
    actorSlotId: uuid("actor_slot_id").notNull(),
    action: scoreEventActionEnum("action").notNull(),
    team: scoreEventTeamEnum("team"),
    payload: jsonb("payload").$type<Record<string, unknown>>(),
    refEventId: uuid("ref_event_id"),
  },
  (table) => [
    index("score_events_match_id_idx").on(table.matchId),
    index("score_events_created_at_idx").on(table.createdAt),
  ],
);
