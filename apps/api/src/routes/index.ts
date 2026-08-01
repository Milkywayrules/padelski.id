import { Elysia } from "elysia";
import { getDb } from "../db";
import {
  createMatchBodySchema,
  createPlaySessionBodySchema,
  matchResponseSchema,
  playSessionResponseSchema,
  scoreEventBodySchema,
  scoreEventResponseSchema,
  slotClaimBodySchema,
  slotClaimResponseSchema,
} from "../schemas";
import * as svc from "../services/play-session-service";

export const playSessionRoutes = new Elysia({ prefix: "/play-sessions" })
  .post("/", async ({ body, set }) => {
    try {
      const parsed = createPlaySessionBodySchema.parse(body);
      const session = await svc.createPlaySession(getDb(), parsed);
      set.status = 201;
      return playSessionResponseSchema.parse(session);
    } catch (error) {
      set.status = 400;
      return { error: error instanceof Error ? error.message : "Invalid request" };
    }
  })
  .get("/", async () => {
    const sessions = await svc.listPlaySessions(getDb());
    return sessions.map((s) => playSessionResponseSchema.parse(s));
  })
  .get("/:id", async ({ params, set }) => {
    const session = await svc.getPlaySession(getDb(), params.id);
    if (!session) {
      set.status = 404;
      return { error: "PlaySession not found" };
    }
    return playSessionResponseSchema.parse(session);
  })
  .post("/:id/activate", async ({ params, set }) => {
    try {
      const session = await svc.activatePlaySession(getDb(), params.id);
      return playSessionResponseSchema.parse(session);
    } catch (error) {
      set.status = 400;
      return { error: error instanceof Error ? error.message : "Failed" };
    }
  })
  .post("/:id/complete", async ({ params, query, set }) => {
    try {
      const result = await svc.completePlaySession(
        getDb(),
        params.id,
        query["confirmVoid"] === "true",
      );
      if ("preview" in result) {
        return result;
      }
      return playSessionResponseSchema.parse(result);
    } catch (error) {
      set.status = 400;
      return { error: error instanceof Error ? error.message : "Failed" };
    }
  })
  .post("/:id/archive", async ({ params, set }) => {
    try {
      const session = await svc.archivePlaySession(getDb(), params.id);
      return playSessionResponseSchema.parse(session);
    } catch (error) {
      set.status = 400;
      return { error: error instanceof Error ? error.message : "Failed" };
    }
  })
  .get("/:id/matches", async ({ params }) => {
    const matches = await svc.listMatchesForSession(getDb(), params.id);
    return matches.map((m) => matchResponseSchema.parse(m));
  });

export const matchRoutes = new Elysia({ prefix: "/matches" })
  .post("/", async ({ body, set }) => {
    try {
      const parsed = createMatchBodySchema.parse(body);
      const match = await svc.createMatch(
        getDb(),
        parsed.playSessionId,
        parsed.teamA,
        parsed.teamB,
      );
      set.status = 201;
      return matchResponseSchema.parse(match);
    } catch (error) {
      set.status = 400;
      return { error: error instanceof Error ? error.message : "Invalid request" };
    }
  })
  .get("/:id", async ({ params, set }) => {
    const match = await svc.getMatch(getDb(), params.id);
    if (!match) {
      set.status = 404;
      return { error: "Match not found" };
    }
    return matchResponseSchema.parse(match);
  })
  .post("/:id/start", async ({ params, set }) => {
    try {
      const match = await svc.transitionMatchStatus(getDb(), params.id, { type: "START" });
      return matchResponseSchema.parse(match);
    } catch (error) {
      set.status = 400;
      return { error: error instanceof Error ? error.message : "Failed" };
    }
  })
  .post("/:id/finish", async ({ params, set }) => {
    try {
      const match = await svc.transitionMatchStatus(getDb(), params.id, { type: "FINISH" });
      return matchResponseSchema.parse(match);
    } catch (error) {
      set.status = 400;
      return { error: error instanceof Error ? error.message : "Failed" };
    }
  })
  .post("/:id/score-events", async ({ params, body, set }) => {
    try {
      const parsed = scoreEventBodySchema.parse({ ...(body as object), matchId: params.id });
      const event = await svc.appendScoreEvent(getDb(), {
        matchId: parsed.matchId,
        actorSlotId: parsed.actorSlotId,
        action: parsed.action,
        ...(parsed.team !== undefined ? { team: parsed.team } : {}),
        ...(parsed.payload !== undefined ? { payload: parsed.payload } : {}),
        ...(parsed.refEventId !== undefined ? { refEventId: parsed.refEventId } : {}),
      });
      const { broadcastScoreUpdate } = await import("../ws/live-score");
      broadcastScoreUpdate(event.playSessionId, {
        playSessionId: event.playSessionId,
        matchId: event.matchId,
        result: event.result,
        lastEventId: event.id,
      });
      return scoreEventResponseSchema.parse(event);
    } catch (error) {
      set.status = 400;
      return { error: error instanceof Error ? error.message : "Failed" };
    }
  });

export const slotClaimRoutes = new Elysia({ prefix: "/slot-claims" })
  .post("/", async ({ body, set }) => {
    try {
      const parsed = slotClaimBodySchema.parse(body);
      const claim = await svc.createSlotClaim(getDb(), parsed.slotId, parsed.playerId);
      set.status = 201;
      return slotClaimResponseSchema.parse(claim);
    } catch (error) {
      set.status = 400;
      return { error: error instanceof Error ? error.message : "Invalid request" };
    }
  })
  .post("/:id/approve", async ({ params, set }) => {
    try {
      const claim = await svc.approveSlotClaim(getDb(), params.id);
      return slotClaimResponseSchema.parse(claim);
    } catch (error) {
      set.status = 400;
      return { error: error instanceof Error ? error.message : "Failed" };
    }
  });

export const playerRoutes = new Elysia({ prefix: "/players" })
  .post("/", async ({ body, set }) => {
    try {
      const parsed = body as { nickname: string; fullName?: string };
      const player = await svc.ensurePlayer(getDb(), parsed);
      set.status = 201;
      return player;
    } catch (error) {
      set.status = 400;
      return { error: error instanceof Error ? error.message : "Invalid request" };
    }
  })
  .get("/:id/history", async ({ params, query, set }) => {
    try {
      const history = await svc.getPlayerHistory(
        getDb(),
        params.id,
        query["cursor"] as string | undefined,
        query["limit"] ? Number(query["limit"]) : 20,
      );
      return history;
    } catch (error) {
      set.status = 404;
      return { error: error instanceof Error ? error.message : "Not found" };
    }
  });

export const configRoutes = new Elysia({ prefix: "/config" }).get("/", () => ({
  appEnv: (process.env["APP_ENV"] as "dev" | "prod") ?? "dev",
  apiVersion: "v1" as const,
  wsProtocolVersion: "v1" as const,
  features: {
    githubOAuth: Boolean(process.env["OAUTH_GITHUB_CLIENT_ID"]),
    emailPassword: true,
  },
}));
