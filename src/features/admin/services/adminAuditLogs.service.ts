import { supabase } from '../../../lib/supabase/supabaseClient';

import type { AuditLog } from '../types/admin.types';

export interface CreateAuditLogInput {
  action: string;
  entity: string;
  entity_id?: string | null;
  metadata?: Record<string, unknown>;
}

export async function listAdminAuditLogs(): Promise<AuditLog[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as AuditLog[];
}

export async function createAdminAuditLog(input: CreateAuditLogInput): Promise<AuditLog> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  const { data, error } = await supabase
    .from('audit_logs')
    .insert({
      actor_id: user?.id ?? null,
      action: input.action,
      entity: input.entity,
      entity_id: input.entity_id ?? null,
      metadata: input.metadata ?? {},
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as AuditLog;
}
