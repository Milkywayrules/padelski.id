"use client";

import { Button, Stack, Text, Title } from "@padelski/ui";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { api } from "../../../../lib/api";

export default function PlayerProfilePage() {
  const params = useParams<{ playerId: string }>();
  const playerId = params.playerId;
  const [cursor, setCursor] = useState<string | undefined>();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["player-history", playerId, cursor],
    queryFn: () => api.getPlayerHistory(playerId, cursor),
  });

  return (
    <Stack gap="md">
      <Title order={3}>Player Profile</Title>
      {isLoading && <Text>Loading…</Text>}
      {data && (
        <>
          <Text fw={600}>{data.nickname}</Text>
          <Text size="sm" c="dimmed">
            {data.items.length} matches loaded
          </Text>
          {data.items.map((item) => (
            <Stack
              key={item.matchId}
              gap={4}
              p="sm"
              style={{ border: "1px solid #eee", borderRadius: 8 }}
            >
              <Link href={`/app/play-sessions/${item.playSessionId}`}>
                <Text fw={600}>{item.courtBlockRef}</Text>
              </Link>
              <Text size="sm">
                Team {item.team}: {item.result.teamA} — {item.result.teamB} ({item.status})
              </Text>
              <Text size="xs" c="dimmed">
                {item.finishedAt
                  ? new Date(item.finishedAt).toLocaleString()
                  : new Date(item.scheduledAt).toLocaleString()}
              </Text>
            </Stack>
          ))}
          {data.nextCursor && (
            <Button
              variant="light"
              onClick={() => {
                setCursor(data.nextCursor ?? undefined);
                refetch();
              }}
            >
              Load more
            </Button>
          )}
        </>
      )}
    </Stack>
  );
}
