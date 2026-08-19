// src/pages/api/contact.ts
// Form submission endpoint.
//   1. Validates payload with Zod
//   2. Inserts row into Supabase (public.leads) — anon INSERT is allowed by RLS
//   3. Sends notification email to Reese (Resend)
//   4. Sends confirmation email to the lead
//   5. Returns { ok: true, leadId }

import type { APIRoute } from 'astro';
import { ContactFormSchema } from '../../lib/validation';
import { notifyNewLead, sendLeadConfirmation } from '../../lib/email';
import { supabaseConfigured, createServerSupabase } from '../../lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  // Parse + validate
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: 'Invalid JSON' }, 400);
  }

  const parsed = ContactFormSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0];
    return jsonResponse({ ok: false, error: firstError?.message || 'Validation failed' }, 400);
  }

  const data = parsed.data;

  // Honeypot check — if filled, silently succeed but don't store
  if (data.website && data.website.length > 0) {
    return jsonResponse({ ok: true, leadId: 'bot-rejected' }, 200);
  }

  // Hash the IP for spam detection (no PII storage)
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
  const ipHash = await hashString(ip);

  // 1) Insert into Supabase
  let leadId: string | null = null;
  if (supabaseConfigured()) {
    try {
      const supabase = createServerSupabase(cookies);
      const { data: row, error } = await supabase
        .from('leads')
        .insert({
          name: data.name,
          email: data.email,
          phone: data.phone,
          service: data.service,
          team_size: data.team_size || null,
          goals: data.goals,
          locale: data.locale,
          source: 'website-form',
          ip_hash: ipHash,
          user_agent: request.headers.get('user-agent') || null,
        })
        .select('id')
        .single();

      if (error) {
        console.error('[contact] Supabase insert failed:', error);
        // Don't fail the request — still send emails
      } else {
        leadId = row?.id ?? null;
      }
    } catch (err) {
      console.error('[contact] Supabase exception:', err);
    }
  } else {
    console.warn('[contact] Supabase not configured — form will not be stored. Set PUBLIC_SUPABASE_URL + PUBLIC_SUPABASE_ANON_KEY in .env');
  }

  // 2) Notify Reese
  await notifyNewLead(data, leadId ?? 'no-id');

  // 3) Confirmation to lead
  await sendLeadConfirmation(data);

  return jsonResponse({ ok: true, leadId, redirect: '/thank-you' }, 200);
};

function jsonResponse(body: unknown, status: number = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}
