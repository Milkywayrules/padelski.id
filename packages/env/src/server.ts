import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { defaultR2PrefixForAppEnv } from "./features";

const skipValidation =
  process.env["ENV_SKIP_VALIDATION"] === "true" || process.env["CI"] === "true";

const appEnvSchema = z.enum(["dev", "prod"]);

export const serverEnv = createEnv({
  emptyStringAsUndefined: true,
  runtimeEnv: process.env,
  server: {
    API_CORS_ORIGIN: z.string().url(),
    APP_ENV: appEnvSchema.default("dev"),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string().url(),
    DB_URL: z.string().url(),
    EMAIL_FROM: z.string().min(3).optional(),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    OAUTH_GITHUB_CLIENT_ID: z.string().min(1).optional(),
    OAUTH_GITHUB_CLIENT_SECRET: z.string().min(1).optional(),
    OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional(),
    R2_ACCESS_KEY_ID: z.string().min(1).optional(),
    R2_ACCOUNT_ID: z.string().min(1).optional(),
    R2_BUCKET_NAME: z.string().min(1).optional(),
    R2_PREFIX: z.string().min(1).optional(),
    R2_SECRET_ACCESS_KEY: z.string().min(1).optional(),
    REDIS_URL: z.string().url(),
    RESEND_API_KEY: z.string().min(1).optional(),
  },
  skipValidation,
});

if (
  !skipValidation &&
  serverEnv.R2_PREFIX &&
  serverEnv.R2_PREFIX !== defaultR2PrefixForAppEnv(serverEnv.APP_ENV)
) {
  throw new Error(
    `R2_PREFIX must be ${defaultR2PrefixForAppEnv(serverEnv.APP_ENV)} when APP_ENV is ${serverEnv.APP_ENV}`,
  );
}

export type ServerEnv = typeof serverEnv;
