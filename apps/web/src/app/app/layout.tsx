"use client";

import { Button, Container, Group, Stack, Text, Title } from "@padelski/ui";
import Link from "next/link";
import type { ReactNode } from "react";
import { authClient } from "../../lib/auth-client";
import { QueryProvider } from "../../lib/query-provider";

function AppShell({ children }: { children: ReactNode }) {
  const { data: session, isPending } = authClient.useSession();

  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Title order={2}>Padelski</Title>
          {!isPending && !session && (
            <Button component={Link} href="/sign-in" variant="light" size="sm">
              Sign in
            </Button>
          )}
          {!isPending && session && (
            <Text size="sm" c="dimmed">
              {session.user.email}
            </Text>
          )}
        </Group>
        {children}
      </Stack>
    </Container>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AppShell>{children}</AppShell>
    </QueryProvider>
  );
}
