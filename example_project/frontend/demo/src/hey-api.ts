import type { CreateClientConfig } from '@/client/client.gen'

// Called when the generated client initializes. Resolves the API base URL from
// VITE_API_URL (see .env) so it can differ per environment without regenerating.
export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
  // Throw on non-2xx so SDK calls surface errors to catch/await
  throwOnError: true,
})
