# EFG Consulting · Client Portal

Multi-client Meta Ads reporting portal. Internal EFG staff ingest daily JSON
report exports, review each month's report, and publish it; clients sign in
and see **only their own published data**.

Built from the design handoff in [`handoff/`](handoff/README.md) — that README
is the product spec (screens, business rules, design tokens). The prototype
(`handoff/EFG Client Portal.dc.html`) is the pixel reference.

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind v4
- **Supabase**: Postgres, Auth (invite-only email+password), Storage, RLS
- Fonts self-hosted via `@fontsource` (Poppins + Lato)

## Setup

1. `npm install`
2. Copy `.env.example` → `.env.local` and fill in the Supabase values
   (dashboard → Project Settings → API). `SUPABASE_SERVICE_ROLE_KEY` is
   server-side only — it is used by the seed script and never shipped to the
   browser.
3. Apply the database schema (pick one):
   - `npx supabase link --project-ref <your-project-ref>` then
     `npx supabase db push`
   - or paste each file in `supabase/migrations/` into the dashboard SQL
     editor, in filename order, and run them.
4. Deploy the ingestion Edge Function (needed for "Add report"):
   `npx supabase functions deploy ingest-report`
5. Seed the demo dataset (3 clients, months, uploads → Storage):
   `npx tsx scripts/seed.ts` (re-runnable; reseeds from scratch).
6. `npm run dev`

`npm run test:ingest` runs the ingestion parsers against the three sample
exports in `handoff/uploads/` and asserts they reproduce the handoff's
stored summaries exactly.

### Developing without a database

`EFG_DEV_FIXTURES=1 npm run dev` renders the portal from the handoff dataset
(`handoff/report-data.js`) with auth bypassed — useful for UI work and
screenshot comparisons against the prototype. It refuses to activate in
production builds; never set it in a deployed environment.

### Creating logins

Users are invited, never self-registered. In the Supabase dashboard
(Authentication → Users → Add user), create the account, then link it in SQL:

```sql
-- internal EFG staff (sees every client, drafts included)
insert into public.memberships (user_id, role) values ('<auth-user-uuid>', 'internal');

-- client login (sees only their client's published months)
insert into public.memberships (user_id, client_id, role)
values ('<auth-user-uuid>', (select id from public.clients where slug = 'capital_transport'), 'client');
```

## Guarantees

Client isolation is enforced by **row-level security, not UI**: a client role
can only read its own `clients` row and its own `months` rows with
`status = 'Published'`. `report_uploads`, draft months, other clients, and the
raw files in Storage are invisible to client logins. See
`supabase/migrations/20260707000001_init.sql`.

## What's inside

All seven build phases of the handoff are implemented:

1. Supabase schema + RLS + auth (invite-only email/password)
2. App shell: top bar, sidebar, role gating, client/month switching,
   draft banner, view-as-client preview
3. Overview screen (pixel-faithful to `handoff/EFG Client Portal.dc.html`)
4. Ingestion: Add-report dialog → `ingest-report` Edge Function →
   versioning (Current/Archived + compare) → month upsert
5. Campaigns, Budget (incl. month planning), Daily Tracker, A/B Testing,
   Actions, Creative, Reports screens
6. Admin workspace: pipeline, review desk (Draft › Approved › Published),
   client settings (details, swatches, budget history, uploads, deletes)
7. Print/PDF export, responsive layouts, empty states, toasts,
   two-step delete confirms

## Repo layout

- `src/` — Next.js app (App Router; `src/proxy.ts` is the session guard)
- `supabase/migrations/` — schema + RLS
- `scripts/seed.ts` — reseed from `handoff/report-data.js`
- `handoff/` — design handoff bundle (spec, prototype, sample exports)
