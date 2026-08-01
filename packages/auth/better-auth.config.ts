import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";

/** CLI config for `bunx @better-auth/cli generate` — not used at runtime. */
export const auth = betterAuth({
  emailAndPassword: { enabled: true },
  plugins: [organization()],
  advanced: {
    database: {
      generateId: "uuid",
    },
  },
});
