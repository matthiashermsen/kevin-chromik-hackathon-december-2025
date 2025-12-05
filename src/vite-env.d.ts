/// <reference types="vite/client" />

declare const __APP_VERSION__: string;

interface ImportMetaEnv {
	readonly VITE_ROUTER_BASE_PATH: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
