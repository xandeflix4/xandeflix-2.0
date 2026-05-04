export const ENABLE_SPATIAL_DEBUG =
  import.meta.env.VITE_SPATIAL_DEBUG === 'true';

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

function formatSpatialLogArg(arg: unknown): unknown {
  if (arg === null) return null;

  if (typeof arg === 'object') {
    try {
      return JSON.stringify(arg);
    } catch {
      return '[Unserializable Object]';
    }
  }

  return arg;
}

function formatSpatialLogArgs(args: unknown[]) {
  return args.map(formatSpatialLogArg);
}

export function spatialDebug(scope: DebugScope, ...args: unknown[]) {
  if (!ENABLE_SPATIAL_DEBUG) return;

  console.log(
    `[XANDEFLIX:SPATIAL:${scope}]`,
    ...formatSpatialLogArgs(args),
  );
}

export function spatialWarn(scope: DebugScope, ...args: unknown[]) {
  if (!ENABLE_SPATIAL_DEBUG) return;

  console.warn(
    `[XANDEFLIX:SPATIAL:${scope}]`,
    ...formatSpatialLogArgs(args),
  );
}

export function spatialError(scope: DebugScope, ...args: unknown[]) {
  if (!ENABLE_SPATIAL_DEBUG) return;

  console.error(
    `[XANDEFLIX:SPATIAL:${scope}]`,
    ...formatSpatialLogArgs(args),
  );
}