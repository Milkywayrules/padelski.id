import { z } from "zod";
import { WS_PROTOCOL_VERSION } from "./version";

export const REDIS_CHANNEL_PREFIX = `padelski:${WS_PROTOCOL_VERSION}` as const;

const playSessionIdSchema = z.string().uuid();

export function redisSessionChannel(playSessionId: string): string {
  const id = playSessionIdSchema.parse(playSessionId);
  return `${REDIS_CHANNEL_PREFIX}:session:${id}`;
}
