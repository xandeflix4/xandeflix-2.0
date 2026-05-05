// src/features/tv-focus/focusKeys.ts

export const FOCUS_KEYS = {
  HERO_PLAY: 'hero-play-button',
  HEADER_SEARCH: 'header-search',
  SIDEBAR_HOME: 'sidebar-home',

  // Use este padrão quando registrar o primeiro card da primeira linha.
  FIRST_ROW_FIRST_CARD: 'catalog-row-0-card-0',

  // Já deixamos preparado para o Player Universal.
  PLAYER_BACK: 'player-back-button',
  PLAYER_PLAY: 'player-play-button',
} as const;

export type FocusKey = (typeof FOCUS_KEYS)[keyof typeof FOCUS_KEYS];

export const CATALOG_FOCUS_FALLBACKS: string[] = [
  FOCUS_KEYS.HERO_PLAY,
  FOCUS_KEYS.FIRST_ROW_FIRST_CARD,
  FOCUS_KEYS.SIDEBAR_HOME,
  FOCUS_KEYS.HEADER_SEARCH,
];

export const PLAYER_FOCUS_FALLBACKS: string[] = [
  FOCUS_KEYS.PLAYER_BACK,
  FOCUS_KEYS.PLAYER_PLAY,
  FOCUS_KEYS.HERO_PLAY,
  FOCUS_KEYS.SIDEBAR_HOME,
];