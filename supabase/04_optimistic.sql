-- Optimistic concurrency support
-- Add updated_at columns and triggers for automatic update timestamps

-- lists.updated_at
alter table public.lists add column if not exists updated_at timestamptz not null default now();

create or replace function public.tg_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger lists_set_updated
before update on public.lists
for each row execute function public.tg_set_updated_at();

-- list_items.updated_at
alter table public.list_items add column if not exists updated_at timestamptz not null default now();

create trigger list_items_set_updated
before update on public.list_items
for each row execute function public.tg_set_updated_at();

-- Optional: add updated_at indexes
create index if not exists lists_updated_idx on public.lists(updated_at desc);
create index if not exists list_items_updated_idx on public.list_items(updated_at desc);
