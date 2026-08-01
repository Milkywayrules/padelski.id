"use client";

import { Container, Stack } from "@padelski/ui";
import type { ReactNode } from "react";

export default function PlatformAdminLayout({ children }: { children: ReactNode }) {
  return (
    <Container size="lg" py="md">
      <Stack gap="lg">{children}</Stack>
    </Container>
  );
}
