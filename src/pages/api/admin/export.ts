// src/pages/api/admin/export.ts
// Export all leads as CSV.

import type { APIRoute } from 'astro';
import { createServerSupabase, supabaseConfigured } from '../../../lib/supabase';

export const prerender = false;

export const GET: APIRoute = async ({ cookies }) => {
  if (!supabaseConfigured()) return new Response('Supabase not configured', { status: 500 });

  const supabase = createServerSupabase(cookies);
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return new Response('Unauthorized', { status: 401 });

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return new Response(error.message, { status: 500 });

  // Build CSV
  const headers = ['created_at', 'name', 'email', 'phone', 'service', 'team_size', 'status', 'locale', 'goals', 'notes', 'source'];
  const rows = [headers.join(',')];

  for (const lead of (data || [])) {
    const row = headers.map(h => csvCell((lead as any)[h] ?? '')).join(',');
    rows.push(row);
  }

  await supabase.from('audit_log').insert({
    admin_email: session.user.email,
    action: 'export',
    metadata: { count: data?.length || 0 },
  });

  return new Response(rows.join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="leads-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
};

function csvCell(v: unknown): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}
