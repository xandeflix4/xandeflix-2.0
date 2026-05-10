import { env } from '@/config/env';

export async function fetchPlaylistViaProxy(sourceUrl: string): Promise<Response> {
  const normalizedSourceUrl = sourceUrl.trim();

  if (!normalizedSourceUrl) {
    throw new Error('URL da playlist não informada.');
  }

  const response = await fetch(
    `${env.supabaseUrl}/functions/v1/playlist-proxy`,
    {
      method: 'POST',
      headers: {
        apikey: env.supabaseAnonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceUrl: normalizedSourceUrl,
      }),
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.details ||
        errorData?.error ||
        `Falha ao carregar playlist via proxy. HTTP ${response.status}`,
    );
  }

  return response;
}
