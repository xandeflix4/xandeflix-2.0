const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return jsonResponse(
      { ok: false, error: 'METHOD_NOT_ALLOWED' },
      405,
    );
  }

  try {
    const payload = await request.json();

    const sourceUrl =
      typeof payload?.sourceUrl === 'string'
        ? payload.sourceUrl.trim()
        : '';

    if (!sourceUrl) {
      return jsonResponse(
        { ok: false, error: 'SOURCE_URL_REQUIRED' },
        400,
      );
    }

    if (!/^https?:\/\//i.test(sourceUrl)) {
      return jsonResponse(
        { ok: false, error: 'INVALID_SOURCE_URL' },
        400,
      );
    }

    const response = await fetch(sourceUrl, {
      method: 'GET',
      headers: {
        Accept:
          'application/vnd.apple.mpegurl, application/x-mpegURL, text/plain, */*',
        'User-Agent': 'Xandeflix/1.0',
      },
    });

    if (!response.ok) {
      return jsonResponse(
        {
          ok: false,
          error: 'UPSTREAM_FETCH_FAILED',
          status: response.status,
        },
        502,
      );
    }

    const text = await response.text();

    return new Response(text, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        error: 'SERVER_ERROR',
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      500,
    );
  }
});
