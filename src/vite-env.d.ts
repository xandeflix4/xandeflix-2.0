/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TEST_IPTV_PLAYLIST_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
