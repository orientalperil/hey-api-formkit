import { defineConfig } from '@hey-api/openapi-ts'

// https://heyapi.dev/openapi-ts/get-started
export default defineConfig({
  input: './openapi.yaml',
  output: {
    path: './src/client',
    postProcess: ['prettier'],
  },
  plugins: [
    {
      name: '@hey-api/client-fetch',
      // The base URL is resolved at runtime from VITE_API_URL — see
      // src/hey-api.ts (referenced via runtimeConfigPath below).
      runtimeConfigPath: './src/hey-api.ts',
    },
    '@hey-api/schemas',
    '@hey-api/sdk',
    {
      name: '@hey-api/typescript',
      enums: 'javascript',
    },
  ],
})
