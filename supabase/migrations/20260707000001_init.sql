-- ============================================================================
-- EFG Dashboard — initial schema
-- Tables: clients, months, report_uploads, memberships
-- Visibility model:
--   internal users  -> everything
--   client users    -> only their own client rows; months only when Published
--   clients NEVER see report_uploads, drafts, or other clients (RLS-enforced)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Tables
-- ----------------------------------------------------------------------------

create table public.clients (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name          text not null,
  initials      text not null,
  industry      text,
  objective     text,
  manager       text,
  contact       text,
  contact_role  text,
  accent_colour text,
  logo_path     text, -- bucket-relative path in the public 'client-logos' bucket
  currency      text not null default 'AUD',
  created_at    timestamptz not null default now()
);

create table public.months (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references public.clients (id) on delete cascade,
  month         date not null, -- first day of the month
  status        text not null default 'Draft'
                  check (status in ('Draft', 'Approved', 'Published', 'Planned')),
  budget        numeric(12,2),
  target_cpl    numeric(8,2),
  days_in_month int,
  days_elapsed  int,
  report        jsonb,
  updated_at    timestamptz not null default now(),
  unique (client_id, month)
);

create table public.report_uploads (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references public.clients (id) on delete cascade,
  type         text not null
                 check (type in ('meta_dashboard', 'daily_tracker', 'ab_testing')),
  as_of        date not null,
  version      int not null,
  status       text not null default 'Current'
                 check (status in ('Current', 'Archived')),
  file_path    text, -- bucket-relative path in the private 'report-uploads' bucket
  summary      jsonb,
  prev_summary jsonb,
  uploaded_by  uuid references auth.users (id),
  uploaded_at  timestamptz not null default now(),
  unique (client_id, type, version)
);

create table public.memberships (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  client_id  uuid references public.clients (id) on delete cascade,
  role       text not null check (role in ('internal', 'client')),
  created_at timestamptz not null default now(),
  check (role = 'internal' or client_id is not null)
);

-- One membership per (user, client) for client users...
create unique index memberships_user_client_key
  on public.memberships (user_id, client_id)
  where client_id is not null;

-- ...and at most one client-less (internal) membership per user.
create unique index memberships_internal_user_key
  on public.memberships (user_id)
  where client_id is null;

-- ----------------------------------------------------------------------------
-- Helpful indexes
-- ----------------------------------------------------------------------------

create index months_client_id_month_idx
  on public.months (client_id, month desc);

create index report_uploads_client_type_status_idx
  on public.report_uploads (client_id, type, status);

create index memberships_user_id_idx
  on public.memberships (user_id);

-- ----------------------------------------------------------------------------
-- updated_at bookkeeping
-- ----------------------------------------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger months_set_updated_at
  before update on public.months
  for each row
  execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- RLS helper functions
-- SECURITY DEFINER so memberships policies can call them without recursing
-- into memberships' own RLS.
-- ----------------------------------------------------------------------------

create function public.is_internal()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from memberships
    where user_id = auth.uid()
      and role = 'internal'
  );
$$;

create function public.member_client_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select client_id
  from memberships
  where user_id = auth.uid()
    and role = 'client'
    and client_id is not null;
$$;

revoke execute on function public.is_internal() from public;
revoke execute on function public.member_client_ids() from public;
grant execute on function public.is_internal() to authenticated, anon, service_role;
grant execute on function public.member_client_ids() to authenticated, anon, service_role;

-- ----------------------------------------------------------------------------
-- Row Level Security
-- All policies are "to authenticated": anon gets nothing on any table.
-- ----------------------------------------------------------------------------

alter table public.clients enable row level security;
alter table public.months enable row level security;
alter table public.report_uploads enable row level security;
alter table public.memberships enable row level security;

-- clients ---------------------------------------------------------------------

create policy clients_select_internal_or_member
  on public.clients
  for select
  to authenticated
  using (
    public.is_internal()
    or id in (select public.member_client_ids())
  );

create policy clients_insert_internal_only
  on public.clients
  for insert
  to authenticated
  with check (public.is_internal());

create policy clients_update_internal_only
  on public.clients
  for update
  to authenticated
  using (public.is_internal())
  with check (public.is_internal());

create policy clients_delete_internal_only
  on public.clients
  for delete
  to authenticated
  using (public.is_internal());

-- months ----------------------------------------------------------------------
-- Client users only ever see Published months of their own client(s);
-- Draft / Approved / Planned months are invisible to them.

create policy months_select_internal_or_published_member
  on public.months
  for select
  to authenticated
  using (
    public.is_internal()
    or (
      status = 'Published'
      and client_id in (select public.member_client_ids())
    )
  );

create policy months_insert_internal_only
  on public.months
  for insert
  to authenticated
  with check (public.is_internal());

create policy months_update_internal_only
  on public.months
  for update
  to authenticated
  using (public.is_internal())
  with check (public.is_internal());

create policy months_delete_internal_only
  on public.months
  for delete
  to authenticated
  using (public.is_internal());

-- report_uploads ---------------------------------------------------------------
-- Internal only, in every direction. Client users can never read uploads.

create policy report_uploads_select_internal_only
  on public.report_uploads
  for select
  to authenticated
  using (public.is_internal());

create policy report_uploads_insert_internal_only
  on public.report_uploads
  for insert
  to authenticated
  with check (public.is_internal());

create policy report_uploads_update_internal_only
  on public.report_uploads
  for update
  to authenticated
  using (public.is_internal())
  with check (public.is_internal());

create policy report_uploads_delete_internal_only
  on public.report_uploads
  for delete
  to authenticated
  using (public.is_internal());

-- memberships ------------------------------------------------------------------
-- Users may read their own membership rows; only internal staff may write,
-- so a client login cannot grant itself internal status or extra clients.

create policy memberships_select_internal_or_own
  on public.memberships
  for select
  to authenticated
  using (
    public.is_internal()
    or user_id = auth.uid()
  );

create policy memberships_insert_internal_only
  on public.memberships
  for insert
  to authenticated
  with check (public.is_internal());

create policy memberships_update_internal_only
  on public.memberships
  for update
  to authenticated
  using (public.is_internal())
  with check (public.is_internal());

create policy memberships_delete_internal_only
  on public.memberships
  for delete
  to authenticated
  using (public.is_internal());

-- ----------------------------------------------------------------------------
-- Storage buckets + policies
-- ----------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values
  ('report-uploads', 'report-uploads', false),
  ('client-logos', 'client-logos', true)
on conflict (id) do nothing;

-- report-uploads (private): internal only, all operations.

create policy "report-uploads internal select"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'report-uploads' and public.is_internal());

create policy "report-uploads internal insert"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'report-uploads' and public.is_internal());

create policy "report-uploads internal update"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'report-uploads' and public.is_internal())
  with check (bucket_id = 'report-uploads' and public.is_internal());

create policy "report-uploads internal delete"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'report-uploads' and public.is_internal());

-- client-logos (public bucket: reads are served via the public flag; only
-- internal staff may write).

create policy "client-logos internal insert"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'client-logos' and public.is_internal());

create policy "client-logos internal update"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'client-logos' and public.is_internal())
  with check (bucket_id = 'client-logos' and public.is_internal());

create policy "client-logos internal delete"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'client-logos' and public.is_internal());

-- ----------------------------------------------------------------------------
-- Comments
-- ----------------------------------------------------------------------------

comment on table public.clients is
  'EFG clients. Visible to internal staff and to the client''s own users.';

comment on table public.months is
  'Per-client monthly reports/budgets. Clients only see rows with status = Published.';

comment on table public.report_uploads is
  'Raw report file uploads (meta_dashboard/daily_tracker/ab_testing). Internal only.';

comment on table public.memberships is
  'Maps auth.users to access: role internal (client_id null) sees all; role client is scoped to client_id.';
