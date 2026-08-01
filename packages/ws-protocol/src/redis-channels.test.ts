import { describe, expect, it } from "vitest";
import { REDIS_CHANNEL_PREFIX, redisSessionChannel } from "./redis-channels";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";

describe("redis channels", () => {
  it("defines versioned channel prefix", () => {
    expect(REDIS_CHANNEL_PREFIX).toBe("padelski:v1");
  });

  it("builds session channel for valid uuid", () => {
    expect(redisSessionChannel(VALID_UUID)).toBe(`padelski:v1:session:${VALID_UUID}`);
  });

  it("throws for invalid playSessionId", () => {
    expect(() => redisSessionChannel("not-a-uuid")).toThrow();
    expect(() => redisSessionChannel("")).toThrow();
  });
});
