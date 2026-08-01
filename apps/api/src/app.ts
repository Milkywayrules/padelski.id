import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { createServerAuth } from "@padelski/auth/server";
import { serverEnv } from "@padelski/env/server";
import { Elysia } from "elysia";
import { z } from "zod";
import {
  configRoutes,
  matchRoutes,
  playSessionRoutes,
  playerRoutes,
  slotClaimRoutes,
} from "./routes";
import { initTelemetry } from "./telemetry";
import { handleWsMessage, unsubscribeFromPlaySession } from "./ws/live-score";

const healthSchema = z.object({
  status: z.literal("ok"),
  version: z.literal("v1"),
});

export function createApp() {
  const tracer = initTelemetry();
  const auth = createServerAuth();

  const app = new Elysia({ prefix: "/v1" })
    .use(
      cors({
        credentials: true,
        origin: serverEnv.API_CORS_ORIGIN,
      }),
    )
    .use(
      openapi({
        documentation: {
          info: { title: "Padelski API", version: "1.0.0" },
        },
        path: "/docs",
        specPath: "/docs/json",
        provider: "scalar",
      }),
    )
    .get("/health", () => {
      const span = tracer.startSpan("health.check");
      span.end();
      return healthSchema.parse({ status: "ok", version: "v1" });
    })
    .get("/", () => ({ message: "Padelski API v1" }))
    .use(configRoutes)
    .use(playSessionRoutes)
    .use(matchRoutes)
    .use(slotClaimRoutes)
    .use(playerRoutes)
    .all("/auth/*", ({ request }) => auth.handler(request))
    .ws("/ws/live-score", {
      open(ws) {
        ws.subscribe("live-score");
      },
      message(ws, message) {
        const client = {
          send: (data: string) => ws.send(data),
        };
        handleWsMessage(message, client);
      },
      close(ws) {
        const subscribed = (ws.data as { playSessionId?: string }).playSessionId;
        if (subscribed) {
          unsubscribeFromPlaySession(subscribed, { send: (data) => ws.send(data) });
        }
      },
    });

  return app;
}

export type App = ReturnType<typeof createApp>;
