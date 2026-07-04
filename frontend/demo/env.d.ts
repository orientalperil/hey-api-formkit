/// <reference types="vite/client" />

// FormKit ships its themes as bare CSS with no type declarations.
declare module '@formkit/themes/genesis'

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
