// NEXT_PUBLIC_API_URL is a bare origin with no path; every consumer appends the API's
// `/v1` prefix itself, matching getWsUrl below and createPadelskiAuthClient.
const API_ORIGIN = (process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3001").replace(
  /\/+$/,
  "",
);
const API_BASE = `${API_ORIGIN}/v1`;

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export type PlaySession = {
  id: string;
  organizerPlayerId: string;
  courtBlockRef: string;
  scheduledAt: string;
  status: string;
  visibility: string;
  slots: { id: string; nickname: string; playerId: string | null }[];
};

export type Match = {
  id: string;
  playSessionId: string;
  status: string;
  result: { teamA: number; teamB: number };
  finishedAt: string | null;
  teamA: string[];
  teamB: string[];
};

export const api = {
  getConfig: () =>
    apiFetch<{
      appEnv: string;
      apiVersion: string;
      wsProtocolVersion: string;
      features: { githubOAuth: boolean; emailPassword: boolean };
    }>("/config"),

  listPlaySessions: () => apiFetch<PlaySession[]>("/play-sessions"),

  getPlaySession: (id: string) => apiFetch<PlaySession>(`/play-sessions/${id}`),

  createPlaySession: (body: {
    organizerPlayerId: string;
    courtBlockRef: string;
    scheduledAt: string;
    slots?: { nickname: string }[];
  }) => apiFetch<PlaySession>("/play-sessions", { method: "POST", body: JSON.stringify(body) }),

  activatePlaySession: (id: string) =>
    apiFetch<PlaySession>(`/play-sessions/${id}/activate`, { method: "POST" }),

  listMatches: (playSessionId: string) =>
    apiFetch<Match[]>(`/play-sessions/${playSessionId}/matches`),

  createMatch: (body: { playSessionId: string; teamA: string[]; teamB: string[] }) =>
    apiFetch<Match>("/matches", { method: "POST", body: JSON.stringify(body) }),

  startMatch: (id: string) => apiFetch<Match>(`/matches/${id}/start`, { method: "POST" }),

  appendScoreEvent: (
    matchId: string,
    body: {
      actorSlotId: string;
      action: "increment" | "decrement";
      team: "A" | "B";
    },
  ) =>
    apiFetch<{ result: { teamA: number; teamB: number } }>(`/matches/${matchId}/score-events`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  createPlayer: (body: { nickname: string; fullName?: string }) =>
    apiFetch<{ id: string; nickname: string }>("/players", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getPlayerHistory: (playerId: string, cursor?: string) => {
    const params = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
    return apiFetch<{
      playerId: string;
      nickname: string;
      items: Array<{
        matchId: string;
        playSessionId: string;
        courtBlockRef: string;
        scheduledAt: string;
        finishedAt: string | null;
        status: string;
        result: { teamA: number; teamB: number };
        team: "A" | "B";
      }>;
      nextCursor: string | null;
    }>(`/players/${playerId}/history${params}`);
  },

  createSlotClaim: (body: { slotId: string; playerId: string }) =>
    apiFetch<{ id: string; status: string }>("/slot-claims", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  approveSlotClaim: (id: string) =>
    apiFetch<{ id: string; status: string }>(`/slot-claims/${id}/approve`, { method: "POST" }),
};

export function getWsUrl(): string {
  const base = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3001";
  return `${base.replace(/^http/, "ws")}/v1/ws/live-score`;
}
