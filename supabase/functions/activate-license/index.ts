import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type ActivateLicenseRequest = {
  licenseCode?: string;
  deviceIdentifier?: string;
  deviceName?: string;
  platform?: string;
  manufacturer?: string;
  model?: string;
  appVersion?: string;
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

function normalizeText(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ ok: false, error: 'INVALID_METHOD' }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ ok: false, error: 'SERVER_ERROR' }, 500);
    }

    let payload: ActivateLicenseRequest;

    try {
      payload = (await request.json()) as ActivateLicenseRequest;
    } catch {
      return jsonResponse({ ok: false, error: 'INVALID_PAYLOAD' }, 400);
    }

    const licenseCode = payload.licenseCode?.trim().toUpperCase();
    const deviceIdentifier = payload.deviceIdentifier?.trim();

    if (!licenseCode || !deviceIdentifier) {
      return jsonResponse({ ok: false, error: 'INVALID_PAYLOAD' }, 400);
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

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

    const now = new Date().toISOString();

    const { data: existingDevice, error: existingDeviceError } = await supabaseAdmin
      .from('license_devices')
      .select('id, device_identifier, is_active')
      .eq('license_id', license.id)
      .eq('device_identifier', deviceIdentifier)
      .maybeSingle();

    if (existingDeviceError) {
      return jsonResponse({ ok: false, error: 'SERVER_ERROR', details: existingDeviceError.message }, 500);
    }

    if (existingDevice) {
      const { data: updatedDevice, error: updateDeviceError } = await supabaseAdmin
        .from('license_devices')
        .update({
          device_name: normalizeText(payload.deviceName),
          platform: normalizeText(payload.platform),
          manufacturer: normalizeText(payload.manufacturer),
          model: normalizeText(payload.model),
          app_version: normalizeText(payload.appVersion),
          is_active: true,
          last_seen_at: now,
        })
        .eq('id', existingDevice.id)
        .select('id, device_identifier, is_active')
        .single();

      if (updateDeviceError) {
        return jsonResponse({ ok: false, error: 'SERVER_ERROR', details: updateDeviceError.message }, 500);
      }

      return jsonResponse({
        ok: true,
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
          id: updatedDevice.id,
          deviceIdentifier: updatedDevice.device_identifier,
          isActive: updatedDevice.is_active,
        },
      });
    }

    const { count: activeDevicesCount, error: countError } = await supabaseAdmin
      .from('license_devices')
      .select('id', { count: 'exact', head: true })
      .eq('license_id', license.id)
      .eq('is_active', true);

    if (countError) {
      return jsonResponse({ ok: false, error: 'SERVER_ERROR', details: countError.message }, 500);
    }

    if ((activeDevicesCount ?? 0) >= license.max_devices) {
      return jsonResponse({ ok: false, error: 'DEVICE_LIMIT_REACHED' }, 403);
    }

    const { data: createdDevice, error: createDeviceError } = await supabaseAdmin
      .from('license_devices')
      .insert({
        license_id: license.id,
        device_identifier: deviceIdentifier,
        device_name: normalizeText(payload.deviceName),
        platform: normalizeText(payload.platform),
        manufacturer: normalizeText(payload.manufacturer),
        model: normalizeText(payload.model),
        app_version: normalizeText(payload.appVersion),
        is_active: true,
        first_seen_at: now,
        last_seen_at: now,
      })
      .select('id, device_identifier, is_active')
      .single();

    if (createDeviceError) {
      return jsonResponse({ ok: false, error: 'SERVER_ERROR', details: createDeviceError.message }, 500);
    }

    return jsonResponse({
      ok: true,
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
        id: createdDevice.id,
        deviceIdentifier: createdDevice.device_identifier,
        isActive: createdDevice.is_active,
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
