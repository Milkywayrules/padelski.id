import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("api URL construction", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
    process.env["NEXT_PUBLIC_API_URL"] = undefined;
  });

  describe("bare origin", () => {
    beforeEach(() => {
      process.env["NEXT_PUBLIC_API_URL"] = "https://api.example.com";
    });

    it("api.getConfig() requests /v1/config", async () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
      vi.stubGlobal("fetch", fetchMock);

      const { api } = await import("./api");
      await api.getConfig();

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/v1/config",
        expect.any(Object),
      );
    });
  });

  describe("trailing slash", () => {
    beforeEach(() => {
      process.env["NEXT_PUBLIC_API_URL"] = "https://api.example.com/";
    });

    it("api.getConfig() strips trailing slash before appending /v1", async () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
      vi.stubGlobal("fetch", fetchMock);

      const { api } = await import("./api");
      await api.getConfig();

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/v1/config",
        expect.any(Object),
      );
    });
  });

  describe("websocket URL", () => {
    beforeEach(() => {
      process.env["NEXT_PUBLIC_API_URL"] = "https://api.example.com";
    });

    it("getWsUrl() returns wss:// origin with /v1/ws/live-score", async () => {
      const { getWsUrl } = await import("./api");
      expect(getWsUrl()).toBe("wss://api.example.com/v1/ws/live-score");
    });
  });
});
