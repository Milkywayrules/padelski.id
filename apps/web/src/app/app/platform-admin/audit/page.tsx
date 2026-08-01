"use client";

import { Stack, Text, Title } from "@padelski/ui";

export default function PlatformAdminAuditPage() {
  return (
    <Stack gap="md">
      <Title order={3}>Audit trail</Title>
      <Text c="dimmed">Platform admin audit entries will appear here.</Text>
    </Stack>
  );
}
