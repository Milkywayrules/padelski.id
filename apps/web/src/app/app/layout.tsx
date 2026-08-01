"use client";

import { Container, Stack, Title } from "@padelski/ui";
import type { ReactNode } from "react";
import { QueryProvider } from "../../lib/query-provider";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <Container size="md" py="xl">
        <Stack gap="lg">
          <Title order={2}>Padelski</Title>
          {children}
        </Stack>
      </Container>
    </QueryProvider>
  );
}
