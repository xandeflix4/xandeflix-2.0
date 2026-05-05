import { Capacitor, CapacitorHttp } from '@capacitor/core';

import { analyzeM3uPlaylist } from './analyzeM3uPlaylist';
import { parseM3uPlaylist } from './parseM3uPlaylist';
import type {
  LoadedPlaylist,
  PlaylistSource,
} from '../types/playlist';

async function fetchPlaylistWithBrowser(sourceUrl: string) {
  const response = await fetch(sourceUrl, {
    method: 'GET',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Falha ao carregar playlist. HTTP ${response.status}.`);
  }

  return response.text();
}

async function fetchPlaylistWithNativeHttp(sourceUrl: string) {
  const response = await CapacitorHttp.get({
    url: sourceUrl,
    headers: {
      Accept:
        'application/vnd.apple.mpegurl, application/x-mpegURL, audio/mpegurl, text/plain, */*',
      'User-Agent': 'Xandeflix/1.0',
    },
    responseType: 'text',
  });

  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Falha ao carregar playlist. HTTP ${response.status}.`);
  }

  if (typeof response.data === 'string') {
    return response.data;
  }

  return JSON.stringify(response.data);
}

async function fetchPlaylistContent(sourceUrl: string) {
  if (Capacitor.isNativePlatform()) {
    return fetchPlaylistWithNativeHttp(sourceUrl);
  }

  try {
    return await fetchPlaylistWithBrowser(sourceUrl);
  } catch (error) {
    throw new Error(
      error instanceof TypeError
        ? 'Falha ao carregar playlist no navegador. Possível bloqueio de CORS. Teste no app Android/Fire Stick com CapacitorHttp.'
        : error instanceof Error
          ? error.message
          : 'Erro desconhecido ao carregar playlist.',
    );
  }
}

export async function loadDirectSourcePlaylist(
  source: PlaylistSource,
): Promise<LoadedPlaylist> {
  const sourceUrl = source.url.trim();

  if (!sourceUrl) {
    throw new Error('URL da playlist não informada.');
  }

  if (!/^https?:\/\//i.test(sourceUrl)) {
    throw new Error('A URL da playlist deve começar com http:// ou https://.');
  }

  const content = await fetchPlaylistContent(sourceUrl);
  const diagnostics = analyzeM3uPlaylist(content);
  const channels = parseM3uPlaylist(content);

  return {
    channels,
    total: channels.length,
    diagnostics,
  };
}
