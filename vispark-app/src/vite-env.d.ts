/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

interface ImportMetaEnv {
	readonly VITE_YOUTUBE_API_KEY?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
