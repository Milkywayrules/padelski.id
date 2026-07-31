"use client";

import { Button, Stack, Text, TextInput, Title } from "@padelski/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { api } from "../../../lib/api";

export default function PlaySessionsPage() {
  const queryClient = useQueryClient();
  const [courtBlockRef, setCourtBlockRef] = useState("");
  const [organizerPlayerId, setOrganizerPlayerId] = useState("");

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["play-sessions"],
    queryFn: () => api.listPlaySessions(),
  });

  const createPlayer = useMutation({
    mutationFn: () =>
      api.createPlayer({ nickname: `Organizer-${Date.now().toString(36)}`, fullName: "Organizer" }),
    onSuccess: (player: { id: string }) => setOrganizerPlayerId(player.id),
  });

  const createSession = useMutation({
    mutationFn: () =>
      api.createPlaySession({
        organizerPlayerId,
        courtBlockRef,
        scheduledAt: new Date().toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["play-sessions"] });
      setCourtBlockRef("");
    },
  });

  return (
    <Stack gap="md">
      <Title order={3}>PlaySessions</Title>

      <Stack gap="xs">
        <Text size="sm" c="dimmed">
          Create a new PlaySession
        </Text>
        {!organizerPlayerId && (
          <Button onClick={() => createPlayer.mutate()} loading={createPlayer.isPending}>
            Create Organizer Player
          </Button>
        )}
        {organizerPlayerId && <Text size="xs">Organizer: {organizerPlayerId.slice(0, 8)}…</Text>}
        <TextInput
          label="Court block reference"
          placeholder="Court 3 — Monday 18:00"
          value={courtBlockRef}
          onChange={(e) => setCourtBlockRef(e.currentTarget.value)}
        />
        <Button
          disabled={!organizerPlayerId || !courtBlockRef}
          loading={createSession.isPending}
          onClick={() => createSession.mutate()}
        >
          Create PlaySession
        </Button>
      </Stack>

      {isLoading && <Text>Loading…</Text>}
      {sessions?.map((session) => (
        <Stack
          key={session.id}
          gap={4}
          p="sm"
          style={{ border: "1px solid #eee", borderRadius: 8 }}
        >
          <Link href={`/app/play-sessions/${session.id}`}>
            <Text fw={600}>{session.courtBlockRef}</Text>
          </Link>
          <Text size="sm" c="dimmed">
            {session.status} · {new Date(session.scheduledAt).toLocaleString()}
          </Text>
          <Text size="xs">{session.slots.length} Slots</Text>
        </Stack>
      ))}
    </Stack>
  );
}
