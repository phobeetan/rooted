drop table if exists public.profiles;

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  password text not null,
  name text not null default '',
  birthday date,
  occupation text not null default '',
  salary numeric not null default 0,
  monthly_spending numeric not null default 0,
  goals text not null default '',
  financial_knowledge text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz
);

alter table public.profiles disable row level security;

grant select, insert, update on public.profiles to anon, authenticated;
