import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const skipValidation =
  process.env["ENV_SKIP_VALIDATION"] === "true" || process.env["CI"] === "true";

export const clientEnv = createEnv({
  client: {
    NEXT_PUBLIC_API_URL: z.string().url(),
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },
  emptyStringAsUndefined: true,
  runtimeEnv: {
    NEXT_PUBLIC_API_URL: process.env["NEXT_PUBLIC_API_URL"],
    NEXT_PUBLIC_APP_URL: process.env["NEXT_PUBLIC_APP_URL"],
  },
  skipValidation,
});

export type ClientEnv = typeof clientEnv;
