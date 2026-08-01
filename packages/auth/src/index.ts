import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";
import { z } from "zod";

export const authConfigSchema = z.object({
  secret: z.string().min(32),
  baseURL: z.string().url(),
  trustedOrigins: z.array(z.string().url()).min(1),
  githubClientId: z.string().optional(),
  githubClientSecret: z.string().optional(),
  enableEmailPassword: z.boolean().default(true),
});

export type AuthConfig = z.infer<typeof authConfigSchema>;

export function createAuth(config: AuthConfig) {
  const parsed = authConfigSchema.parse(config);

  return betterAuth({
    secret: parsed.secret,
    baseURL: parsed.baseURL,
    trustedOrigins: parsed.trustedOrigins,
    emailAndPassword: parsed.enableEmailPassword
      ? {
          enabled: true,
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
    plugins: [organization()],
  });
}

/** @deprecated use createAuth */
export const createAuthStub = createAuth;

export type AuthInstance = ReturnType<typeof createAuth>;
