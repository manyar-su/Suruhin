import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let browserClient: SupabaseClient | null | undefined;

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const [, payload] = token.split('.');
  if (!payload) {
    return null;
  }

  try {
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, '='));
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch (error) {
    console.error(error);
    return null;
  }
}

function assertPublishableSupabaseKey(key: string) {
  const trimmed = key.trim();
  const payload = decodeJwtPayload(trimmed);
  const role = typeof payload?.role === 'string' ? payload.role : null;

  if (trimmed.startsWith('sb_secret_') || role === 'service_role') {
    throw new Error('Supabase service_role key tidak boleh dipakai di frontend. Gunakan NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }
}

/**
 * MVP uses a browser anon client only. Supabase Auth can be wired later without exposing service_role.
 */
export function getSupabaseBrowserClient() {
  if (browserClient !== undefined) {
    return browserClient;
  }

  const url = import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    browserClient = null;
    return browserClient;
  }

  assertPublishableSupabaseKey(anonKey);

  browserClient = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return browserClient;
}
