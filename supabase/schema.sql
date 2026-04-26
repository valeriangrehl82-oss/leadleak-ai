create extension if not exists pgcrypto;

create table if not exists public.audit_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  company_name text not null,
  industry text not null,
  contact_person text not null,
  phone text not null,
  email text not null,
  missed_calls_per_week integer,
  current_problem text,
  estimated_order_value_chf integer,
  estimated_monthly_potential_chf integer,
  status text not null default 'new'
);

create index if not exists audit_requests_created_at_idx
  on public.audit_requests (created_at desc);

create index if not exists audit_requests_industry_idx
  on public.audit_requests (industry);

create index if not exists audit_requests_status_idx
  on public.audit_requests (status);

alter table public.audit_requests enable row level security;

drop policy if exists "Allow public audit request inserts" on public.audit_requests;

create policy "Allow public audit request inserts"
  on public.audit_requests
  for insert
  to anon, authenticated
  with check (
    company_name is not null
    and industry is not null
    and contact_person is not null
    and phone is not null
    and email is not null
  );

drop policy if exists "Allow authenticated audit request reads" on public.audit_requests;

create policy "Allow authenticated audit request reads"
  on public.audit_requests
  for select
  to authenticated
  using (true);
