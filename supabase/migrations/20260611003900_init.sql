-- ─────────────────────────────────────────
-- AUTH EXTENSION
-- ─────────────────────────────────────────

create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role text not null check (role in ('admin', 'volunteer', 'cashier')),
  active bool default true,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- LOOKUP TABLES
-- ─────────────────────────────────────────

create table tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text not null,
  bg_color text not null,
  created_at timestamptz default now()
);

create table payment_methods (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  label text not null,
  active bool default true
);

create table banks (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  type text not null check (type in ('pix', 'card', 'cash')),
  active bool default true
);

create table item_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  type text not null check (type in ('sale', 'donation', 'both')),
  active bool default true
);

create table cash_origins (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  active bool default true
);

-- ─────────────────────────────────────────
-- SUPPORTERS
-- ─────────────────────────────────────────

create table supporters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  cpf text unique,
  birthday text,
  created_at timestamptz default now()
);

-- customers são supporters que compraram no brechó.
-- supporter_id nullable: permite cadastro de compradora avulsa sem vínculo com apoiador.
create table customers (
  id uuid primary key default gen_random_uuid(),
  supporter_id uuid references supporters(id) on delete set null,
  member_since int,
  purchase_count int default 0,
  total_spent numeric default 0,
  last_purchase_at timestamptz,
  created_at timestamptz default now()
);

create table customer_tags (
  customer_id uuid references customers(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (customer_id, tag_id)
);

-- ─────────────────────────────────────────
-- SALES
-- ─────────────────────────────────────────

create table sales (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete set null,
  -- customer_name desnormalizado intencionalmente: preserva histórico se customer for deletado
  customer_name text not null default 'Cliente avulso',
  payment_method_id uuid references payment_methods(id) on delete set null,
  bank_id uuid references banks(id) on delete set null,
  installments int check (installments > 0),
  -- net_amount calculado e persistido no insert para evitar recalcular em cada query
  net_amount numeric,
  confirmed bool default false,
  registered_by uuid references users(id) on delete set null,
  sold_at timestamptz default now(),
  created_at timestamptz default now()
);

create table sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid references sales(id) on delete cascade,
  category_id uuid references item_categories(id) on delete set null,
  -- category_name desnormalizado: preserva histórico se category for deletada
  category_name text,
  amount numeric not null check (amount > 0),
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- DONATIONS
-- ─────────────────────────────────────────

create table donations_cash (
  id uuid primary key default gen_random_uuid(),
  supporter_id uuid references supporters(id) on delete set null,
  -- donor_name/phone desnormalizados: preserva histórico se supporter for desvinculado
  donor_name text not null,
  donor_phone text,
  amount numeric not null check (amount > 0),
  origin_id uuid references cash_origins(id) on delete set null,
  frequency text not null check (frequency in ('one_time', 'monthly')),
  donated_at timestamptz not null,
  notes text,
  registered_by uuid references users(id) on delete set null,
  created_at timestamptz default now()
);

create table donations_items (
  id uuid primary key default gen_random_uuid(),
  supporter_id uuid references supporters(id) on delete set null,
  donor_name text not null,
  donor_phone text,
  category_id uuid references item_categories(id) on delete set null,
  category_name text,
  quantity int check (quantity > 0),
  condition text check (condition in ('good', 'needs_review')),
  destination text check (destination in ('stock', 'direct')),
  notes text,
  registered_by uuid references users(id) on delete set null,
  donated_at timestamptz not null,
  created_at timestamptz default now()
);

create table donations_caps (
  id uuid primary key default gen_random_uuid(),
  supporter_id uuid references supporters(id) on delete set null,
  donor_name text not null,
  donor_phone text,
  quantity int check (quantity > 0),
  weight_kg numeric check (weight_kg > 0),
  -- pelo menos um dos dois deve ser informado
  constraint caps_quantity_or_weight check (quantity is not null or weight_kg is not null),
  notes text,
  registered_by uuid references users(id) on delete set null,
  donated_at timestamptz not null,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────

create index idx_supporters_phone          on supporters (phone);
create index idx_supporters_cpf            on supporters (cpf);
create index idx_customers_supporter_id    on customers (supporter_id);
create index idx_sales_customer_id         on sales (customer_id);
create index idx_sales_sold_at             on sales (sold_at desc);
create index idx_sale_items_sale_id        on sale_items (sale_id);
create index idx_donations_cash_supporter  on donations_cash (supporter_id);
create index idx_donations_cash_donated_at on donations_cash (donated_at desc);
create index idx_donations_items_supporter on donations_items (supporter_id);
create index idx_donations_caps_supporter  on donations_caps (supporter_id);

-- ─────────────────────────────────────────
-- FUNCTION: register_sale
-- Insere venda + itens + atualiza stats do customer atomicamente.
-- Chamada pela Server Action registerSale em vez de múltiplos inserts separados.
-- p_net_amount: calculado no front com base na forma de pagamento (taxa de cartão etc.)
-- ─────────────────────────────────────────

create or replace function register_sale(
  p_customer_id       uuid,
  p_customer_name     text,
  p_payment_method_id uuid,
  p_bank_id           uuid,
  p_installments      int,
  p_net_amount        numeric,
  p_registered_by     uuid,
  p_sold_at           timestamptz,
  p_items             jsonb  -- [{category_id, category_name, amount}]
)
returns uuid
language plpgsql
as $$
declare
  v_sale_id uuid;
  v_item    jsonb;
begin
  insert into sales (
    customer_id, customer_name, payment_method_id, bank_id,
    installments, net_amount, registered_by, sold_at
  ) values (
    p_customer_id, p_customer_name, p_payment_method_id, p_bank_id,
    p_installments, p_net_amount, p_registered_by, p_sold_at
  )
  returning id into v_sale_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    insert into sale_items (sale_id, category_id, category_name, amount)
    values (
      v_sale_id,
      (v_item->>'category_id')::uuid,
      v_item->>'category_name',
      (v_item->>'amount')::numeric
    );
  end loop;

  if p_customer_id is not null then
    update customers set
      purchase_count   = purchase_count + 1,
      total_spent      = total_spent + (select sum((e->>'amount')::numeric) from jsonb_array_elements(p_items) e),
      last_purchase_at = p_sold_at
    where id = p_customer_id;
  end if;

  return v_sale_id;
end;
$$;

-- ─────────────────────────────────────────
-- VIEWS (usadas pelo front como fonte de dados flat)
-- ─────────────────────────────────────────

-- Customer flat: join customers + supporters + tags agregadas como array de strings
create or replace view customers_view as
select
  c.id,
  c.supporter_id,
  coalesce(s.name, '')     as name,
  coalesce(s.phone, '')    as phone,
  coalesce(s.birthday, '') as birthday,
  c.member_since,
  c.purchase_count,
  c.total_spent,
  c.last_purchase_at,
  c.created_at,
  array_remove(array_agg(t.name), null) as tags
from customers c
left join supporters s on s.id = c.supporter_id
left join customer_tags ct on ct.customer_id = c.id
left join tags t on t.id = ct.tag_id
group by c.id, s.name, s.phone, s.birthday;

-- Sale flat: join sales + payment_methods + banks + total e categoria agregados de sale_items
create or replace view sales_view as
select
  s.id,
  s.customer_id,
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

-- DonationCash flat: join donations_cash + cash_origins
create or replace view donations_cash_view as
select
  d.id,
  d.supporter_id,
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

-- ─────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────

alter table users           enable row level security;
alter table tags             enable row level security;
alter table payment_methods  enable row level security;
alter table banks            enable row level security;
alter table item_categories  enable row level security;
alter table cash_origins     enable row level security;
alter table supporters       enable row level security;
alter table customers        enable row level security;
alter table customer_tags    enable row level security;
alter table sales            enable row level security;
alter table sale_items       enable row level security;
alter table donations_cash   enable row level security;
alter table donations_items  enable row level security;
alter table donations_caps   enable row level security;

-- helper: role do usuário autenticado
create or replace function auth_role()
returns text
language sql stable
as $$ select role from users where id = auth.uid() $$;

-- Leitura: qualquer usuário autenticado ativo
create policy "authenticated read"
  on users for select
  using (auth.role() = 'authenticated');

create policy "authenticated read" on tags             for select using (auth.role() = 'authenticated');
create policy "authenticated read" on payment_methods  for select using (auth.role() = 'authenticated');
create policy "authenticated read" on banks            for select using (auth.role() = 'authenticated');
create policy "authenticated read" on item_categories  for select using (auth.role() = 'authenticated');
create policy "authenticated read" on cash_origins     for select using (auth.role() = 'authenticated');
create policy "authenticated read" on supporters       for select using (auth.role() = 'authenticated');
create policy "authenticated read" on customers        for select using (auth.role() = 'authenticated');
create policy "authenticated read" on customer_tags    for select using (auth.role() = 'authenticated');
create policy "authenticated read" on sales            for select using (auth.role() = 'authenticated');
create policy "authenticated read" on sale_items       for select using (auth.role() = 'authenticated');
create policy "authenticated read" on donations_cash   for select using (auth.role() = 'authenticated');
create policy "authenticated read" on donations_items  for select using (auth.role() = 'authenticated');
create policy "authenticated read" on donations_caps   for select using (auth.role() = 'authenticated');

-- Escrita em lookup tables: somente admin
create policy "admin write" on tags            for all using (auth_role() = 'admin');
create policy "admin write" on payment_methods for all using (auth_role() = 'admin');
create policy "admin write" on banks           for all using (auth_role() = 'admin');
create policy "admin write" on item_categories for all using (auth_role() = 'admin');
create policy "admin write" on cash_origins    for all using (auth_role() = 'admin');

-- Escrita em dados operacionais: autenticado (volunteer e cashier também registram)
create policy "authenticated write" on supporters     for all using (auth.role() = 'authenticated');
create policy "authenticated write" on customers      for all using (auth.role() = 'authenticated');
create policy "authenticated write" on customer_tags  for all using (auth.role() = 'authenticated');
create policy "authenticated write" on sales          for all using (auth.role() = 'authenticated');
create policy "authenticated write" on sale_items     for all using (auth.role() = 'authenticated');
create policy "authenticated write" on donations_cash  for all using (auth.role() = 'authenticated');
create policy "authenticated write" on donations_items for all using (auth.role() = 'authenticated');
create policy "authenticated write" on donations_caps  for all using (auth.role() = 'authenticated');

-- ─────────────────────────────────────────
-- SEED LOOKUP DATA
-- ─────────────────────────────────────────

insert into tags (name, color, bg_color) values
  ('familiar',   '#4B3A9B', '#E2DCF3'),
  ('voluntário', '#5C8A6E', '#DCEBE0'),
  ('brechó',     '#C97D3E', '#FBE3CA'),
  ('tampinha',   '#E25A8F', '#FDE7E7');

insert into payment_methods (name, label) values
  ('pix',     'PIX'),
  ('credit',  'Crédito'),
  ('debit',   'Débito'),
  ('cash',    'Dinheiro');

insert into banks (name, type) values
  ('PIX TON',    'pix'),
  ('PIX SICREDI','pix'),
  ('SICREDI',    'card'),
  ('PagSeguro',  'card'),
  ('Stone',      'card');

insert into item_categories (name, type) values
  ('blusa',     'both'),
  ('vestido',   'both'),
  ('calça',     'both'),
  ('saia',      'both'),
  ('jaqueta',   'both'),
  ('sapato',    'both'),
  ('acessório', 'both'),
  ('lenço',     'donation'),
  ('boné',      'donation'),
  ('chapéu',    'donation');

insert into cash_origins (name) values
  ('PIX'),
  ('Dinheiro'),
  ('Transferência'),
  ('Site'),
  ('Outro');

-- ─────────────────────────────────────────
-- USUÁRIO PADRÃO
-- Execute APÓS criar o usuário no painel Auth do Supabase.
-- Substitua <UUID_DO_USUARIO> pelo ID gerado no Auth.
-- ─────────────────────────────────────────
-- insert into users (id, name, role) values
--   ('<UUID_DO_USUARIO>', 'Flávia', 'admin');
