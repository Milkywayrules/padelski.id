import {
  createPing,
  createPong,
  createScoreUpdate,
  parseWsMessage,
  pingMessageSchema,
} from "@padelski/ws-protocol";

type WsClient = { send: (data: string) => void };

const playSessionChannels = new Map<string, Set<WsClient>>();

export function subscribeToPlaySession(playSessionId: string, client: WsClient): void {
  const channel = playSessionChannels.get(playSessionId) ?? new Set();
  channel.add(client);
  playSessionChannels.set(playSessionId, channel);
}

export function unsubscribeFromPlaySession(playSessionId: string, client: WsClient): void {
  const channel = playSessionChannels.get(playSessionId);
  if (!channel) {
    return;
  }
  channel.delete(client);
  if (channel.size === 0) {
    playSessionChannels.delete(playSessionId);
  }
}

export function broadcastScoreUpdate(
  playSessionId: string,
  payload: Parameters<typeof createScoreUpdate>[0],
): void {
  const channel = playSessionChannels.get(playSessionId);
  if (!channel) {
    return;
  }
  const message = JSON.stringify(createScoreUpdate(payload));
  for (const client of channel) {
    client.send(message);
  }
}

export function handleWsMessage(raw: unknown, client: WsClient): void {
  try {
    const envelope = parseWsMessage(raw);

    if (envelope.type === "ping") {
      const ping = pingMessageSchema.parse(envelope);
      client.send(JSON.stringify(createPong(ping.payload.ts)));
      return;
    }

    if (envelope.type === "subscribe") {
      const payload = envelope.payload as { playSessionId?: string };
      if (payload.playSessionId) {
        subscribeToPlaySession(payload.playSessionId, client);
        client.send(JSON.stringify(createPing()));
      }
    }
  } catch {
    client.send(
      JSON.stringify({ v: "v1", type: "error", payload: { message: "Invalid message" } }),
    );
  }
}
