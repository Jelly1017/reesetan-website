// src/lib/supabase.ts
// Supabase client (browser + server). Used for the custom CRM admin.
// All keys come from environment variables — see .env.example.

import { createBrowserClient, createServerClient, type CookieOptions } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

/** Browser client (for /admin login + dashboard data fetching from React). */
export function createBrowserSupabase() {
  return createBrowserClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
}

/** Server client (for API routes, server-rendered pages). */
export function createServerSupabase(cookies: AstroCookies) {
  return createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        cookies.set(name, value, options);
      },
      remove(name: string, options: CookieOptions) {
        cookies.delete(name, options);
      },
    },
  });
}

/** Type guard — returns true if the env vars are present. */
export function supabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
