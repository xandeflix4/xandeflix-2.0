import type { CatalogItem, CatalogMediaType } from '../types';

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
const TMDB_POSTER_SIZE = 'w500';
const TMDB_BACKDROP_SIZE = 'w1280';

const MEDIA_TYPE_LABELS: Record<CatalogMediaType, string> = {
  movie: 'Filme',
  series: 'Serie',
  channel: 'Canal',
  collection: 'Colecao',
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

function normalizeTmdbPath(path: string) {
  return path.startsWith('/') ? path : `/${path}`;
}

function buildTmdbImageUrl(path?: string, size = TMDB_POSTER_SIZE) {
  if (!isNonEmptyString(path)) {
    return undefined;
  }

  return `${TMDB_IMAGE_BASE_URL}/${size}${normalizeTmdbPath(path)}`;
}

function getFirstAvailableUrl(values: Array<string | undefined>) {
  return values.find((value) => isNonEmptyString(value));
}

function toTrimmedText(value: string | number | undefined) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  if (isNonEmptyString(value)) {
    return value.trim();
  }

  return undefined;
}

export function getCatalogPosterUrl(item: CatalogItem) {
  return getFirstAvailableUrl([
    item.posterUrl,
    item.thumbnailUrl,
    item.imageUrl,
    buildTmdbImageUrl(item.posterPath, TMDB_POSTER_SIZE),
    buildTmdbImageUrl(item.backdropPath, TMDB_POSTER_SIZE),
    item.backdropUrl,
  ]);
}

export function getCatalogBackdropUrl(item: CatalogItem) {
  return getFirstAvailableUrl([
    item.backdropUrl,
    buildTmdbImageUrl(item.backdropPath, TMDB_BACKDROP_SIZE),
    item.imageUrl,
    buildTmdbImageUrl(item.posterPath, TMDB_BACKDROP_SIZE),
    item.posterUrl,
    item.thumbnailUrl,
  ]);
}

export function getCatalogMediaTypeLabel(mediaType?: CatalogMediaType) {
  if (!mediaType) {
    return undefined;
  }

  return MEDIA_TYPE_LABELS[mediaType];
}

export function getCatalogYearLabel(value?: string | number) {
  return toTrimmedText(value);
}

export function getCatalogRatingLabel(value?: string | number) {
  const rating = toTrimmedText(value);

  if (!rating) {
    return undefined;
  }

  return `Nota ${rating}`;
}

export function getCatalogOverview(
  item: CatalogItem,
  fallbackText = 'Selecao pronta para maratona na tela grande.',
) {
  if (isNonEmptyString(item.overview)) {
    return item.overview.trim();
  }

  if (isNonEmptyString(item.subtitle)) {
    return item.subtitle.trim();
  }

  return fallbackText;
}
