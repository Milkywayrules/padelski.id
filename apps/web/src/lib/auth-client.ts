import { createPadelskiAuthClient } from "@padelski/auth/client";
import { clientEnv } from "@padelski/env/client";

export const authClient = createPadelskiAuthClient(clientEnv.NEXT_PUBLIC_API_URL);
