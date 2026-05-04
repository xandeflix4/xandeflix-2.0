export const ENABLE_SPATIAL_DEBUG =
  import.meta.env.DEV && import.meta.env.VITE_SPATIAL_DEBUG === 'true';

type DebugScope =
  | 'provider'
  | 'route-focus'
  | 'hero'
  | 'header'
  | 'sidebar'
  | 'catalog-grid'
  | 'focus-recovery'
  | 'fire-tv'
  | 'unknown';

export function spatialDebug(scope: DebugScope, ...args: unknown[]) {
  if (!ENABLE_SPATIAL_DEBUG) return;

  console.log(`[XANDEFLIX:SPATIAL:${scope}]`, ...args);
}

export function spatialWarn(scope: DebugScope, ...args: unknown[]) {
  if (!ENABLE_SPATIAL_DEBUG) return;

  console.warn(`[XANDEFLIX:SPATIAL:${scope}]`, ...args);
}

export function spatialError(scope: DebugScope, ...args: unknown[]) {
  if (!ENABLE_SPATIAL_DEBUG) return;

  console.error(`[XANDEFLIX:SPATIAL:${scope}]`, ...args);
}