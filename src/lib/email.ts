// src/lib/email.ts
// Resend wrapper for transactional email notifications.
// Used to email Reese when a new lead comes in, and to email the lead as confirmation.

import { Resend } from 'resend';
import type { ContactFormData } from './validation';

const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
const NOTIFY_EMAIL = import.meta.env.NOTIFY_EMAIL || 'reesetan@gmail.com';
const FROM_EMAIL = import.meta.env.FROM_EMAIL || 'Reese Tan <hello@reesetan.com>';

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

/** Send notification to Reese when a new lead comes in. */
export async function notifyNewLead(data: ContactFormData, leadId: string) {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set — skipping notification. Lead id:', leadId);
    return { skipped: true };
  }

  const serviceLabels: Record<ContactFormData['service'], string> = {
    training: 'SME / Corporate Training',
    consultation: 'Hourly Consultation',
    strategy: 'Digital Marketing Strategy Review',
  };

  try {
    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [NOTIFY_EMAIL],
      subject: `🆕 New ${serviceLabels[data.service]} inquiry from ${data.name}`,
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #c84a1a; margin: 0 0 16px;">New website lead</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #666; width: 120px;">Name</td><td style="padding: 8px 0; font-weight: 600;">${escapeHtml(data.name)}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0;"><a href="mailto:${data.email}">${escapeHtml(data.email)}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Phone</td><td style="padding: 8px 0;"><a href="https://wa.me/${data.phone.replace(/\D/g, '')}">${escapeHtml(data.phone)}</a> (WhatsApp)</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Service</td><td style="padding: 8px 0;">${serviceLabels[data.service]}</td></tr>
            ${data.team_size ? `<tr><td style="padding: 8px 0; color: #666;">Team size</td><td style="padding: 8px 0;">${escapeHtml(data.team_size)}</td></tr>` : ''}
          </table>
          <h3 style="margin-top: 24px;">Goals</h3>
          <p style="background: #f7f3ee; padding: 16px; border-radius: 8px; line-height: 1.6;">${escapeHtml(data.goals).replace(/\n/g, '<br>')}</p>
          <p style="margin-top: 24px; font-size: 12px; color: #999;">
            Lead ID: ${leadId} · Locale: ${data.locale} · Source: website form<br>
            View in admin: <a href="${import.meta.env.PUBLIC_SITE_URL || 'http://localhost:4321'}/admin">/admin</a>
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('[email] Failed to send notification:', error);
      return { error };
    }
    return { id: result?.id };
  } catch (err) {
    console.error('[email] Exception:', err);
    return { error: err };
  }
}

/** Send confirmation email to the person who submitted the form. */
export async function sendLeadConfirmation(data: ContactFormData) {
  if (!resend) return { skipped: true };

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [data.email],
      subject: data.locale === 'zh'
        ? '感谢您联系 Reese Tan — 我会尽快回复您'
        : 'Thanks for reaching out — I\'ll be in touch shortly',
      html: data.locale === 'zh' ? `
        <div style="font-family: 'Inter', 'Noto Sans SC', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
          <h2 style="color: #c84a1a; margin: 0 0 16px;">您好,${escapeHtml(data.name)}!</h2>
          <p>感谢您对 ${data.service === 'training' ? 'AI 培训' : data.service === 'consultation' ? '咨询服务' : '营销策略审核'} 的咨询。</p>
          <p>我会在 24 小时内通过 WhatsApp 或邮件与您联系,确认细节并安排时间。</p>
          <p>如果您赶时间,可以直接在 WhatsApp 上联系我:<br>
            <a href="https://wa.me/60163356790" style="display: inline-block; margin-top: 8px; padding: 12px 24px; background: #25D366; color: white; text-decoration: none; border-radius: 999px; font-weight: 600;">+60 16-335 6790</a>
          </p>
          <p style="margin-top: 32px;">— Reese Tan<br><span style="color: #666;">AI Trainer · HRDC Accredited · LPPEH Approved</span></p>
        </div>
      ` : `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
          <h2 style="color: #c84a1a; margin: 0 0 16px;">Hi ${escapeHtml(data.name)}!</h2>
          <p>Thanks for your interest in ${data.service === 'training' ? 'AI training' : data.service === 'consultation' ? 'a consultation' : 'a marketing strategy review'}.</p>
          <p>I'll be in touch within 24 hours via WhatsApp or email to confirm the details and find a time that works.</p>
          <p>If you're in a hurry, message me directly on WhatsApp:<br>
            <a href="https://wa.me/60163356790" style="display: inline-block; margin-top: 8px; padding: 12px 24px; background: #25D366; color: white; text-decoration: none; border-radius: 999px; font-weight: 600;">+60 16-335 6790</a>
          </p>
          <p style="margin-top: 32px;">— Reese Tan<br><span style="color: #666;">AI Trainer · HRDC Accredited · LPPEH Approved</span></p>
        </div>
      `,
    });

    if (error) console.error('[email] Confirmation failed:', error);
    return { error };
  } catch (err) {
    console.error('[email] Exception:', err);
    return { error: err };
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
