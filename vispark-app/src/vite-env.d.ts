/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly __GIT_COMMIT_HASH__: string
  readonly __BUILD_TIME__: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
