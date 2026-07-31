import { schema } from "@padelski/db";
import type { Database } from "@padelski/db";
import {
  evaluateCompletePlaySession,
  transitionMatch,
  transitionPlaySession,
  transitionSlotClaim,
} from "@padelski/domain";
import { and, desc, eq, inArray, isNull, lt } from "drizzle-orm";
import type { CreatePlaySessionBody, PlaySessionResponse } from "../schemas";

const { playSessions, slots, matches, matchSlots, scoreEvents, slotClaims, players } = schema;

function randomGuestNickname(): string {
  return `Guest-${Math.random().toString(36).slice(2, 7)}`;
}

export async function createPlaySession(
  db: Database,
  body: CreatePlaySessionBody,
): Promise<PlaySessionResponse> {
  const slotNicknames =
    body.slots ?? Array.from({ length: 4 }, () => ({ nickname: randomGuestNickname() }));

  const [session] = await db
    .insert(playSessions)
    .values({
      organizerPlayerId: body.organizerPlayerId,
      courtBlockRef: body.courtBlockRef,
      scheduledAt: new Date(body.scheduledAt),
      status: "setup",
    })
    .returning();

  if (!session) {
    throw new Error("Failed to create PlaySession");
  }

  const insertedSlots = await db
    .insert(slots)
    .values(
      slotNicknames.map((s) => ({
        playSessionId: session.id,
        nickname: s.nickname,
      })),
    )
    .returning();

  return formatPlaySession(session, insertedSlots);
}

export async function listPlaySessions(db: Database): Promise<PlaySessionResponse[]> {
  const sessions = await db
    .select()
    .from(playSessions)
    .where(isNull(playSessions.deletedAt))
    .orderBy(desc(playSessions.scheduledAt));

  const result: PlaySessionResponse[] = [];
  for (const session of sessions) {
    const sessionSlots = await db
      .select()
      .from(slots)
      .where(and(eq(slots.playSessionId, session.id), isNull(slots.deletedAt)));
    result.push(formatPlaySession(session, sessionSlots));
  }
  return result;
}

export async function getPlaySession(
  db: Database,
  id: string,
): Promise<PlaySessionResponse | null> {
  const [session] = await db
    .select()
    .from(playSessions)
    .where(and(eq(playSessions.id, id), isNull(playSessions.deletedAt)));

  if (!session) {
    return null;
  }

  const sessionSlots = await db
    .select()
    .from(slots)
    .where(and(eq(slots.playSessionId, id), isNull(slots.deletedAt)));

  return formatPlaySession(session, sessionSlots);
}

export async function activatePlaySession(db: Database, id: string) {
  const session = await getPlaySession(db, id);
  if (!session) {
    throw new Error("PlaySession not found");
  }
  const nextStatus = transitionPlaySession(session.status, { type: "ACTIVATE" });
  const [updated] = await db
    .update(playSessions)
    .set({ status: nextStatus, updatedAt: new Date() })
    .where(eq(playSessions.id, id))
    .returning();
  if (!updated) {
    throw new Error("Failed to activate PlaySession");
  }
  return getPlaySession(db, id);
}

export async function completePlaySession(
  db: Database,
  id: string,
  confirmVoid = false,
): Promise<PlaySessionResponse | { preview: { scheduledToVoid: string[] } }> {
  const session = await getPlaySession(db, id);
  if (!session) {
    throw new Error("PlaySession not found");
  }

  const sessionMatches = await db
    .select({ id: matches.id, status: matches.status })
    .from(matches)
    .where(and(eq(matches.playSessionId, id), isNull(matches.deletedAt)));

  const evaluation = evaluateCompletePlaySession(sessionMatches);
  if (evaluation.blocked) {
    throw new Error(`Cannot complete: matches in progress (${evaluation.matchIds.join(", ")})`);
  }

  if (evaluation.scheduledToVoid.length > 0 && !confirmVoid) {
    return { preview: { scheduledToVoid: evaluation.scheduledToVoid } };
  }

  if (evaluation.scheduledToVoid.length > 0) {
    await db
      .update(matches)
      .set({ status: "voided", updatedAt: new Date() })
      .where(inArray(matches.id, evaluation.scheduledToVoid));
  }

  const nextStatus = transitionPlaySession(session.status, { type: "COMPLETE" });
  await db
    .update(playSessions)
    .set({ status: nextStatus, updatedAt: new Date() })
    .where(eq(playSessions.id, id));

  const completed = await getPlaySession(db, id);
  if (!completed) {
    throw new Error("PlaySession not found after complete");
  }
  return completed;
}

export async function archivePlaySession(db: Database, id: string) {
  const session = await getPlaySession(db, id);
  if (!session) {
    throw new Error("PlaySession not found");
  }
  const nextStatus = transitionPlaySession(session.status, { type: "ARCHIVE" });

  const sessionMatchIds = await db
    .select({ id: matches.id })
    .from(matches)
    .where(eq(matches.playSessionId, id));

  if (sessionMatchIds.length > 0) {
    await db.delete(scoreEvents).where(
      inArray(
        scoreEvents.matchId,
        sessionMatchIds.map((m) => m.id),
      ),
    );
  }

  await db
    .update(playSessions)
    .set({ status: nextStatus, updatedAt: new Date() })
    .where(eq(playSessions.id, id));

  return getPlaySession(db, id);
}

function formatPlaySession(
  session: typeof playSessions.$inferSelect,
  sessionSlots: (typeof slots.$inferSelect)[],
): PlaySessionResponse {
  return {
    id: session.id,
    organizerPlayerId: session.organizerPlayerId,
    courtBlockRef: session.courtBlockRef,
    scheduledAt: session.scheduledAt.toISOString(),
    status: session.status,
    visibility: session.visibility,
    slots: sessionSlots.map((s) => ({
      id: s.id,
      nickname: s.nickname,
      playerId: s.playerId,
    })),
  };
}

export async function createMatch(
  db: Database,
  playSessionId: string,
  teamA: string[],
  teamB: string[],
) {
  const [match] = await db
    .insert(matches)
    .values({ playSessionId, status: "scheduled" })
    .returning();

  if (!match) {
    throw new Error("Failed to create Match");
  }

  await db
    .insert(matchSlots)
    .values([
      ...teamA.map((slotId) => ({ matchId: match.id, slotId, team: "A" as const })),
      ...teamB.map((slotId) => ({ matchId: match.id, slotId, team: "B" as const })),
    ]);

  return getMatch(db, match.id);
}

export async function getMatch(db: Database, id: string) {
  const [match] = await db
    .select()
    .from(matches)
    .where(and(eq(matches.id, id), isNull(matches.deletedAt)));

  if (!match) {
    return null;
  }

  const participants = await db
    .select()
    .from(matchSlots)
    .where(and(eq(matchSlots.matchId, id), isNull(matchSlots.deletedAt)));

  return {
    id: match.id,
    playSessionId: match.playSessionId,
    status: match.status,
    result: match.result,
    finishedAt: match.finishedAt?.toISOString() ?? null,
    teamA: participants.filter((p) => p.team === "A").map((p) => p.slotId),
    teamB: participants.filter((p) => p.team === "B").map((p) => p.slotId),
  };
}

export async function transitionMatchStatus(
  db: Database,
  id: string,
  event: Parameters<typeof transitionMatch>[1],
) {
  const match = await getMatch(db, id);
  if (!match) {
    throw new Error("Match not found");
  }
  const nextStatus = transitionMatch(match.status, event);
  const finishedAt = nextStatus === "finished" ? new Date() : match.finishedAt;

  await db
    .update(matches)
    .set({
      status: nextStatus,
      finishedAt: finishedAt ? new Date(finishedAt) : null,
      updatedAt: new Date(),
    })
    .where(eq(matches.id, id));

  return getMatch(db, id);
}

export async function appendScoreEvent(
  db: Database,
  input: {
    matchId: string;
    actorSlotId: string;
    action: "increment" | "decrement" | "type" | "undo";
    team?: "A" | "B";
    payload?: Record<string, unknown>;
    refEventId?: string;
  },
) {
  const match = await getMatch(db, input.matchId);
  if (!match) {
    throw new Error("Match not found");
  }
  if (match.status !== "in_progress") {
    throw new Error("Match must be in_progress to score");
  }

  const session = await getPlaySession(db, match.playSessionId);
  if (!session || (session.status !== "active" && session.status !== "completed")) {
    throw new Error("PlaySession must be active or completed for scoring");
  }

  let result = { ...match.result };
  if (input.action === "increment" && input.team) {
    result = {
      ...result,
      [input.team === "A" ? "teamA" : "teamB"]: result[input.team === "A" ? "teamA" : "teamB"] + 1,
    };
  } else if (input.action === "decrement" && input.team) {
    const key = input.team === "A" ? "teamA" : "teamB";
    result = { ...result, [key]: Math.max(0, result[key] - 1) };
  } else if (input.action === "type" && input.payload) {
    const teamA = Number(input.payload["teamA"] ?? result.teamA);
    const teamB = Number(input.payload["teamB"] ?? result.teamB);
    result = { teamA, teamB };
  }

  const [event] = await db
    .insert(scoreEvents)
    .values({
      matchId: input.matchId,
      actorSlotId: input.actorSlotId,
      action: input.action,
      team: input.team ?? null,
      payload: input.payload ?? null,
      refEventId: input.refEventId ?? null,
    })
    .returning();

  if (!event) {
    throw new Error("Failed to append ScoreEvent");
  }

  await db
    .update(matches)
    .set({ result, updatedAt: new Date() })
    .where(eq(matches.id, input.matchId));

  return {
    id: event.id,
    matchId: input.matchId,
    actorSlotId: input.actorSlotId,
    action: input.action,
    team: input.team ?? null,
    result,
    playSessionId: match.playSessionId,
  };
}

export async function createSlotClaim(db: Database, slotId: string, playerId: string) {
  const [claim] = await db
    .insert(slotClaims)
    .values({ slotId, playerId, status: "requested" })
    .returning();

  if (!claim) {
    throw new Error("Failed to create SlotClaim");
  }

  const nextStatus = transitionSlotClaim("requested", { type: "SUBMIT_TO_ORGANIZER" });
  const [updated] = await db
    .update(slotClaims)
    .set({ status: nextStatus, updatedAt: new Date() })
    .where(eq(slotClaims.id, claim.id))
    .returning();

  if (!updated) {
    throw new Error("Failed to submit SlotClaim");
  }
  return updated;
}

export async function approveSlotClaim(db: Database, claimId: string) {
  const [claim] = await db.select().from(slotClaims).where(eq(slotClaims.id, claimId));
  if (!claim) {
    throw new Error("SlotClaim not found");
  }

  let status = claim.status;
  status = transitionSlotClaim(status, { type: "APPROVE" });
  status = transitionSlotClaim(status, { type: "APPLY" });

  const [updated] = await db
    .update(slotClaims)
    .set({ status, updatedAt: new Date() })
    .where(eq(slotClaims.id, claimId))
    .returning();

  await db
    .update(slots)
    .set({ playerId: claim.playerId, updatedAt: new Date() })
    .where(eq(slots.id, claim.slotId));

  if (!updated) {
    throw new Error("Failed to approve SlotClaim");
  }
  return updated;
}

export async function getPlayerHistory(
  db: Database,
  playerId: string,
  cursor?: string,
  limit = 20,
) {
  const [player] = await db.select().from(players).where(eq(players.id, playerId));
  if (!player) {
    throw new Error("Player not found");
  }

  const playerSlots = await db
    .select({ id: slots.id })
    .from(slots)
    .where(and(eq(slots.playerId, playerId), isNull(slots.deletedAt)));

  const slotIds = playerSlots.map((s) => s.id);
  if (slotIds.length === 0) {
    return { playerId, nickname: player.nickname, items: [], nextCursor: null };
  }

  const participation = await db
    .select({
      matchId: matchSlots.matchId,
      team: matchSlots.team,
      slotId: matchSlots.slotId,
    })
    .from(matchSlots)
    .where(inArray(matchSlots.slotId, slotIds));

  const matchIds = [...new Set(participation.map((p) => p.matchId))];
  if (matchIds.length === 0) {
    return { playerId, nickname: player.nickname, items: [], nextCursor: null };
  }

  let matchQuery = db
    .select()
    .from(matches)
    .where(and(inArray(matches.id, matchIds), isNull(matches.deletedAt)))
    .orderBy(desc(matches.finishedAt))
    .limit(limit + 1);

  if (cursor) {
    matchQuery = db
      .select()
      .from(matches)
      .where(
        and(
          inArray(matches.id, matchIds),
          isNull(matches.deletedAt),
          lt(matches.finishedAt, new Date(cursor)),
        ),
      )
      .orderBy(desc(matches.finishedAt))
      .limit(limit + 1);
  }

  const matchRows = await matchQuery;
  const hasMore = matchRows.length > limit;
  const page = hasMore ? matchRows.slice(0, limit) : matchRows;

  const items = await Promise.all(
    page.map(async (match) => {
      const [session] = await db
        .select()
        .from(playSessions)
        .where(eq(playSessions.id, match.playSessionId));
      const part = participation.find((p) => p.matchId === match.id);
      if (!part) {
        throw new Error(`Missing participation for match ${match.id}`);
      }
      return {
        matchId: match.id,
        playSessionId: match.playSessionId,
        courtBlockRef: session?.courtBlockRef ?? "",
        scheduledAt: session?.scheduledAt.toISOString() ?? "",
        finishedAt: match.finishedAt?.toISOString() ?? null,
        status: match.status,
        result: match.result,
        team: part.team,
      };
    }),
  );

  const last = page.at(-1);
  const nextCursor = hasMore && last?.finishedAt ? last.finishedAt.toISOString() : null;

  return { playerId, nickname: player.nickname, items, nextCursor };
}

export async function ensurePlayer(
  db: Database,
  input: { nickname: string; fullName?: string; userId?: string },
) {
  const [player] = await db
    .insert(players)
    .values({
      nickname: input.nickname,
      fullName: input.fullName ?? null,
      userId: input.userId ?? null,
    })
    .onConflictDoNothing()
    .returning();

  if (player) {
    return player;
  }

  const [existing] = await db.select().from(players).where(eq(players.nickname, input.nickname));
  if (!existing) {
    throw new Error("Failed to create or find Player");
  }
  return existing;
}

export async function listMatchesForSession(db: Database, playSessionId: string) {
  const rows = await db
    .select()
    .from(matches)
    .where(and(eq(matches.playSessionId, playSessionId), isNull(matches.deletedAt)));

  return Promise.all(rows.map((m) => getMatch(db, m.id))).then((r) =>
    r.filter((m): m is NonNullable<typeof m> => m !== null),
  );
}
