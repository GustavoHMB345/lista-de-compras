-- Enable RLS and define policies for Supabase

alter table public.users enable row level security;
alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.lists enable row level security;
alter table public.list_items enable row level security;
alter table public.item_price_snapshots enable row level security;
alter table public.audits enable row level security;

-- Helper: Determine if auth.uid() is member of a family
create or replace function public.is_family_member(fam_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.family_members fm
    where fm.family_id = fam_id
      and fm.user_id = auth.uid()
  );
$$;

-- Helper: Determine if auth.uid() is owner of a family
create or replace function public.is_family_owner(fam_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.families f
    where f.id = fam_id
      and f.owner_id = auth.uid()
  );
$$;

-- USERS: allow owners to see themselves; signup handled by Supabase Auth (public insert via edge function typically)
create policy if not exists users_select_self on public.users
for select using ( id = auth.uid() );

create policy if not exists users_update_self on public.users
for update using ( id = auth.uid() );

-- FAMILIES: only members can select
create policy if not exists families_select_members on public.families
for select using ( public.is_family_member(id) );

-- Allow insert if the user is creating a new family (owner = auth.uid())
create policy if not exists families_insert_owner on public.families
for insert with check ( owner_id = auth.uid() );

-- Allow update/delete for owner only
create policy if not exists families_update_owner on public.families
for update using ( public.is_family_owner(id) );

create policy if not exists families_delete_owner on public.families
for delete using ( public.is_family_owner(id) );

-- FAMILY MEMBERS: members can select members of families they belong to
create policy if not exists family_members_select on public.family_members
for select using ( public.is_family_member(family_id) );

-- Only owner can add or remove members
create policy if not exists family_members_insert_owner on public.family_members
for insert with check ( public.is_family_owner(family_id) );

create policy if not exists family_members_delete_owner on public.family_members
for delete using ( public.is_family_owner(family_id) );

-- LISTS: members can fully manage lists under their family
create policy if not exists lists_select on public.lists
for select using ( public.is_family_member(family_id) );

create policy if not exists lists_insert on public.lists
for insert with check ( public.is_family_member(family_id) );

create policy if not exists lists_update on public.lists
for update using ( public.is_family_member(family_id) );

create policy if not exists lists_delete on public.lists
for delete using ( public.is_family_member(family_id) );

-- LIST ITEMS: members can fully manage items via lists' family
create policy if not exists list_items_select on public.list_items
for select using (
  public.is_family_member((select l.family_id from public.lists l where l.id = list_id))
);

create policy if not exists list_items_insert on public.list_items
for insert with check (
  public.is_family_member((select l.family_id from public.lists l where l.id = list_id))
);

create policy if not exists list_items_update on public.list_items
for update using (
  public.is_family_member((select l.family_id from public.lists l where l.id = list_id))
);

create policy if not exists list_items_delete on public.list_items
for delete using (
  public.is_family_member((select l.family_id from public.lists l where l.id = list_id))
);

-- SNAPSHOTS: members can manage snapshots for items under their lists
create policy if not exists snapshots_select on public.item_price_snapshots
for select using (
  public.is_family_member((
    select l.family_id
    from public.list_items li
    join public.lists l on l.id = li.list_id
    where li.id = list_item_id
  ))
);

create policy if not exists snapshots_insert on public.item_price_snapshots
for insert with check (
  public.is_family_member((
    select l.family_id
    from public.list_items li
    join public.lists l on l.id = li.list_id
    where li.id = list_item_id
  ))
);

-- AUDITS: allow user to read their own audit entries
create policy if not exists audits_select_self on public.audits
for select using ( user_id = auth.uid() );
