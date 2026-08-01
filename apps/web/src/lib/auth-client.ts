import { createPadelskiAuthClient } from "@padelski/auth/client";
import { clientEnv } from "@padelski/env/client";

/** Fallback for CI/static build when `skipValidation` leaves public URLs unset. */
const apiPublicUrl = clientEnv.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export const authClient = createPadelskiAuthClient(apiPublicUrl);
