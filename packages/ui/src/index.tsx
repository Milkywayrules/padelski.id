import { MantineProvider } from "@mantine/core";
import type { ReactNode } from "react";
import { padelskiTheme } from "./theme";

export { padelskiTheme } from "./theme";

export function PadelskiProvider({ children }: { children: ReactNode }) {
  return <MantineProvider theme={padelskiTheme}>{children}</MantineProvider>;
}

export { Button, Container, Group, Select, Stack, Text, TextInput, Title } from "@mantine/core";
