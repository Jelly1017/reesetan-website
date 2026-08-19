// src/pages/api/admin/leads/[id].ts
// PATCH (update status / notes) + DELETE a lead.
// Server-side: requires authenticated session, writes to audit_log.

import type { APIRoute } from 'astro';
import { createServerSupabase, supabaseConfigured } from '../../../../lib/supabase';
import { z } from 'zod';

export const prerender = false;

const UpdateSchema = z.object({
  status: z.enum(['new', 'contacted', 'qualified', 'booked', 'completed', 'lost', 'won']).optional(),
  notes: z.string().max(5000).optional().nullable(),
});

export const PATCH: APIRoute = async ({ request, params, cookies }) => {
  if (!supabaseConfigured()) return json({ ok: false, error: 'Supabase not configured' }, 500);

  const supabase = createServerSupabase(cookies);
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  const id = params.id;
  if (!id) return json({ ok: false, error: 'Missing id' }, 400);

  let body: unknown;
  try { body = await request.json(); } catch { return json({ ok: false, error: 'Invalid JSON' }, 400); }

  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return json({ ok: false, error: parsed.error.errors[0]?.message }, 400);

  // 1) Update lead
  const { data, error } = await supabase
    .from('leads')
    .update(parsed.data)
    .eq('id', id)
    .select('*')
    .single();

  if (error) return json({ ok: false, error: error.message }, 500);

  // 2) Audit log
  await supabase.from('audit_log').insert({
    admin_email: session.user.email,
    action: 'update_lead',
    target_id: id,
    metadata: parsed.data,
  });

  return json({ ok: true, lead: data });
};

export const DELETE: APIRoute = async ({ params, cookies }) => {
  if (!supabaseConfigured()) return json({ ok: false, error: 'Supabase not configured' }, 500);

  const supabase = createServerSupabase(cookies);
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  const id = params.id;
  if (!id) return json({ ok: false, error: 'Missing id' }, 400);

  const { error } = await supabase.from('leads').delete().eq('id', id);
  if (error) return json({ ok: false, error: error.message }, 500);

  await supabase.from('audit_log').insert({
    admin_email: session.user.email,
    action: 'delete_lead',
    target_id: id,
  });

  return json({ ok: true });
};

function json(body: unknown, status: number = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
