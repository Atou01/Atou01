/**
 * Supabase client wrapper — usage opt-in.
 *
 * Si SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définis, on utilise
 * Supabase comme source de vérité. Sinon, on retombe sur les stores
 * in-memory (dev local, validation rapide).
 *
 * Service role uniquement côté serveur. Jamais exposé au client.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (cachedClient) return cachedClient;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  cachedClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedClient;
}

export function isSupabaseEnabled(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
