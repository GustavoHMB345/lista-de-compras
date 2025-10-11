-- Schema for shopping list backend (Postgres/Supabase)
-- Safe re-creation helpers
create extension if not exists pgcrypto;

-- USERS
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null check (position('@' in email) > 1),
  name text,
  avatar text,
  created_at timestamptz not null default now()
);
create index if not exists users_created_at_idx on public.users(created_at desc);

-- FAMILIES
create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references public.users(id) on delete cascade,
  join_code text unique,
  created_at timestamptz not null default now()
);
create index if not exists families_created_at_idx on public.families(created_at desc);
create index if not exists families_owner_idx on public.families(owner_id);

-- FAMILY MEMBERS
create table if not exists public.family_members (
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member')),
  joined_at timestamptz not null default now(),
  primary key (family_id, user_id)
);
create index if not exists family_members_user_idx on public.family_members(user_id);

-- LISTS
create table if not exists public.lists (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  name text not null,
  created_by uuid not null references public.users(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists lists_family_idx on public.lists(family_id);
create index if not exists lists_completed_idx on public.lists(completed_at);
create index if not exists lists_created_at_idx on public.lists(created_at desc);

-- LIST ITEMS
create table if not exists public.list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.lists(id) on delete cascade,
  name text not null,
  category text,
  qty numeric default 1 check (qty >= 0),
  unit text,
  price numeric,
  is_purchased boolean not null default false,
  purchased_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists list_items_list_idx on public.list_items(list_id);
create index if not exists list_items_purchased_idx on public.list_items(is_purchased, purchased_at);
create index if not exists list_items_created_at_idx on public.list_items(created_at desc);

-- PRICE SNAPSHOTS
create table if not exists public.item_price_snapshots (
  id uuid primary key default gen_random_uuid(),
  list_item_id uuid not null references public.list_items(id) on delete cascade,
  at timestamptz not null default now(),
  unit_price numeric not null check (unit_price >= 0),
  total_price numeric check (total_price >= 0)
);
create index if not exists snapshots_item_idx on public.item_price_snapshots(list_item_id);
create index if not exists snapshots_at_idx on public.item_price_snapshots(at desc);

-- AUDITS
create table if not exists public.audits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audits_created_at_idx on public.audits(created_at desc);
create index if not exists audits_entity_idx on public.audits(entity_type, entity_id);

-- Optional helpful views
create or replace view public.v_family_lists as
select l.*, f.owner_id
from public.lists l
join public.families f on f.id = l.family_id;

-- Completed mapping note: legacy archived -> set completed_at
-- Use a one-time migration to map old statuses if importing data.
