import { supabase } from '../../../lib/supabase/supabaseClient';

import type { AdminProfile, AdminRole } from '../types/admin.types';

export interface CreateAdminUserInput {
  email: string;
  password: string;
  role: AdminRole;
}

export interface CreateAdminUserResponse {
  ok: boolean;
  adminUser?: AdminProfile;
  error?: string;
  details?: string;
}

export async function listAdminUsers(): Promise<AdminProfile[]> {
  const { data, error } = await supabase
    .from('admin_profiles')
    .select('id, email, role, is_active, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as AdminProfile[];
}

export async function createAdminUser(
  input: CreateAdminUserInput,
): Promise<AdminProfile> {
  const { data, error } = await supabase.functions.invoke<CreateAdminUserResponse>(
    'create-admin-user',
    {
      body: {
        email: input.email,
        password: input.password,
        role: input.role,
      },
    },
  );

  if (error) {
    throw error;
  }

  if (!data?.ok || !data.adminUser) {
    throw new Error(data?.error ?? 'CREATE_ADMIN_USER_FAILED');
  }

  return data.adminUser;
}
