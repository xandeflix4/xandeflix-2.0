import { supabase } from '../../../lib/supabase/supabaseClient';

import type { IptvSource } from '../types/admin.types';

export type AdminPlaylistImportResult = {
  source: IptvSource;
  sourceId: string;
  sourceName: string;
  channelsCount: number;
  total: number;
};

type SyncIptvSourceResponse = {
  ok?: boolean;
  sourceId?: string;
  sourceName?: string;
  channelsCount?: number;
  error?: string;
  details?: string;
};

export async function importAdminPlaylistSource(
  source: IptvSource,
): Promise<AdminPlaylistImportResult> {
  const { data, error } =
    await supabase.functions.invoke<SyncIptvSourceResponse>(
      'sync-iptv-source',
      {
        body: {
          sourceId: source.id,
        },
      },
    );

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.ok) {
    throw new Error(
      data?.error ||
        data?.details ||
        'Não foi possível sincronizar a fonte IPTV.',
    );
  }

  const channelsCount = data.channelsCount ?? 0;

  return {
    source,
    sourceId: data.sourceId ?? source.id,
    sourceName: data.sourceName ?? source.name,
    channelsCount,
    total: channelsCount,
  };
}
