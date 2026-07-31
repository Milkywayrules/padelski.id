import {
  matchStatusSchema,
  playSessionStatusSchema,
  slotClaimStatusSchema,
} from "@padelski/domain";
import { z } from "zod";

export const createPlaySessionBodySchema = z.object({
  organizerPlayerId: z.string().uuid(),
  courtBlockRef: z.string().min(1),
  scheduledAt: z.string().datetime(),
  slots: z
    .array(z.object({ nickname: z.string().min(1) }))
    .min(2)
    .max(8)
    .optional(),
});

export const playSessionResponseSchema = z.object({
  id: z.string().uuid(),
  organizerPlayerId: z.string().uuid(),
  courtBlockRef: z.string(),
  scheduledAt: z.string(),
  status: playSessionStatusSchema,
  visibility: z.enum(["public", "private"]),
  slots: z.array(
    z.object({
      id: z.string().uuid(),
      nickname: z.string(),
      playerId: z.string().uuid().nullable(),
    }),
  ),
});

export const createMatchBodySchema = z.object({
  playSessionId: z.string().uuid(),
  teamA: z.array(z.string().uuid()).min(1).max(2),
  teamB: z.array(z.string().uuid()).min(1).max(2),
});

export const matchResponseSchema = z.object({
  id: z.string().uuid(),
  playSessionId: z.string().uuid(),
  status: matchStatusSchema,
  result: z.object({ teamA: z.number(), teamB: z.number() }),
  finishedAt: z.string().nullable(),
  teamA: z.array(z.string().uuid()),
  teamB: z.array(z.string().uuid()),
});

export const scoreEventBodySchema = z.object({
  matchId: z.string().uuid(),
  actorSlotId: z.string().uuid(),
  action: z.enum(["increment", "decrement", "type", "undo"]),
  team: z.enum(["A", "B"]).optional(),
  payload: z.record(z.unknown()).optional(),
  refEventId: z.string().uuid().optional(),
});

export const scoreEventResponseSchema = z.object({
  id: z.string().uuid(),
  matchId: z.string().uuid(),
  actorSlotId: z.string().uuid(),
  action: z.enum(["increment", "decrement", "type", "undo"]),
  team: z.enum(["A", "B"]).nullable(),
  result: z.object({ teamA: z.number(), teamB: z.number() }),
});

export const slotClaimBodySchema = z.object({
  slotId: z.string().uuid(),
  playerId: z.string().uuid(),
});

export const slotClaimResponseSchema = z.object({
  id: z.string().uuid(),
  slotId: z.string().uuid(),
  playerId: z.string().uuid(),
  status: slotClaimStatusSchema,
});

export const playerHistoryItemSchema = z.object({
  matchId: z.string().uuid(),
  playSessionId: z.string().uuid(),
  courtBlockRef: z.string(),
  scheduledAt: z.string(),
  finishedAt: z.string().nullable(),
  status: matchStatusSchema,
  result: z.object({ teamA: z.number(), teamB: z.number() }),
  team: z.enum(["A", "B"]),
});

export const playerHistoryResponseSchema = z.object({
  playerId: z.string().uuid(),
  nickname: z.string(),
  items: z.array(playerHistoryItemSchema),
  nextCursor: z.string().nullable(),
});

export const configResponseSchema = z.object({
  appEnv: z.enum(["dev", "prod"]),
  apiVersion: z.literal("v1"),
  wsProtocolVersion: z.literal("v1"),
  features: z.object({
    githubOAuth: z.boolean(),
    emailPassword: z.boolean(),
  }),
});

export type CreatePlaySessionBody = z.infer<typeof createPlaySessionBodySchema>;
export type PlaySessionResponse = z.infer<typeof playSessionResponseSchema>;
