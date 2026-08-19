// src/lib/validation.ts
// Zod schemas for form validation + database inserts.
// Single source of truth — used by the API route, the React form, and the admin dashboard.

import { z } from 'zod';

// ----- Contact / Consultation form -----
export const ContactFormSchema = z.object({
  name: z.string().min(2, 'Please enter your name').max(100),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(8, 'Please enter a valid phone number').max(20),
  service: z.enum(['training', 'consultation', 'strategy'], {
    errorMap: () => ({ message: 'Please select a service' }),
  }),
  team_size: z.string().optional().nullable(),
  goals: z.string().min(10, 'Please tell us a bit more about your goals').max(2000),
  locale: z.enum(['en', 'zh']).default('en'),
  // Honeypot — bots fill this; humans never see it
  website: z.string().max(0, 'Bot detected').optional().or(z.literal('')),
});

export type ContactFormData = z.infer<typeof ContactFormSchema>;

// ----- Lead status (the CRM pipeline) -----
export const LEAD_STATUSES = [
  'new',           // Just submitted
  'contacted',     // You replied
  'qualified',     // Good fit, follow-up
  'booked',        // Cal.com booking made
  'completed',     // Training / consultation done
  'lost',          // Not a fit
  'won',           // Paid / completed training
] as const;
export type LeadStatus = typeof LEAD_STATUSES[number];

// ----- Database row (matches supabase/schema.sql) -----
export interface Lead {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  service: 'training' | 'consultation' | 'strategy';
  team_size: string | null;
  goals: string;
  status: LeadStatus;
  notes: string | null;
  locale: 'en' | 'zh';
  source: string | null;
}

// ----- Booking row -----
export interface Booking {
  id: string;
  created_at: string;
  lead_id: string | null;
  cal_booking_id: string;
  attendee_name: string;
  attendee_email: string;
  start_time: string;
  end_time: string;
  service: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  notes: string | null;
}

// ----- Audit log row (every admin action is recorded) -----
export interface AuditLog {
  id: string;
  created_at: string;
  admin_email: string;
  action: 'login' | 'logout' | 'view_lead' | 'update_lead' | 'delete_lead' | 'export';
  target_id: string | null;
  metadata: Record<string, unknown> | null;
}
