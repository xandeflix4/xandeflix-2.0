import type { StreamDetectionResult, StreamKind } from '../types/stream';

function normalizeInput(value: string) {
  return value.trim();
}

function removeQueryAndHash(value: string) {
  return value.split('#')[0]?.split('?')[0]?.split('|')[0] ?? value;
}

function getExtension(value: string) {
  const cleanValue = removeQueryAndHash(value).toLowerCase();

  let pathname = cleanValue;

  try {
    pathname = new URL(cleanValue).pathname.toLowerCase();
  } catch {
    pathname = cleanValue;
  }

  const lastSlashIndex = pathname.lastIndexOf('/');
  const lastPathSegment =
    lastSlashIndex === -1 ? pathname : pathname.slice(lastSlashIndex + 1);
  const lastDotIndex = lastPathSegment.lastIndexOf('.');

  if (lastDotIndex === -1) {
    return null;
  }

  return lastPathSegment.slice(lastDotIndex);
}

function detectByMimeType(mimeType?: string): StreamKind | null {
  if (!mimeType) return null;

  const normalizedMimeType = mimeType.toLowerCase();

  if (
    normalizedMimeType.includes('application/vnd.apple.mpegurl') ||
    normalizedMimeType.includes('application/x-mpegurl')
  ) {
    return 'hls';
  }

  if (
    normalizedMimeType.includes('application/dash+xml') ||
    normalizedMimeType.includes('video/vnd.mpeg.dash.mpd')
  ) {
    return 'dash';
  }

  if (
    normalizedMimeType.includes('video/mp2t') ||
    normalizedMimeType.includes('video/mpeg')
  ) {
    return 'mpegts';
  }

  if (normalizedMimeType.includes('video/mp4')) {
    return 'mp4';
  }

  return null;
}

function detectByExtension(extension: string | null): StreamKind {
  if (!extension) return 'unknown';

  if (extension === '.m3u8') {
    return 'hls';
  }

  if (extension === '.mpd') {
    return 'dash';
  }

  if (extension === '.ts' || extension === '.m2ts') {
    return 'mpegts';
  }

  if (extension === '.mp4' || extension === '.m4v') {
    return 'mp4';
  }

  return 'unknown';
}

function isNumericStreamId(value: string) {
  return /^\d+$/.test(value);
}

function detectBareXtreamCredentialPath(pathname: string): StreamKind | null {
  const segments = pathname
    .split('/')
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (segments.length < 3) {
    return null;
  }

  const firstSegment = segments[0]?.toLowerCase();
  const lastSegment = segments[segments.length - 1] ?? '';

  // VOD/séries podem depender de outra estratégia quando vierem sem extensão.
  if (firstSegment === 'movie' || firstSegment === 'series' || firstSegment === 'vod') {
    return null;
  }

  // Alguns painéis Xtream/CDN entregam canais ao vivo como:
  // http://host/usuario/senha/id
  // sem /live/ e sem extensão .ts.
  if (isNumericStreamId(lastSegment)) {
    return 'mpegts';
  }

  return null;
}

function detectByUrlHints(url: string): StreamKind | null {
  const normalizedUrl = url.trim();

  if (!normalizedUrl) {
    return null;
  }

  try {
    const parsedUrl = new URL(normalizedUrl);
    const output = (parsedUrl.searchParams.get('output') || '').toLowerCase();
    const type = (parsedUrl.searchParams.get('type') || '').toLowerCase();
    const pathLower = parsedUrl.pathname.toLowerCase();

    if (pathLower.endsWith('.m3u8')) {
      return 'hls';
    }

    if (pathLower.endsWith('.ts') || pathLower.endsWith('.m2ts')) {
      return 'mpegts';
    }

    if (output === 'hls' || output === 'm3u8' || type === 'hls' || type === 'm3u8') {
      return 'hls';
    }

    if (output === 'ts' || output === 'mpegts') {
      return 'mpegts';
    }

    // Padrão Xtream para live costuma vir sem extensão final.
    if (pathLower.includes('/live/')) {
      return 'mpegts';
    }

    const bareXtreamKind = detectBareXtreamCredentialPath(parsedUrl.pathname);

    if (bareXtreamKind) {
      return bareXtreamKind;
    }
  } catch {
    const fallbackLower = normalizedUrl.toLowerCase();

    if (fallbackLower.includes('output=hls') || fallbackLower.includes('output=m3u8')) {
      return 'hls';
    }

    if (fallbackLower.includes('output=ts') || fallbackLower.includes('output=mpegts')) {
      return 'mpegts';
    }

    if (fallbackLower.includes('/live/')) {
      return 'mpegts';
    }

    const fallbackWithoutQuery = removeQueryAndHash(fallbackLower);
    const fallbackSegments = fallbackWithoutQuery.split('/').filter(Boolean);
    const fallbackLastSegment = fallbackSegments[fallbackSegments.length - 1] ?? '';

    if (isNumericStreamId(fallbackLastSegment)) {
      return 'mpegts';
    }
  }

  return null;
}

export function detectStreamKind(
  url: string,
  mimeType?: string,
): StreamDetectionResult {
  const normalizedUrl = normalizeInput(url);
  const extension = getExtension(normalizedUrl);

  return {
    kind:
      detectByMimeType(mimeType) ??
      detectByUrlHints(normalizedUrl) ??
      detectByExtension(extension),
    url: normalizedUrl,
    extension,
    mimeType,
  };
}
