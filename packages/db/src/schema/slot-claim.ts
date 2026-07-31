import { index, pgEnum, pgTable, uuid } from "drizzle-orm/pg-core";
import { auditFields } from "./audit";
import { players } from "./player";
import { slots } from "./slot";

export const slotClaimStatusEnum = pgEnum("slot_claim_status", [
  "requested",
  "awaiting_organizer",
  "approved",
  "applied",
  "rejected",
  "expired",
  "detached",
]);

export const slotClaims = pgTable(
  "slot_claims",
  {
    ...auditFields,
    slotId: uuid("slot_id")
      .notNull()
      .references(() => slots.id),
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id),
    status: slotClaimStatusEnum("status").notNull().default("requested"),
  },
  (table) => [
    index("slot_claims_slot_id_idx").on(table.slotId),
    index("slot_claims_player_id_idx").on(table.playerId),
    index("slot_claims_status_idx").on(table.status),
  ],
);
