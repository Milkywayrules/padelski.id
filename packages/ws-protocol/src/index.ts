import { z } from "zod";

export const WS_PROTOCOL_VERSION = "v1" as const;

export const wsEnvelopeSchema = z.object({
  v: z.literal(WS_PROTOCOL_VERSION),
  type: z.string(),
  payload: z.unknown(),
});

export type WsEnvelope = z.infer<typeof wsEnvelopeSchema>;

export const pingMessageSchema = wsEnvelopeSchema.extend({
  type: z.literal("ping"),
  payload: z.object({ ts: z.number() }),
});

export const pongMessageSchema = wsEnvelopeSchema.extend({
  type: z.literal("pong"),
  payload: z.object({ ts: z.number() }),
});

export type PingMessage = z.infer<typeof pingMessageSchema>;
export type PongMessage = z.infer<typeof pongMessageSchema>;

export function createPing(ts = Date.now()): PingMessage {
  return { v: WS_PROTOCOL_VERSION, type: "ping", payload: { ts } };
}

export function createPong(ts: number): PongMessage {
  return { v: WS_PROTOCOL_VERSION, type: "pong", payload: { ts } };
}

export function parseWsMessage(raw: unknown): WsEnvelope {
  return wsEnvelopeSchema.parse(raw);
}

export const scoreUpdateMessageSchema = wsEnvelopeSchema.extend({
  type: z.literal("score.update"),
  payload: z.object({
    playSessionId: z.string().uuid(),
    matchId: z.string().uuid(),
    result: z.object({ teamA: z.number(), teamB: z.number() }),
    lastEventId: z.string().uuid(),
  }),
});

export type ScoreUpdateMessage = z.infer<typeof scoreUpdateMessageSchema>;

export function createScoreUpdate(payload: ScoreUpdateMessage["payload"]): ScoreUpdateMessage {
  return { v: WS_PROTOCOL_VERSION, type: "score.update", payload };
}

/** Client → server: join live score channel (participant or spectator) */
export const spectatorJoinMessageSchema = wsEnvelopeSchema.extend({
  type: z.literal("spectator.join"),
  payload: z.object({
    playSessionId: z.string().uuid(),
    slotId: z.string().uuid().optional(),
    readOnly: z.boolean().default(true),
  }),
});

export type SpectatorJoinMessage = z.infer<typeof spectatorJoinMessageSchema>;

/** Server → client: full match score snapshot on subscribe */
export const matchScoreSnapshotMessageSchema = wsEnvelopeSchema.extend({
  type: z.literal("match.score_snapshot"),
  payload: z.object({
    playSessionId: z.string().uuid(),
    matchId: z.string().uuid(),
    result: z.object({ teamA: z.number(), teamB: z.number() }),
    eventCount: z.number().int().nonnegative(),
  }),
});

export type MatchScoreSnapshotMessage = z.infer<typeof matchScoreSnapshotMessageSchema>;
