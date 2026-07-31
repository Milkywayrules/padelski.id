"use client";

import { playSessionStatusSchema } from "@padelski/domain";
import { Container, Stack, Text, Title } from "@padelski/ui";

export default function HomePage() {
  const statuses = playSessionStatusSchema.options;

  return (
    <Container size="md" py="xl">
      <Stack gap="md">
        <Title order={1}>Padelski</Title>
        <Text c="dimmed">Phase 0.5 scaffold — client-first Next.js + Mantine</Text>
        <Text size="sm">PlaySession states: {statuses.join(", ")}</Text>
      </Stack>
    </Container>
  );
}
