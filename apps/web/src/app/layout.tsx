"use client";

import "@mantine/core/styles.css";
import { ColorSchemeScript } from "@mantine/core";
import { PadelskiProvider } from "@padelski/ui";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body>
        <PadelskiProvider>{children}</PadelskiProvider>
      </body>
    </html>
  );
}
