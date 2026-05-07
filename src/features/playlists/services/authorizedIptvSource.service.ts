import { env } from '@/config/env';
import { supabase } from '@/lib/supabase/supabaseClient';

import type { PlaylistSource } from '../types/playlist';

export type AuthorizedIptvSource = {
  client: {
    id: string;
    name: string;
    status: string;
    expiresAt: string | null;
  };
  device: {
    id: string;
    name: string | null;
    identifier: string | null;
    platform: string | null;
  };
  source: {
    id: string;
    name: string;
    type: 'm3u' | 'xtream' | 'manual';
    url: string;
  };
};

type GetAuthorizedIptvSourceSuccessResponse = {
  ok: true;
} & AuthorizedIptvSource;

type GetAuthorizedIptvSourceErrorResponse = {
  ok?: false;
  error?: string;
  details?: string;
  status?: string;
};

type GetAuthorizedIptvSourceResponse =
  | GetAuthorizedIptvSourceSuccessResponse
  | GetAuthorizedIptvSourceErrorResponse;

function isAuthorizedIptvSourceSuccess(
  data: GetAuthorizedIptvSourceResponse | null,
): data is GetAuthorizedIptvSourceSuccessResponse {
  return Boolean(data?.ok);
}

export async function getAuthorizedIptvSource(
  deviceIdentifier: string,
): Promise<AuthorizedIptvSource> {
  const normalizedDeviceIdentifier = deviceIdentifier.trim();

  if (!normalizedDeviceIdentifier) {
    throw new Error('Identificador do dispositivo não informado.');
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.access_token) {
    throw new Error('Sessão do usuário não encontrada.');
  }

  const response = await fetch(
    `${env.supabaseUrl}/functions/v1/get-authorized-iptv-source`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        apikey: env.supabaseAnonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deviceIdentifier: normalizedDeviceIdentifier,
      }),
    },
  );

  const data = (await response.json().catch(() => null)) as
    | GetAuthorizedIptvSourceResponse
    | null;

  if (!response.ok || !isAuthorizedIptvSourceSuccess(data)) {
    const errorData = data as GetAuthorizedIptvSourceErrorResponse | null;

    throw new Error(
      errorData?.details ||
        errorData?.error ||
        `Não foi possível resolver a fonte IPTV autorizada. HTTP ${response.status}`,
    );
  }

  return {
    client: data.client,
    device: data.device,
    source: data.source,
  };
}

export function mapAuthorizedIptvSourceToPlaylistSource(
  authorizedSource: AuthorizedIptvSource,
): PlaylistSource {
  return {
    url: authorizedSource.source.url,
    name: authorizedSource.source.name,
  };
}
