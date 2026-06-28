-- ─────────────────────────────────────────
-- RE-SEED DEMO (rodar APÓS 20260611120000_clients_unification.sql)
-- Preserva auth.users e public.users. Limpa só dados operacionais e recria
-- clientes + vendas + doações vinculados. Idempotente: pode rodar de novo.
-- ─────────────────────────────────────────

-- Lookups: garante que existem (no-op se já existirem)
insert into payment_methods (name, label) values
  ('pix','PIX'),('credit','Crédito'),('debit','Débito'),('cash','Dinheiro')
  on conflict (name) do nothing;

insert into banks (name, type) values
  ('PIX TON','pix'),('PIX SICREDI','pix'),('SICREDI','card'),('PagSeguro','card'),('Stone','card')
  on conflict (name) do nothing;

insert into item_categories (name, type) values
  ('blusa','both'),('vestido','both'),('calça','both'),('saia','both'),('jaqueta','both'),
  ('sapato','both'),('acessório','both'),('lenço','donation'),('boné','donation'),('chapéu','donation')
  on conflict (name) do nothing;

insert into cash_origins (name) values
  ('PIX'),('Dinheiro'),('Transferência'),('Site'),('Outro')
  on conflict (name) do nothing;

-- Tags neutras: garante set + remove gênero
insert into tags (name, color, bg_color) values
  ('familiar','#4B3A9B','#E2DCF3'),
  ('voluntário','#5C8A6E','#DCEBE0'),
  ('brechó','#C97D3E','#FBE3CA'),
  ('tampinha','#E25A8F','#FDE7E7')
  on conflict (name) do nothing;
-- 'voluntário' já garantido acima; remove variantes de gênero (cascata limpa client_tags)
delete from tags where name in ('voluntária', 'paciente');

do $$
declare
  u       uuid := (select id from users order by created_at limit 1);
  pix     uuid := (select id from payment_methods where name='pix');
  credit  uuid := (select id from payment_methods where name='credit');
  debit   uuid := (select id from payment_methods where name='debit');
  cash    uuid := (select id from payment_methods where name='cash');
  bpix    uuid := (select id from banks where name='PIX TON');
  bcard   uuid := (select id from banks where name='Stone');
  o_pix   uuid := (select id from cash_origins where name='PIX');
  o_din   uuid := (select id from cash_origins where name='Dinheiro');
  cli1 uuid; cli2 uuid; cli3 uuid; cli4 uuid; cli5 uuid; cli6 uuid; cli7 uuid; cli8 uuid;
begin
  -- Limpa só dados operacionais (NUNCA users/auth/lookups)
  delete from sale_items;
  delete from sales;
  delete from donations_cash;
  delete from donations_items;
  delete from donations_caps;
  delete from client_tags;
  delete from clients;

  -- Clientes
  insert into clients (name, phone, birthday, email, member_since) values
    ('Roberta Lima',         '(51) 99812-3344', '14/06', 'roberta@email.com', 2024) returning id into cli1;
  insert into clients (name, phone, birthday, email, member_since) values
    ('Mariana Fontes',       '(51) 99655-1102', '02/06', null,                2024) returning id into cli2;
  insert into clients (name, phone, birthday, email, member_since) values
    ('Cláudia Berthold',     '(51) 99431-7788', '21/03', null,                2025) returning id into cli3;
  insert into clients (name, phone, birthday, email, member_since) values
    ('Patrícia Nunes',       '(51) 99987-2210', '09/06', null,                2024) returning id into cli4;
  insert into clients (name, phone, birthday, email, member_since) values
    ('Helena Vasconcelos',   '(51) 99220-9090', '30/11', null,                2025) returning id into cli5;
  insert into clients (name, phone, birthday, email, member_since) values
    ('Sônia Maria Reis',     '(51) 99102-4567', '17/06', null,                2024) returning id into cli6;
  insert into clients (name, phone, birthday, email, member_since) values
    ('Daniela Krause',       '(51) 99388-1234', '05/01', null,                2025) returning id into cli7;
  insert into clients (name, phone, birthday, email, member_since) values
    ('Antônia Ferreira',     '(51) 99711-8899', '12/06', null,                2024) returning id into cli8;

  -- Tags dos clientes
  insert into client_tags (client_id, tag_id)
  select x.cid, t.id from (values
    (cli1,'brechó'), (cli2,'familiar'), (cli3,'voluntário'), (cli3,'brechó'),
    (cli4,'brechó'), (cli4,'tampinha'), (cli6,'familiar'), (cli8,'tampinha')
  ) as x(cid, tname) join tags t on t.name = x.tname;

  -- Vendas (via register_sale: insere venda + itens). Datas em BRT (-03).
  -- Meses anteriores (evolução mensal no relatório)
  perform register_sale(cli1, 'Roberta Lima',     pix,    bpix,  null, 90.00,  u, '2026-03-12 14:00-03', '[{"category_name":"blusa","amount":50},{"category_name":"saia","amount":40}]'::jsonb);
  perform register_sale(cli2, 'Mariana Fontes',   credit, bcard, 2,    127.40, u, '2026-03-20 16:30-03', '[{"category_name":"vestido","amount":130}]'::jsonb);
  perform register_sale(cli3, 'Cláudia Berthold', debit,  bcard, null, 58.85,  u, '2026-04-05 10:15-03', '[{"category_name":"jaqueta","amount":60}]'::jsonb);
  perform register_sale(cli4, 'Patrícia Nunes',   pix,    bpix,  null, 75.00,  u, '2026-04-22 11:00-03', '[{"category_name":"sapato","amount":75}]'::jsonb);
  perform register_sale(cli5, 'Helena Vasconcelos',cash,  null,  null, 35.00,  u, '2026-05-03 09:30-03', '[{"category_name":"acessório","amount":35}]'::jsonb);
  perform register_sale(cli6, 'Sônia Maria Reis', credit, bcard, 3,    215.60, u, '2026-05-18 15:45-03', '[{"category_name":"vestido","amount":120},{"category_name":"blusa","amount":100}]'::jsonb);
  perform register_sale(cli1, 'Roberta Lima',     pix,    bpix,  null, 48.00,  u, '2026-06-02 13:20-03', '[{"category_name":"blusa","amount":48}]'::jsonb);
  perform register_sale(cli7, 'Daniela Krause',   debit,  bcard, null, 88.40,  u, '2026-06-10 17:00-03', '[{"category_name":"calça","amount":90}]'::jsonb);
  -- Hoje (2026-06-28)
  perform register_sale(cli4, 'Patrícia Nunes',   pix,    bpix,  null, 65.00,  u, '2026-06-28 09:00-03', '[{"category_name":"saia","amount":65}]'::jsonb);
  perform register_sale(cli8, 'Antônia Ferreira', cash,   null,  null, 40.00,  u, '2026-06-28 11:30-03', '[{"category_name":"acessório","amount":40}]'::jsonb);
  perform register_sale(cli3, 'Cláudia Berthold', credit, bcard, 1,    156.80, u, '2026-06-28 14:15-03', '[{"category_name":"jaqueta","amount":160}]'::jsonb);
  perform register_sale(null, 'Cliente avulso',   pix,    bpix,  null, 30.00,  u, '2026-06-28 16:40-03', '[{"category_name":"blusa","amount":30}]'::jsonb);

  -- Doações em dinheiro
  insert into donations_cash (client_id, donor_name, donor_phone, amount, origin_id, frequency, donated_at, registered_by) values
    (cli1, 'Roberta Lima',   '(51) 99812-3344', 100.00, o_pix, 'monthly',  '2026-04-01 10:00-03', u),
    (cli2, 'Mariana Fontes', '(51) 99655-1102', 50.00,  o_din, 'one_time', '2026-05-10 12:00-03', u),
    (cli6, 'Sônia Maria Reis','(51) 99102-4567',250.00, o_pix, 'one_time', '2026-06-15 09:00-03', u),
    (null, 'Empresa Helmuth Ltda', null,        480.00, o_pix, 'monthly',  '2026-06-20 14:00-03', u);

  -- Doações de itens
  insert into donations_items (client_id, donor_name, donor_phone, category_id, category_name, quantity, condition, destination, donated_at, registered_by) values
    (cli3, 'Cláudia Berthold','(51) 99431-7788', (select id from item_categories where name='blusa'), 'blusa', 8, 'good',         'stock',  '2026-05-22 10:00-03', u),
    (cli5, 'Helena Vasconcelos','(51) 99220-9090',(select id from item_categories where name='lenço'),'lenço', 3, 'needs_review','direct', '2026-06-12 11:00-03', u);

  -- Doações de tampinhas
  insert into donations_caps (client_id, donor_name, donor_phone, quantity, weight_kg, donated_at, registered_by) values
    (cli4, 'Patrícia Nunes',  '(51) 99987-2210', 1200, 4.5, '2026-06-05 10:00-03', u),
    (cli8, 'Antônia Ferreira','(51) 99711-8899', 3400, 12.0,'2026-06-25 16:00-03', u);
end $$;

-- Conferência rápida
select 'clients' as t, count(*) from clients
union all select 'sales', count(*) from sales
union all select 'donations_cash', count(*) from donations_cash
union all select 'donations_items', count(*) from donations_items
union all select 'donations_caps', count(*) from donations_caps
union all select 'users (preservados)', count(*) from users;
