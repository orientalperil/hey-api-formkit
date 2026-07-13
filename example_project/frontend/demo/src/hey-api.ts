import { getToken } from "@/auth-token"
import type { CreateClientConfig } from "@/client/client.gen"

// Called when the generated client initializes. Resolves the API base URL from
// VITE_API_URL (see .env) so it can differ per environment without regenerating.
export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:8000",
  // Throw on non-2xx so SDK calls surface errors to catch/await
  throwOnError: true,
  // For endpoints declaring the `bearer` security scheme, attach the stored
  // token. hey-api adds the `Bearer ` prefix. Read from localStorage (not the
  // Pinia store) to stay decoupled and work before the app mounts.
  auth: (scheme) => (scheme.scheme === "bearer" ? (getToken() ?? undefined) : undefined),
})
