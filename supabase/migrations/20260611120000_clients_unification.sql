-- ─────────────────────────────────────────
-- UNIFICAÇÃO: supporters + customers → clients
-- ─────────────────────────────────────────

-- Drop objetos dependentes do modelo antigo
drop view if exists customers_view;
drop view if exists sales_view;           -- depende de sales.customer_id; recriada no fim com client_id
drop view if exists donations_cash_view;  -- depende de donations_cash.supporter_id; recriada no fim com client_id
drop function if exists register_sale(uuid,text,uuid,uuid,int,numeric,uuid,timestamptz,jsonb);

-- Tabela clients (substitui supporters + customers) — criar ANTES das FKs
create table if not exists clients (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  phone        text,
  email        text,
  cpf          text unique,
  birthday     text,
  member_since int,
  notes        text,
  created_at   timestamptz default now()
);

create table if not exists client_tags (
  client_id uuid references clients(id) on delete cascade,
  tag_id    uuid references tags(id)    on delete cascade,
  primary key (client_id, tag_id)
);

-- Religar FKs: remover vínculos antigos, adicionar client_id
alter table sales            drop column if exists customer_id;
alter table sales            add column if not exists client_id uuid references clients(id) on delete set null;
alter table donations_cash   drop column if exists supporter_id;
alter table donations_cash   add column if not exists client_id uuid references clients(id) on delete set null;
alter table donations_items  drop column if exists supporter_id;
alter table donations_items  add column if not exists client_id uuid references clients(id) on delete set null;
alter table donations_caps   drop column if exists supporter_id;
alter table donations_caps   add column if not exists client_id uuid references clients(id) on delete set null;

-- Drop tabelas antigas (depois de soltar as FKs)
drop table if exists customer_tags;
drop table if exists customers;
drop table if exists supporters;

-- Índices
create index if not exists idx_clients_phone    on clients (phone);
create index if not exists idx_clients_cpf      on clients (cpf);
create index if not exists idx_sales_client_id  on sales (client_id);
create index if not exists idx_dcash_client_id  on donations_cash (client_id);
create index if not exists idx_ditems_client_id on donations_items (client_id);
create index if not exists idx_dcaps_client_id  on donations_caps (client_id);

-- register_sale: grava client_id, sem update de stats (clients_view calcula)
create or replace function register_sale(
  p_client_id         uuid,
  p_customer_name     text,
  p_payment_method_id uuid,
  p_bank_id           uuid,
  p_installments      int,
  p_net_amount        numeric,
  p_registered_by     uuid,
  p_sold_at           timestamptz,
  p_items             jsonb
) returns uuid language plpgsql as $$
declare
  v_sale_id uuid;
  v_item    jsonb;
begin
  insert into sales (client_id, customer_name, payment_method_id, bank_id, installments, net_amount, registered_by, sold_at)
  values (p_client_id, p_customer_name, p_payment_method_id, p_bank_id, p_installments, p_net_amount, p_registered_by, p_sold_at)
  returning id into v_sale_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    insert into sale_items (sale_id, category_id, category_name, amount)
    values (v_sale_id, (v_item->>'category_id')::uuid, v_item->>'category_name', (v_item->>'amount')::numeric);
  end loop;

  return v_sale_id;
end; $$;

-- clients_view: agregados via subqueries escalares (evita dupla contagem)
create or replace view clients_view as
select
  c.id, c.name, c.phone, c.email, c.birthday, c.member_since, c.notes, c.created_at,
  coalesce(array_remove(array_agg(distinct t.name), null), '{}') as tags,
  (select count(*) from sales s where s.client_id = c.id) as purchase_count,
  coalesce((select sum(si.amount) from sale_items si join sales s on s.id = si.sale_id where s.client_id = c.id), 0) as total_spent,
  (select max(s.sold_at) from sales s where s.client_id = c.id) as last_purchase_at,
  (select count(*) from donations_cash dc where dc.client_id = c.id)
   + (select count(*) from donations_items di where di.client_id = c.id)
   + (select count(*) from donations_caps dp where dp.client_id = c.id) as donation_count,
  coalesce((select sum(dc.amount) from donations_cash dc where dc.client_id = c.id), 0) as donation_total,
  greatest(
    (select max(dc.donated_at) from donations_cash dc where dc.client_id = c.id),
    (select max(di.donated_at) from donations_items di where di.client_id = c.id),
    (select max(dp.donated_at) from donations_caps dp where dp.client_id = c.id)
  ) as last_donation_at
from clients c
left join client_tags ct on ct.client_id = c.id
left join tags t on t.id = ct.tag_id
group by c.id;

-- Recriar sales_view apontando client_id (era customer_id)
create or replace view sales_view as
select
  s.id,
  s.client_id,
  s.customer_name,
  s.installments,
  s.net_amount,
  s.confirmed,
  s.registered_by,
  s.sold_at,
  s.created_at,
  to_char(s.sold_at at time zone 'America/Sao_Paulo', 'HH24:MI') as time,
  pm.name as payment_method,
  b.name  as bank,
  coalesce(sum(si.amount), 0) as amount,
  coalesce(
    string_agg(coalesce(si.category_name, ic.name), ', ' order by si.created_at),
    ''
  ) as category
from sales s
left join payment_methods pm on pm.id = s.payment_method_id
left join banks b on b.id = s.bank_id
left join sale_items si on si.sale_id = s.id
left join item_categories ic on ic.id = si.category_id
group by s.id, pm.name, b.name;

-- Recriar donations_cash_view apontando client_id (era supporter_id)
create or replace view donations_cash_view as
select
  d.id,
  d.client_id,
  d.donor_name,
  d.donor_phone,
  d.amount,
  d.frequency,
  d.donated_at,
  d.notes,
  d.registered_by,
  d.created_at,
  coalesce(o.name, '') as origin
from donations_cash d
left join cash_origins o on o.id = d.origin_id;

-- RLS
alter table clients     enable row level security;
alter table client_tags enable row level security;
create policy "authenticated read"  on clients     for select using (auth.role() = 'authenticated');
create policy "authenticated write" on clients     for all    using (auth.role() = 'authenticated');
create policy "authenticated read"  on client_tags for select using (auth.role() = 'authenticated');
create policy "authenticated write" on client_tags for all    using (auth.role() = 'authenticated');
