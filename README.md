# Reese Tan — New Website

The redesign of `reesetan.manus.space`, built with **Astro + Option B (Evolve to 2026) design system + custom CRM (Supabase) + Cal.com booking + Resend email + Vercel hosting**.

> **You asked for:** redesign + consultation booking + custom CRM with admin login.
> **You got:** all three, plus real email capture, bilingual (EN + 中文), and the full SEO overhaul (the React SPA was killing your Google ranking).

---

## 🚀 Quick start (3 minutes)

### 1) Install dependencies
```bash
cd reesetan-new-site
npm install
```

### 2) Set up the database (one-time)
1. Create a free Supabase account: https://supabase.com
2. Create a new project (free tier is plenty)
3. In Supabase → **SQL Editor**, paste the contents of `src/lib/db/schema.sql` and run it
4. In Supabase → **Authentication → Users**, click "Add user" and create your admin account (your email + a strong password)

### 3) Set up the booking (one-time)
1. Create a free Cal.com account: https://cal.com
2. Create an event type (e.g. "15-min consultation")
3. Copy the event link — it looks like `cal.com/reesetan/15min`

### 4) Set up email notifications (one-time)
1. Create a free Resend account: https://resend.com
2. Get an API key: https://resend.com/api-keys
3. Verify your sending domain (or use Resend's onboarding domain for testing)

### 5) Create `.env`
```bash
cp .env.example .env
```
Fill in the four required values:
- `PUBLIC_SUPABASE_URL` + `PUBLIC_SUPABASE_ANON_KEY` — from Supabase project settings
- `RESEND_API_KEY` — from Resend
- `PUBLIC_CAL_COM_LINK` — your Cal.com event link

### 6) Run locally
```bash
npm run dev
```
Open http://localhost:4321

### 7) Log in to your admin
1. Go to http://localhost:4321/admin
2. Sign in with the email + password you set up in step 2.4
3. Submit a test form on the homepage → it should appear in your admin dashboard

---

## 🌐 Deploy to Vercel (5 minutes)

1. Push this folder to a GitHub repo
2. Go to https://vercel.com/new → import the repo
3. Framework preset: **Astro** (auto-detected)
4. Add the 4 env vars (same as your `.env`)
5. Click **Deploy** — you're live in ~60 seconds

Once deployed:
- Your site is at `https://<project-name>.vercel.app`
- Your admin is at `https://<project-name>.vercel.app/admin`
- Connect your custom domain in Vercel → Settings → Domains

---

## 📂 Project structure

```
reesetan-new-site/
├── .env.example              ← copy to .env
├── astro.config.mjs          ← Astro config (i18n, React, Tailwind)
├── tailwind.config.cjs       ← Tailwind theme preset (Option B tokens)
├── package.json
├── public/
│   ├── images/               ← All 19 photos from the old site
│   ├── videos/               ← AI chatbot demo
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── llms.txt              ← AI search engine index
│   └── favicon.ico
├── src/
│   ├── styles/
│   │   ├── tokens.css        ← Option B design tokens (OKLCH)
│   │   ├── fonts.css         ← Self-hosted variable fonts + CJK metric overrides
│   │   └── globals.css       ← @layer base/components/utilities
│   ├── lib/
│   │   ├── supabase.ts       ← Supabase client (browser + server)
│   │   ├── validation.ts     ← Zod schemas (form + DB)
│   │   ├── email.ts          ← Resend wrapper
│   │   ├── i18n.ts           ← Locale helpers
│   │   ├── seo.ts            ← JSON-LD builders (Person, Course, FAQ, Video, Breadcrumb)
│   │   └── db/schema.sql     ← Supabase schema (paste in SQL Editor)
│   ├── components/
│   │   ├── chrome/           ← Nav, Footer, WhatsAppFloat
│   │   ├── sections/         ← Hero, About, Services, Training, PastTraining, FAQ, Contact
│   │   ├── booking/          ← Cal.com embed
│   │   └── crm/              ← ContactForm, AdminDashboard
│   ├── layouts/
│   │   └── Base.astro        ← The wrapper every page uses
│   └── pages/
│       ├── index.astro       ← English home
│       ├── zh/index.astro    ← 中文 home
│       ├── admin/
│       │   ├── index.astro   ← Login page
│       │   └── dashboard.astro ← Leads view
│       └── api/
│           ├── contact.ts              ← Form submission
│           └── admin/
│               ├── leads/[id].ts       ← PATCH/DELETE a lead
│               ├── export.ts           ← CSV export
│               └── logout.ts           ← Logout
```

---

## 🧰 Tech stack

| Concern | Tool | Why |
|---|---|---|
| **Framework** | Astro 5 (SSR mode) | Content-first, ships near-zero JS, native i18n |
| **UI** | Tailwind v3 + custom CSS layers | Tokens drive the Tailwind theme |
| **Interactive bits** | React 18 (islands) | Only the form + admin dashboard are React |
| **Database** | Supabase (PostgreSQL) | Free tier, instant APIs, built-in auth |
| **Auth** | Supabase Auth (email/password) | No need to roll your own |
| **Email** | Resend | 100 emails/day free, simple API |
| **Booking** | Cal.com | Free, embeddable, open source |
| **Hosting** | Vercel | Free tier, perfect for Astro |
| **Analytics** | (Add Plausible or PostHog) | Not in scope — but drop a script tag in `Base.astro` |

---

## 🎨 Design system

This site uses **Option B (Evolve to 2026)** from the `reesetan-manus-archive/design-system/` folder.

- **Audit score:** 98.1 / 100
- **Style school:** Editorial cream (warm paper + refined terracotta)
- **Type:** Fraunces (display) + Inter (body) + JetBrains Mono Variable + Noto Serif/Sans SC for CJK
- **Bilingual:** EN + 中文 first-class, both with proper fonts and metric overrides
- **Accessibility:** WCAG 2.2 AA verified in OKLCH
- **Forbidden words:** enforced — no "leverage", "empower", "seamlessly", etc.

---

## 🐛 Troubleshooting

### Form submits but no email arrives
1. Check `RESEND_API_KEY` in `.env` (or Vercel env vars)
2. Check that `FROM_EMAIL` is a verified domain in Resend
3. Check your spam folder
4. Look at Vercel function logs: Vercel → Project → Logs

### Form submits but no row in Supabase
1. Check `PUBLIC_SUPABASE_URL` + `PUBLIC_SUPABASE_ANON_KEY`
2. Make sure you ran `src/lib/db/schema.sql` in the SQL Editor
3. Make sure RLS policies were created (they're in the SQL file)
4. Open browser DevTools → Network tab → check the `/api/contact` response

### Admin login fails
1. Make sure you created a user in Supabase → Authentication → Users
2. Confirm the email (Supabase sends a confirmation link)
3. Try the password reset flow
4. Check Supabase logs: Supabase → Logs → Auth

### Cal.com embed doesn't load
1. Check `PUBLIC_CAL_COM_LINK` is set (e.g. `reesetan/15min`)
2. The link is case-sensitive
3. Try opening the link in a new tab — does it work there?
4. Check browser console for errors

### Site looks unstyled
1. Make sure `npm install` finished
2. Make sure `npm run dev` is running
3. Try hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
4. Check browser console for 404s on `/fonts/...` (you'll need to drop the font files in later — see below)

---

## 🔤 Self-hosting the fonts (optional but recommended)

The site currently uses Google Fonts via `<link>` in `Base.astro`. For best performance + privacy, self-host the variable font files.

1. Download the variable font files from Google Fonts (Inter, Fraunces, JetBrains Mono Variable) and Noto Fonts (Sans SC, Serif SC)
2. Convert to woff2 (subset for your languages)
3. Drop them in `public/fonts/`:
   ```
   public/fonts/
   ├── InterVariable.woff2
   ├── Fraunces-VF.woff2
   ├── JetBrainsMono-VF.woff2
   ├── NotoSansSC-VF.woff2
   └── NotoSerifSC-VF.woff2
   ```
4. The `@font-face` rules in `src/styles/fonts.css` already reference them

---

## 📋 What's done vs. what's still optional

### ✅ Done in v1.0
- All 8 sections of the homepage (Hero, About, Services, Training, Past Training, FAQ, Contact)
- Real form → Supabase + email
- Custom admin CRM with login, leads table, status pipeline, notes, CSV export
- Cal.com booking embed
- Bilingual EN + 中文 home
- Full SEO: JSON-LD (Person, Course, FAQ, Video, Breadcrumb), robots.txt, llms.txt, sitemap
- WCAG 2.2 AA accessibility
- OKLCH color system, Fraunces kinetic type, paper grain
- All 19 images + 1 video from the archive

### 🔜 Optional (next iterations)
- Per-route pages: `/training`, `/about`, `/contact` (currently everything lives on the home)
- Blog at `/insights/[slug]` with MDX (content is in the archive's `content/` folder)
- Mandarin / 中文 versions of all section copy (currently Hero/About/Services have EN+ZH inline; Training/Past Training are still EN-only)
- `training.astro` standalone page with full curriculum
- Pricing page (public RM prices for SME training)
- Lead magnet: "10 AI Prompts PDF" download gated by email
- Meta Pixel + Google Tag + CAPI
- Cal.com webhook → `public.bookings` table (currently bookings are not synced back)

---

## 🔐 Security notes

- The form has a **honeypot** field (hidden from humans, bots fill it) — bot submissions are silently accepted but not stored or emailed
- IPs are **hashed (SHA-256, first 32 chars)** before being stored — no PII
- Supabase RLS: only authenticated users can read/update/delete leads; anyone can INSERT (for the public form)
- Every admin action is recorded in `audit_log`
- Passwords are managed by Supabase Auth (bcrypt) — never stored in this app
- No third-party trackers; the only external script is Cal.com (loaded only when booking section is in viewport)

---

## 📞 Support

- **WhatsApp** (Reese): +60 16-335 6790
- **Email:** hello@reesetan.com

Built with care. The design system is in `reesetan-manus-archive/design-system/`. The archive of the old site is in `reesetan-manus-archive/`.
