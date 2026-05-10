import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type GetAuthorizedIptvSourceRequest = {
  deviceIdentifier?: string;
  licenseCode?: string;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

function isExpired(expiresAt: string | null) {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() < Date.now();
}

function normalizeLicenseCode(value?: string | null) {
  const normalized = value?.trim().toUpperCase();
  return normalized ? normalized : null;
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ ok: false, error: 'METHOD_NOT_ALLOWED' }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ ok: false, error: 'SERVER_ERROR' }, 500);
    }

    let payload: GetAuthorizedIptvSourceRequest;

    try {
      payload = (await request.json()) as GetAuthorizedIptvSourceRequest;
    } catch {
      return jsonResponse({ ok: false, error: 'INVALID_PAYLOAD' }, 400);
    }

    const deviceIdentifier = payload.deviceIdentifier?.trim();
    const licenseCode = normalizeLicenseCode(payload.licenseCode);

    if (!deviceIdentifier) {
      return jsonResponse({ ok: false, error: 'INVALID_PAYLOAD' }, 400);
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    if (licenseCode) {
      const { data: license, error: licenseError } = await supabaseAdmin
        .from('licenses')
        .select('id, license_code, status, expires_at, max_devices, max_concurrent_streams, allow_user_manage_sources')
        .eq('license_code', licenseCode)
        .maybeSingle();

      if (licenseError) {
        return jsonResponse({ ok: false, error: 'SERVER_ERROR', details: licenseError.message }, 500);
      }

      if (!license) {
        return jsonResponse({ ok: false, error: 'LICENSE_NOT_FOUND' }, 404);
      }

      if (license.status === 'blocked') {
        return jsonResponse({ ok: false, error: 'LICENSE_BLOCKED' }, 403);
      }

      if (license.status !== 'active') {
        return jsonResponse({ ok: false, error: 'LICENSE_INACTIVE' }, 403);
      }

      if (isExpired(license.expires_at)) {
        return jsonResponse({ ok: false, error: 'LICENSE_EXPIRED' }, 403);
      }

      const { data: device, error: deviceError } = await supabaseAdmin
        .from('license_devices')
        .select('id, device_identifier, is_active')
        .eq('license_id', license.id)
        .eq('device_identifier', deviceIdentifier)
        .maybeSingle();

      if (deviceError) {
        return jsonResponse({ ok: false, error: 'SERVER_ERROR', details: deviceError.message }, 500);
      }

      if (!device) {
        return jsonResponse({ ok: false, error: 'DEVICE_NOT_ACTIVATED' }, 403);
      }

      if (!device.is_active) {
        return jsonResponse({ ok: false, error: 'DEVICE_INACTIVE' }, 403);
      }

      const { data: source, error: sourceError } = await supabaseAdmin
        .from('license_iptv_sources')
        .select('id, name, source_url, type, is_active')
        .eq('license_id', license.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (sourceError) {
        return jsonResponse({ ok: false, error: 'SERVER_ERROR', details: sourceError.message }, 500);
      }

      if (!source) {
        return jsonResponse({ ok: false, error: 'IPTV_SOURCE_NOT_FOUND' }, 404);
      }

      await supabaseAdmin
        .from('license_devices')
        .update({
          last_seen_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', device.id);

      return jsonResponse({
        ok: true,
        mode: 'license',
        license: {
          id: license.id,
          licenseCode: license.license_code,
          status: license.status,
          expiresAt: license.expires_at,
          maxDevices: license.max_devices,
          maxConcurrentStreams: license.max_concurrent_streams,
          allowUserManageSources: license.allow_user_manage_sources,
        },
        device: {
          id: device.id,
          deviceIdentifier: device.device_identifier,
          isActive: device.is_active,
        },
        source: {
          id: source.id,
          name: source.name,
          type: source.type,
          url: source.source_url,
        },
      });
    }

    const authorization = request.headers.get('Authorization');

    if (!authorization?.startsWith('Bearer ')) {
      return jsonResponse({ ok: false, error: 'AUTH_REQUIRED' }, 401);
    }

    const token = authorization.replace('Bearer ', '');

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return jsonResponse({ ok: false, error: 'UNAUTHENTICATED', details: userError?.message }, 401);
    }

    const { data: device, error: deviceError } = await supabaseAdmin
      .from('devices')
      .select('id, client_id, device_name, device_identifier, platform, is_active')
      .eq('device_identifier', deviceIdentifier)
      .maybeSingle();

    if (deviceError) {
      return jsonResponse({ ok: false, error: 'SERVER_ERROR', details: deviceError.message }, 500);
    }

    if (!device) {
      return jsonResponse({ ok: false, error: 'DEVICE_NOT_AUTHORIZED' }, 403);
    }

    if (!device.is_active) {
      return jsonResponse({ ok: false, error: 'DEVICE_INACTIVE' }, 403);
    }

    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('id, name, status, expires_at')
      .eq('id', device.client_id)
      .maybeSingle();

    if (clientError) {
      return jsonResponse({ ok: false, error: 'SERVER_ERROR', details: clientError.message }, 500);
    }

    if (!client) {
      return jsonResponse({ ok: false, error: 'CLIENT_NOT_FOUND' }, 403);
    }

    if (client.status !== 'active') {
      return jsonResponse({ ok: false, error: 'CLIENT_INACTIVE', status: client.status }, 403);
    }

    if (isExpired(client.expires_at)) {
      return jsonResponse({ ok: false, error: 'CLIENT_EXPIRED' }, 403);
    }

    const { data: source, error: sourceError } = await supabaseAdmin
      .from('iptv_sources')
      .select('id, name, source_url, type, is_active')
      .eq('client_id', client.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (sourceError) {
      return jsonResponse({ ok: false, error: 'SERVER_ERROR', details: sourceError.message }, 500);
    }

    if (!source) {
      return jsonResponse({ ok: false, error: 'IPTV_SOURCE_NOT_FOUND' }, 404);
    }

    await supabaseAdmin
      .from('devices')
      .update({
        last_seen_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', device.id);

    return jsonResponse({
      ok: true,
      mode: 'client',
      client: {
        id: client.id,
        name: client.name,
        status: client.status,
        expiresAt: client.expires_at,
      },
      device: {
        id: device.id,
        name: device.device_name,
        identifier: device.device_identifier,
        platform: device.platform,
      },
      source: {
        id: source.id,
        name: source.name,
        type: source.type,
        url: source.source_url,
      },
    });
  } catch (error) {
    return jsonResponse({
      ok: false,
      error: 'SERVER_ERROR',
      details: error instanceof Error ? error.message : String(error),
    }, 500);
  }
});
