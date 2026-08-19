// src/pages/api/admin/logout.ts
// Logout endpoint.

import type { APIRoute } from 'astro';
import { createServerSupabase, supabaseConfigured } from '../../../lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ cookies }) => {
  if (!supabaseConfigured()) return new Response('OK', { status: 200 });

  const supabase = createServerSupabase(cookies);
  await supabase.auth.signOut();

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
