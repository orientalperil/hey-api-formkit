// Standalone token storage — imported by both the Pinia auth store and the
// hey-api runtime config (src/hey-api.ts). Kept dependency-free so neither of
// those creates an import cycle through the generated client.

const TOKEN_KEY = 'token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}
