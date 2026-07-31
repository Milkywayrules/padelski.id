"use client";

import { Button, Group, Select, Stack, Text, Title } from "@padelski/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { type Match, api, getWsUrl } from "../../../../lib/api";
import { useScoreActions } from "../../../../stores/score-actions";

export default function PlaySessionDetailPage() {
  const params = useParams<{ id: string }>();
  const playSessionId = params.id;
  const queryClient = useQueryClient();
  const { actorSlotId, spectatorMode, setActorSlotId, setSpectatorMode } = useScoreActions();
  const [liveMatch, setLiveMatch] = useState<Match | null>(null);

  const { data: session } = useQuery({
    queryKey: ["play-session", playSessionId],
    queryFn: () => api.getPlaySession(playSessionId),
  });

  const { data: matches } = useQuery({
    queryKey: ["matches", playSessionId],
    queryFn: () => api.listMatches(playSessionId),
  });

  const activate = useMutation({
    mutationFn: () => api.activatePlaySession(playSessionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["play-session", playSessionId] }),
  });

  const createMatch = useMutation({
    mutationFn: () => {
      if (!session || session.slots.length < 4) {
        throw new Error("Need at least 4 slots");
      }
      const [s0, s1, s2, s3] = session.slots;
      if (!s0 || !s1 || !s2 || !s3) {
        throw new Error("Need at least 4 slots");
      }
      return api.createMatch({
        playSessionId,
        teamA: [s0.id, s1.id],
        teamB: [s2.id, s3.id],
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["matches", playSessionId] }),
  });

  const startMatch = useMutation({
    mutationFn: (matchId: string) => api.startMatch(matchId),
    onSuccess: (match) => {
      setLiveMatch(match);
      queryClient.invalidateQueries({ queryKey: ["matches", playSessionId] });
    },
  });

  const score = useMutation({
    mutationFn: ({ matchId, team }: { matchId: string; team: "A" | "B" }) => {
      if (!actorSlotId) {
        throw new Error("Select a slot to score");
      }
      return api.appendScoreEvent(matchId, {
        actorSlotId,
        action: "increment",
        team,
      });
    },
    onSuccess: (data: { result: { teamA: number; teamB: number } }) => {
      if (liveMatch) {
        setLiveMatch({ ...liveMatch, result: data.result });
      }
    },
  });

  useEffect(() => {
    const ws = new WebSocket(getWsUrl());
    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          v: "v1",
          type: "subscribe",
          payload: { playSessionId },
        }),
      );
    };
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string) as {
          type: string;
          payload?: { matchId: string; result: { teamA: number; teamB: number } };
        };
        if (msg.type === "score.update" && msg.payload) {
          const { matchId, result } = msg.payload;
          setLiveMatch((prev) => (prev && prev.id === matchId ? { ...prev, result } : prev));
        }
      } catch {
        /* ignore */
      }
    };
    return () => ws.close();
  }, [playSessionId]);

  useEffect(() => {
    const inProgress = matches?.find((m) => m.status === "in_progress");
    if (inProgress) {
      setLiveMatch(inProgress);
    }
  }, [matches]);

  const canScore = !spectatorMode && actorSlotId && liveMatch?.status === "in_progress";

  return (
    <Stack gap="md">
      <Title order={3}>{session?.courtBlockRef ?? "PlaySession"}</Title>
      <Text size="sm" c="dimmed">
        Status: {session?.status}
      </Text>

      {session?.status === "setup" && (
        <Button onClick={() => activate.mutate()} loading={activate.isPending}>
          Activate PlaySession
        </Button>
      )}

      <Stack gap="xs">
        <Text fw={600}>Roster</Text>
        {session?.slots.map((slot) => (
          <Text key={slot.id} size="sm">
            {slot.nickname}
            {slot.playerId ? " (Player)" : " (Guest)"}
          </Text>
        ))}
      </Stack>

      <Select
        label="Your Slot (score controls)"
        placeholder="Spectator — read only"
        data={session?.slots.map((s) => ({ value: s.id, label: s.nickname })) ?? []}
        value={actorSlotId}
        onChange={(value) => {
          setActorSlotId(value);
          setSpectatorMode(value === null);
        }}
        clearable
      />

      {spectatorMode && (
        <Text size="sm" c="dimmed">
          Spectator mode — live score is read-only
        </Text>
      )}

      <Group>
        <Button onClick={() => createMatch.mutate()} loading={createMatch.isPending}>
          Schedule Match
        </Button>
      </Group>

      {matches?.map((match) => (
        <Stack key={match.id} gap={4} p="sm" style={{ border: "1px solid #eee", borderRadius: 8 }}>
          <Text fw={600}>
            Match {match.id.slice(0, 8)} — {match.status}
          </Text>
          <Text>
            {match.result.teamA} : {match.result.teamB}
          </Text>
          {match.status === "scheduled" && (
            <Button size="xs" onClick={() => startMatch.mutate(match.id)}>
              Start Match
            </Button>
          )}
        </Stack>
      ))}

      {liveMatch && (
        <Stack gap="sm" p="md" style={{ background: "#f8f9fa", borderRadius: 8 }}>
          <Title order={4}>Live Score</Title>
          <Text size="xl" ta="center" fw={700}>
            {liveMatch.result.teamA} — {liveMatch.result.teamB}
          </Text>
          {canScore && (
            <Group justify="center">
              <Button onClick={() => score.mutate({ matchId: liveMatch.id, team: "A" })}>
                Team A +1
              </Button>
              <Button onClick={() => score.mutate({ matchId: liveMatch.id, team: "B" })}>
                Team B +1
              </Button>
            </Group>
          )}
        </Stack>
      )}
    </Stack>
  );
}
