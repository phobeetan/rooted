create table if not exists public.profiles (
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

create table if not exists public.investments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null,
  account_type text not null,
  symbol text not null,
  name text not null,
  asset_type text not null,
  value numeric not null default 0,
  allocation_percent numeric not null default 0,
  quantity numeric not null default 0,
  price numeric not null default 0,
  synced_at timestamptz not null default now(),
  unique (profile_id, provider, account_type, symbol)
);

alter table public.investments add column if not exists quantity numeric not null default 0;
alter table public.investments add column if not exists price numeric not null default 0;

create index if not exists investments_profile_id_idx on public.investments(profile_id);

alter table public.profiles disable row level security;
alter table public.investments disable row level security;

grant select, insert, update on public.profiles to anon, authenticated;
grant select, insert, update, delete on public.investments to anon, authenticated;
