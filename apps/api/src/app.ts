import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { createAuth } from "@padelski/auth";
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

function createAuthInstance() {
  const skipValidation =
    process.env["ENV_SKIP_VALIDATION"] === "true" || process.env["CI"] === "true";

  const secret = process.env["BETTER_AUTH_SECRET"] ?? "change-me-in-production-min-32-chars!!";
  const apiPublicUrl =
    process.env["BETTER_AUTH_URL"] ?? process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3001";
  const corsOrigin =
    process.env["API_CORS_ORIGIN"] ?? process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000";

  const githubClientId = skipValidation
    ? process.env["OAUTH_GITHUB_CLIENT_ID"]
    : serverEnv.OAUTH_GITHUB_CLIENT_ID;
  const githubClientSecret = skipValidation
    ? process.env["OAUTH_GITHUB_CLIENT_SECRET"]
    : serverEnv.OAUTH_GITHUB_CLIENT_SECRET;

  return createAuth({
    secret: skipValidation ? secret : serverEnv.BETTER_AUTH_SECRET,
    baseURL: `${skipValidation ? apiPublicUrl : serverEnv.BETTER_AUTH_URL}/v1/auth`,
    trustedOrigins: [skipValidation ? corsOrigin : serverEnv.API_CORS_ORIGIN],
    githubClientId,
    githubClientSecret,
    enableEmailPassword: true,
  });
}

export function createApp() {
  const skipValidation =
    process.env["ENV_SKIP_VALIDATION"] === "true" || process.env["CI"] === "true";
  const corsOrigin =
    process.env["API_CORS_ORIGIN"] ?? process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000";

  const tracer = initTelemetry();
  const auth = createAuthInstance();

  const app = new Elysia({ prefix: "/v1" })
    .use(
      cors({
        credentials: true,
        origin: skipValidation ? corsOrigin : serverEnv.API_CORS_ORIGIN,
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
