import { inferAdditionalFields, organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

/** Auth API root — Better Auth routes live at `{baseURL}/v1/auth` on Elysia. */
export function createPadelskiAuthClient(apiPublicUrl: string) {
  return createAuthClient({
    baseURL: `${apiPublicUrl.replace(/\/$/, "")}/v1/auth`,
    plugins: [
      organizationClient(),
      inferAdditionalFields({
        user: {
          nickname: { type: "string", required: false },
        },
      }),
    ],
  });
}

export type PadelskiAuthClient = ReturnType<typeof createPadelskiAuthClient>;
