-- =============================================================================
-- REESE TAN — CRM DATABASE SCHEMA
-- Run this once in your Supabase SQL Editor (supabase.com/dashboard).
-- Project: https://supabase.com/dashboard/project/_/sql
-- =============================================================================

-- 1) LEADS — every form submission lands here
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Form data
  name text not null,
  email text not null,
  phone text not null,
  service text not null check (service in ('training', 'consultation', 'strategy')),
  team_size text,
  goals text not null,
  locale text not null default 'en' check (locale in ('en', 'zh')),

  -- CRM pipeline
  status text not null default 'new' check (status in (
    'new', 'contacted', 'qualified', 'booked', 'completed', 'lost', 'won'
  )),
  notes text,
  source text,
  ip_hash text,                 -- hashed IP for spam detection (no PII)
  user_agent text,

  -- Indexes
  constraint leads_email_idx unique (email, created_at)
);
create index if not exists leads_status_idx on public.leads (status, created_at desc);
create index if not exists leads_email_idx on public.leads (email);

-- 2) BOOKINGS — synced from Cal.com webhook
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lead_id uuid references public.leads(id) on delete set null,
  cal_booking_id text unique not null,  -- Cal.com UID
  attendee_name text not null,
  attendee_email text not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  service text not null,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled', 'completed')),
  notes text
);
create index if not exists bookings_email_idx on public.bookings (attendee_email);
create index if not exists bookings_start_idx on public.bookings (start_time);

-- 3) AUDIT LOG — every admin action is recorded
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  admin_email text not null,
  action text not null check (action in ('login', 'logout', 'view_lead', 'update_lead', 'delete_lead', 'export')),
  target_id text,
  metadata jsonb
);

-- 4) UPDATED_AT trigger for leads
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY — only authenticated admins can read/write
-- =============================================================================

alter table public.leads enable row level security;
alter table public.bookings enable row level security;
alter table public.audit_log enable row level security;

-- Allow anyone (anon) to INSERT a lead — that's the public form
create policy "Anyone can submit a lead"
  on public.leads for insert
  to anon, authenticated
  with check (true);

-- Only authenticated users (the admin) can read/update/delete leads
create policy "Admins can view all leads"
  on public.leads for select
  to authenticated
  using (true);

create policy "Admins can update leads"
  on public.leads for update
  to authenticated
  using (true)
  with check (true);

create policy "Admins can delete leads"
  on public.leads for delete
  to authenticated
  using (true);

-- Bookings: same — anyone can create (via webhook), only admin can read
create policy "Service role can insert bookings"
  on public.bookings for insert
  to service_role
  with check (true);

create policy "Admins can view bookings"
  on public.bookings for select
  to authenticated
  using (true);

-- Audit log: only insert, no public read
create policy "Admins can insert audit log"
  on public.audit_log for insert
  to authenticated
  with check (true);

create policy "Admins can view audit log"
  on public.audit_log for select
  to authenticated
  using (true);

-- =============================================================================
-- YOUR ADMIN ACCOUNT
-- After running this SQL:
--   1. Go to Supabase Dashboard > Authentication > Users
--   2. Click "Add user" > "Create new user"
--   3. Use your email + a strong password
--   4. Confirm the email
--   5. Then log in at /admin
-- =============================================================================
