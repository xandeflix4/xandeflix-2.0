import type { IptvChannel } from '../types/playlist';

type PendingChannelMetadata = {
  name?: string;
  logo?: string;
  groupTitle?: string;
  tvgId?: string;
  tvgName?: string;
};

function parseAttributes(line: string) {
  const attributes: Record<string, string> = {};
  const attributeRegex = /([\w-]+)="([^"]*)"/g;

  for (const match of line.matchAll(attributeRegex)) {
    const [, key, value] = match;

    if (key) {
      attributes[key] = value ?? '';
    }
  }

  return attributes;
}

function parseChannelName(line: string) {
  const commaIndex = line.lastIndexOf(',');

  if (commaIndex === -1) {
    return undefined;
  }

  return line.slice(commaIndex + 1).trim() || undefined;
}

function isPlayableUrl(line: string) {
  const normalizedLine = line.trim().toLowerCase();

  return (
    normalizedLine.startsWith('http://') ||
    normalizedLine.startsWith('https://') ||
    normalizedLine.startsWith('rtmp://') ||
    normalizedLine.startsWith('rtsp://')
  );
}

export function parseM3uPlaylist(content: string): IptvChannel[] {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const channels: IptvChannel[] = [];
  let pendingMetadata: PendingChannelMetadata | null = null;

  for (const line of lines) {
    if (line.startsWith('#EXTINF')) {
      const attributes = parseAttributes(line);

      pendingMetadata = {
        name: parseChannelName(line),
        logo: attributes['tvg-logo'],
        groupTitle: attributes['group-title'],
        tvgId: attributes['tvg-id'],
        tvgName: attributes['tvg-name'],
      };

      continue;
    }

    if (line.startsWith('#')) {
      continue;
    }

    if (!isPlayableUrl(line)) {
      continue;
    }

    const name =
      pendingMetadata?.name ||
      pendingMetadata?.tvgName ||
      `Canal ${channels.length + 1}`;

    channels.push({
      id: `${channels.length + 1}`,
      name,
      url: line,
      logo: pendingMetadata?.logo,
      groupTitle: pendingMetadata?.groupTitle,
      tvgId: pendingMetadata?.tvgId,
      tvgName: pendingMetadata?.tvgName,
    });

    pendingMetadata = null;
  }

  return channels;
}
