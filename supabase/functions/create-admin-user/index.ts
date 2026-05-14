import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type AdminRole = 'admin' | 'super_admin';

type CreateAdminUserRequest = {
  email?: string;
  password?: string;
  role?: AdminRole;
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

function normalizeEmail(value?: string | null) {
  const normalized = value?.trim().toLowerCase();
  return normalized ? normalized : null;
}

function normalizePassword(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function normalizeRole(value?: string | null): AdminRole {
  return value === 'super_admin' ? 'super_admin' : 'admin';
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get('Authorization') ?? '';
  const [scheme, token] = authorization.trim().split(/\s+/);

  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
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

    const { data: actorProfile, error: actorProfileError } = await supabaseAuthClient
      .from('admin_profiles')
      .select('id, email, role, is_active')
      .eq('id', actor.id)
      .eq('is_active', true)
      .maybeSingle();

    if (actorProfileError) {
      return jsonResponse({ ok: false, error: 'SERVER_ERROR', details: actorProfileError.message }, 500);
    }

    if (!actorProfile || actorProfile.role !== 'super_admin') {
      return jsonResponse({ ok: false, error: 'FORBIDDEN' }, 403);
    }

    let payload: CreateAdminUserRequest;

    try {
      payload = (await request.json()) as CreateAdminUserRequest;
    } catch {
      return jsonResponse({ ok: false, error: 'INVALID_PAYLOAD' }, 400);
    }

    const email = normalizeEmail(payload.email);
    const password = normalizePassword(payload.password);
    const role = normalizeRole(payload.role);

    if (!email || !password) {
      return jsonResponse({ ok: false, error: 'INVALID_PAYLOAD' }, 400);
    }

    if (password.length < 8) {
      return jsonResponse({ ok: false, error: 'WEAK_PASSWORD' }, 400);
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: createdAuthUser, error: createUserError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          role,
        },
      });

    if (createUserError || !createdAuthUser.user) {
      return jsonResponse({
        ok: false,
        error: 'AUTH_USER_CREATE_FAILED',
        details: createUserError?.message,
      }, 400);
    }

    const now = new Date().toISOString();

    const { data: adminProfile, error: profileError } = await supabaseAdmin
      .from('admin_profiles')
      .insert({
        id: createdAuthUser.user.id,
        email,
        role,
        is_active: true,
        created_by: actor.id,
        created_at: now,
        updated_at: now,
      })
      .select('id, email, role, is_active, created_at, updated_at')
      .single();

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(createdAuthUser.user.id);

      return jsonResponse({
        ok: false,
        error: 'ADMIN_PROFILE_CREATE_FAILED',
        details: profileError.message,
      }, 500);
    }

    await supabaseAdmin
      .from('audit_logs')
      .insert({
        actor_id: actor.id,
        action: 'admin_user_created',
        entity: 'admin_profiles',
        entity_id: adminProfile.id,
        metadata: {
          email,
          role,
        },
      });

    return jsonResponse({
      ok: true,
      adminUser: adminProfile,
    }, 201);
  } catch (error) {
    return jsonResponse({
      ok: false,
      error: 'SERVER_ERROR',
      details: error instanceof Error ? error.message : String(error),
    }, 500);
  }
});
