import type { Database } from "@padelski/db";
import { authSchema } from "@padelski/db/schema";
import { createEmailClient } from "@padelski/email";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { z } from "zod";
import { linkPlayerForAuthUser } from "./link-player";

export const authConfigSchema = z.object({
  secret: z.string().min(32),
  baseURL: z.string().url(),
  trustedOrigins: z.array(z.string().url()).min(1),
  githubClientId: z.string().optional(),
  githubClientSecret: z.string().optional(),
  enableEmailPassword: z.boolean().default(true),
  resendApiKey: z.string().min(1).optional(),
  emailFrom: z.string().min(3).optional(),
});

export type AuthConfig = z.infer<typeof authConfigSchema>;

export function createAuth(config: AuthConfig, db: Database) {
  const parsed = authConfigSchema.parse(config);
  const emailConfigured = Boolean(parsed.resendApiKey && parsed.emailFrom);
  const emailClient = emailConfigured
    ? createEmailClient({
        apiKey: parsed.resendApiKey as string,
        from: parsed.emailFrom as string,
      })
    : null;

  return betterAuth({
    secret: parsed.secret,
    baseURL: parsed.baseURL,
    trustedOrigins: parsed.trustedOrigins,
    advanced: {
      database: {
        generateId: "uuid",
      },
    },
    user: {
      additionalFields: {
        nickname: {
          type: "string",
          required: false,
          input: true,
        },
      },
    },
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: authSchema,
      transaction: true,
    }),
    emailAndPassword: parsed.enableEmailPassword
      ? {
          enabled: true,
        }
      : undefined,
    emailVerification: emailClient
      ? {
          sendOnSignUp: true,
          sendVerificationEmail: async ({ user, url }) => {
            void emailClient.sendVerificationEmail(user.email, url, user.name);
          },
        }
      : undefined,
    socialProviders:
      parsed.githubClientId && parsed.githubClientSecret
        ? {
            github: {
              clientId: parsed.githubClientId,
              clientSecret: parsed.githubClientSecret,
            },
          }
        : undefined,
    databaseHooks: {
      user: {
        create: {
          after: async (authUser) => {
            await linkPlayerForAuthUser(db, authUser);
          },
        },
      },
    },
    plugins: [organization()],
  });
}

/** @deprecated use createAuth */
export const createAuthStub = createAuth;

export type AuthInstance = ReturnType<typeof createAuth>;
