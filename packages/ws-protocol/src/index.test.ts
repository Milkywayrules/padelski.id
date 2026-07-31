import { describe, expect, it } from "vitest";
import { WS_PROTOCOL_VERSION, createPing, createPong, parseWsMessage } from "./index";

describe("ws-protocol v1", () => {
  it("creates ping/pong messages", () => {
    const ping = createPing(123);
    expect(ping.v).toBe(WS_PROTOCOL_VERSION);
    expect(createPong(123).payload.ts).toBe(123);
  });

  it("parses envelopes", () => {
    const msg = parseWsMessage({ v: "v1", type: "ping", payload: { ts: 1 } });
    expect(msg.type).toBe("ping");
  });
});
