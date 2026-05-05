import { analyzeM3uPlaylist } from './analyzeM3uPlaylist';
import { parseM3uPlaylist } from './parseM3uPlaylist';
import type {
  LoadedPlaylist,
  PlaylistSource,
} from '../types/playlist';

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

  const response = await fetch(sourceUrl, {
    method: 'GET',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Falha ao carregar playlist. HTTP ${response.status}.`);
  }

  const content = await response.text();
  const diagnostics = analyzeM3uPlaylist(content);
  const channels = parseM3uPlaylist(content);

  return {
    channels,
    total: channels.length,
    diagnostics,
  };
}
