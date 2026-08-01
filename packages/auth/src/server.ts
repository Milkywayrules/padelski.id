import { serverEnv } from "@padelski/env/server";
import { type AuthInstance, createAuth } from "./index";

export function createServerAuth(options: { enableEmailPassword?: boolean } = {}): AuthInstance {
  const apiPublicUrl = serverEnv.BETTER_AUTH_URL.replace(/\/$/, "");

  return createAuth({
    secret: serverEnv.BETTER_AUTH_SECRET,
    baseURL: `${apiPublicUrl}/v1/auth`,
    trustedOrigins: [serverEnv.API_CORS_ORIGIN],
    githubClientId: serverEnv.OAUTH_GITHUB_CLIENT_ID,
    githubClientSecret: serverEnv.OAUTH_GITHUB_CLIENT_SECRET,
    enableEmailPassword: options.enableEmailPassword ?? false,
  });
}
