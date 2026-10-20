-- Arrange: Analytics database functions
-- Created: 20 October 2026

-- ==========================================
-- 1. Overall analytics summary
-- ==========================================


create or replace function public.get_analytics_summary()
returns table (
  total_revenue numeric,
  total_cost_of_sales numeric,
  total_profit numeric,
  items_sold bigint,
  profit_margin numeric,
  items_in_stock bigint,
  stock_cost_value numeric,
  potential_revenue numeric,
  potential_profit numeric,
  unpriced_items bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  with sales_summary as (
    select
      coalesce(sum(s.sale_price), 0) as revenue,
      coalesce(sum(i.cost), 0) as cost_of_sales,
      count(*) as sold_count
    from public.sales s
    join public.inventory_items i
      on i.id = s.inventory_item_id
  ),
  stock_summary as (
    select
      count(*) as stock_count,
      coalesce(sum(i.cost), 0) as stock_cost,
      coalesce(sum(i.asking_price), 0) as asking_total,
      count(*) filter (
        where i.asking_price is null
      ) as missing_prices
    from public.inventory_items i
    where not exists (
      select 1
      from public.sales s
      where s.inventory_item_id = i.id
    )
  )
  select
    ss.revenue,
    ss.cost_of_sales,
    ss.revenue - ss.cost_of_sales,
    ss.sold_count,
    case
      when ss.revenue > 0 then
        round(
          ((ss.revenue - ss.cost_of_sales)
            / ss.revenue) * 100,
          1
        )
      else 0
    end,
    st.stock_count,
    st.stock_cost,
    st.asking_total,
    st.asking_total - st.stock_cost,
    st.missing_prices
  from sales_summary ss
  cross join stock_summary st;
$$;

revoke all on function public.get_analytics_summary()
from public, anon;

grant execute on function public.get_analytics_summary()
to authenticated;



-- ==========================================
-- 2. Monthly analytics
-- ==========================================

create or replace function public.get_monthly_analytics()
returns table (
  month text,
  revenue numeric,
  cost numeric,
  profit numeric,
  items_sold bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  with months as (
    select generate_series(
      date_trunc('month', current_date)::date
        - interval '11 months',
      date_trunc('month', current_date)::date,
      interval '1 month'
    )::date as month_start
  ),
  monthly_sales as (
    select
      date_trunc('month', s.sold_date)::date as month_start,
      sum(s.sale_price) as revenue,
      sum(i.cost) as cost,
      count(*) as items_sold
    from public.sales s
    join public.inventory_items i
      on i.id = s.inventory_item_id
    where s.sold_date >=
      date_trunc('month', current_date)
        - interval '11 months'
      and s.sold_date <
        date_trunc('month', current_date)
          + interval '1 month'
    group by 1
  )
  select
    to_char(m.month_start, 'YYYY-MM') as month,
    coalesce(ms.revenue, 0) as revenue,
    coalesce(ms.cost, 0) as cost,
    coalesce(ms.revenue, 0)
      - coalesce(ms.cost, 0) as profit,
    coalesce(ms.items_sold, 0) as items_sold
  from months m
  left join monthly_sales ms
    on ms.month_start = m.month_start
  order by m.month_start;
$$;

revoke all on function public.get_monthly_analytics()
from public, anon;

grant execute on function public.get_monthly_analytics()
to authenticated;
