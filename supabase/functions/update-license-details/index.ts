import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type AdminRole = 'admin' | 'super_admin';
type LicensePlanType = 'monthly' | 'quarterly' | 'semiannual' | 'annual';

type UpdateLicenseDetailsRequest = {
  licenseId?: string;
  label?: string | null;
  plan_type?: LicensePlanType;
  expires_at?: string | null;
  max_devices?: number;
  max_concurrent_streams?: number;
  allow_user_manage_sources?: boolean;
  notes?: string | null;
};

type LicenseDetailsField =
  | 'label'
  | 'plan_type'
  | 'expires_at'
  | 'max_devices'
  | 'max_concurrent_streams'
  | 'allow_user_manage_sources'
  | 'notes';

type LicenseDetails = Record<LicenseDetailsField, string | number | boolean | null>;

const allowedPlanTypes = new Set<LicensePlanType>([
  'monthly',
  'quarterly',
  'semiannual',
  'annual',
]);

const editableFields: LicenseDetailsField[] = [
  'label',
  'plan_type',
  'expires_at',
  'max_devices',
  'max_concurrent_streams',
  'allow_user_manage_sources',
  'notes',
];

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

function normalizeText(value?: string | null) {
  const normalized = value?.trim();

  return normalized ? normalized : null;
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get('Authorization') ?? '';
  const [scheme, token] = authorization.trim().split(/\s+/);

  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
}

function isAllowedPlanType(value: unknown): value is LicensePlanType {
  return typeof value === 'string' && allowedPlanTypes.has(value as LicensePlanType);
}

function getPositiveInteger(value: unknown) {
  if (!Number.isInteger(value) || Number(value) < 1) {
    return null;
  }

  return Number(value);
}

function normalizeOptionalTimestamp(value?: string | null) {
  const normalized = normalizeText(value);

  if (!normalized) {
    return null;
  }

  if (Number.isNaN(Date.parse(normalized))) {
    return null;
  }

  return normalized;
}

function canUpdateLicense({
  actorId,
  actorRole,
  ownerId,
}: {
  actorId: string;
  actorRole: AdminRole;
  ownerId: string | null;
}) {
  return actorRole === 'super_admin' || ownerId === actorId;
}

function getComparableValue(field: LicenseDetailsField, value: unknown) {
  if (field !== 'expires_at' || typeof value !== 'string') {
    return value;
  }

  const timestamp = Date.parse(value);

  return Number.isNaN(timestamp) ? value : timestamp;
}

function getChangedFields(
  previousValues: LicenseDetails,
  nextValues: LicenseDetails,
) {
  return editableFields.filter(
    (field) =>
      getComparableValue(field, previousValues[field]) !==
      getComparableValue(field, nextValues[field]),
  );
}

function pickChangedValues(values: LicenseDetails, changedFields: LicenseDetailsField[]) {
  return changedFields.reduce<Record<string, unknown>>((selectedValues, field) => {
    selectedValues[field] = values[field];
    return selectedValues;
  }, {});
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
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return jsonResponse({ ok: false, error: 'SERVER_ERROR' }, 500);
    }

    const bearerToken = getBearerToken(request);

    if (!bearerToken) {
      return jsonResponse({ ok: false, error: 'UNAUTHORIZED' }, 401);
    }

    const supabaseAuthClient = createClient(supabaseUrl, anonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      },
    });

    const {
      data: { user: actor },
      error: actorError,
    } = await supabaseAuthClient.auth.getUser();

    if (actorError || !actor) {
      return jsonResponse({ ok: false, error: 'UNAUTHORIZED' }, 401);
    }

    const { data: actorProfile, error: actorProfileError } =
      await supabaseAuthClient
        .from('admin_profiles')
        .select('id, email, role, is_active')
        .eq('id', actor.id)
        .eq('is_active', true)
        .maybeSingle();

    if (actorProfileError) {
      return jsonResponse(
        {
          ok: false,
          error: 'SERVER_ERROR',
          details: actorProfileError.message,
        },
        500,
      );
    }

    if (
      !actorProfile ||
      (actorProfile.role !== 'admin' && actorProfile.role !== 'super_admin')
    ) {
      return jsonResponse({ ok: false, error: 'FORBIDDEN' }, 403);
    }

    let payload: UpdateLicenseDetailsRequest;

    try {
      payload = (await request.json()) as UpdateLicenseDetailsRequest;
    } catch {
      return jsonResponse({ ok: false, error: 'INVALID_PAYLOAD' }, 400);
    }

    const licenseId = normalizeText(payload.licenseId);
    const label = normalizeText(payload.label);
    const expiresAt = normalizeOptionalTimestamp(payload.expires_at);
    const maxDevices = getPositiveInteger(payload.max_devices);
    const maxConcurrentStreams = getPositiveInteger(
      payload.max_concurrent_streams,
    );
    const notes = normalizeText(payload.notes);

    if (
      !licenseId ||
      !isAllowedPlanType(payload.plan_type) ||
      maxDevices === null ||
      maxConcurrentStreams === null ||
      typeof payload.allow_user_manage_sources !== 'boolean' ||
      (normalizeText(payload.expires_at) !== null && expiresAt === null)
    ) {
      return jsonResponse({ ok: false, error: 'INVALID_PAYLOAD' }, 400);
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: existingLicense, error: existingLicenseError } =
      await supabaseAdmin
        .from('licenses')
        .select('*')
        .eq('id', licenseId)
        .maybeSingle();

    if (existingLicenseError) {
      return jsonResponse(
        {
          ok: false,
          error: 'SERVER_ERROR',
          details: existingLicenseError.message,
        },
        500,
      );
    }

    if (!existingLicense) {
      return jsonResponse({ ok: false, error: 'LICENSE_NOT_FOUND' }, 404);
    }

    if (
      !canUpdateLicense({
        actorId: actor.id,
        actorRole: actorProfile.role as AdminRole,
        ownerId: existingLicense.admin_owner_id,
      })
    ) {
      return jsonResponse({ ok: false, error: 'FORBIDDEN' }, 403);
    }

    const nextValues: LicenseDetails = {
      label,
      plan_type: payload.plan_type,
      expires_at: expiresAt,
      max_devices: maxDevices,
      max_concurrent_streams: maxConcurrentStreams,
      allow_user_manage_sources: payload.allow_user_manage_sources,
      notes,
    };

    const previousValues: LicenseDetails = {
      label: existingLicense.label,
      plan_type: existingLicense.plan_type,
      expires_at: existingLicense.expires_at,
      max_devices: existingLicense.max_devices,
      max_concurrent_streams: existingLicense.max_concurrent_streams,
      allow_user_manage_sources: existingLicense.allow_user_manage_sources,
      notes: existingLicense.notes,
    };

    const changedFields = getChangedFields(previousValues, nextValues);

    if (changedFields.length === 0) {
      return jsonResponse({
        ok: true,
        license: existingLicense,
      });
    }

    const { data: updatedLicense, error: updateLicenseError } =
      await supabaseAdmin
        .from('licenses')
        .update({
          ...nextValues,
          updated_at: new Date().toISOString(),
        })
        .eq('id', licenseId)
        .select('*')
        .single();

    if (updateLicenseError) {
      return jsonResponse(
        {
          ok: false,
          error: 'LICENSE_DETAILS_UPDATE_FAILED',
          details: updateLicenseError.message,
        },
        500,
      );
    }

    await supabaseAdmin.from('audit_logs').insert({
      actor_id: actor.id,
      action: 'license_updated',
      entity: 'licenses',
      entity_id: updatedLicense.id,
      metadata: {
        licenseId: updatedLicense.id,
        licenseCode: updatedLicense.license_code,
        changedFields,
        previousValues: pickChangedValues(previousValues, changedFields),
        nextValues: pickChangedValues(nextValues, changedFields),
      },
    });

    return jsonResponse({
      ok: true,
      license: updatedLicense,
    });
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        error: 'SERVER_ERROR',
        details: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});
