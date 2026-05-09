import { supabase } from '../../../lib/supabase/supabaseClient';

import type {
  License,
  LicenseDevice,
  LicenseIptvSource,
  LicensePlanType,
  LicenseStatus,
  PlaybackSession,
} from '../types/admin.types';

export interface CreateLicenseInput {
  license_code: string;
  label?: string | null;
  status?: LicenseStatus;
  plan_type?: LicensePlanType;
  expires_at?: string | null;
  max_devices?: number;
  max_concurrent_streams?: number;
  allow_user_manage_sources?: boolean;
  notes?: string | null;
}

export interface UpdateLicenseInput {
  label?: string | null;
  status?: LicenseStatus;
  plan_type?: LicensePlanType;
  expires_at?: string | null;
  max_devices?: number;
  max_concurrent_streams?: number;
  allow_user_manage_sources?: boolean;
  notes?: string | null;
}

export async function listAdminLicenses(): Promise<License[]> {
  const { data, error } = await supabase
    .from('licenses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as License[];
}

export async function createAdminLicense(input: CreateLicenseInput): Promise<License> {
  const { data, error } = await supabase
    .from('licenses')
    .insert({
      license_code: input.license_code.trim().toUpperCase(),
      label: input.label ?? null,
      status: input.status ?? 'active',
      plan_type: input.plan_type ?? 'monthly',
      expires_at: input.expires_at ?? null,
      max_devices: input.max_devices ?? 1,
      max_concurrent_streams: input.max_concurrent_streams ?? 1,
      allow_user_manage_sources: input.allow_user_manage_sources ?? true,
      notes: input.notes ?? null,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as License;
}

export async function updateAdminLicense(
  licenseId: string,
  input: UpdateLicenseInput,
): Promise<License> {
  const { data, error } = await supabase
    .from('licenses')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', licenseId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as License;
}

export async function listAdminLicenseDevices(licenseId: string): Promise<LicenseDevice[]> {
  const { data, error } = await supabase
    .from('license_devices')
    .select('*')
    .eq('license_id', licenseId)
    .order('last_seen_at', { ascending: false, nullsFirst: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as LicenseDevice[];
}

export async function listAdminLicenseIptvSources(
  licenseId: string,
): Promise<LicenseIptvSource[]> {
  const { data, error } = await supabase
    .from('license_iptv_sources')
    .select('*')
    .eq('license_id', licenseId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as LicenseIptvSource[];
}

export async function listAdminPlaybackSessions(
  licenseId: string,
): Promise<PlaybackSession[]> {
  const { data, error } = await supabase
    .from('playback_sessions')
    .select('*')
    .eq('license_id', licenseId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as PlaybackSession[];
}
