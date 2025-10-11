-- Analytics and helper SQL

-- Last price per list_item using snapshots fallback to current price
create or replace view public.v_list_item_last_price as
select
  li.id as list_item_id,
  coalesce(
    (select s.unit_price from public.item_price_snapshots s where s.list_item_id = li.id order by s.at desc limit 1),
    li.price
  ) as last_unit_price,
  coalesce(
    (select s.total_price from public.item_price_snapshots s where s.list_item_id = li.id order by s.at desc limit 1),
    (case when li.price is not null and li.qty is not null then li.price * li.qty end)
  ) as last_total_price
from public.list_items li;

-- Spend aggregation by scope and period
-- scope: 'user' or 'family'
-- period: 'weekly'|'monthly'|'yearly'
create or replace function public.get_spend(scope text, scope_id uuid, period text)
returns table(period_start date, total numeric)
language plpgsql
stable
as $$
begin
  return query
  with src as (
    select
      date_trunc(
        case period when 'weekly' then 'week' when 'monthly' then 'month' else 'year' end,
        coalesce(li.purchased_at, li.created_at)
      )::date as bucket,
      coalesce(
        (select s.total_price from public.item_price_snapshots s where s.list_item_id = li.id order by s.at desc limit 1),
        (case when li.price is not null and li.qty is not null then li.price * li.qty else 0 end)
      ) as spend
    from public.list_items li
    join public.lists l on l.id = li.list_id
    where
      case
        when scope = 'family' then l.family_id = scope_id
        when scope = 'user' then l.created_by = scope_id
        else false
      end
  )
  select bucket as period_start, sum(spend) as total
  from src
  group by bucket
  order by bucket asc;
end;
$$;
