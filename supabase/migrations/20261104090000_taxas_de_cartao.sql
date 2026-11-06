-- US-32 · Taxas de cartão cadastradas pela coordenação
-- Taxa por maquininha, forma, à vista ou parcelado e, no débito da PagBank,
-- bandeira. Cada alteração é uma linha nova; a taxa em vigor é a mais recente.
-- Valores iniciais: os que a Nílian (coordenação) informou em 30/10/2026, com as
-- respostas de 03/11 (Pix na Sicredi sem taxa; Stone e PIX TON fora de uso).

-- ─────────────────────────────────────────
-- 1. Bancos: PagSeguro hoje é PagBank, e o Pix da PagBank ganha banco próprio.
--    Stone e PIX TON saem dos formulários (Nílian, 03/11); as vendas antigas
--    continuam apontando para eles. Não há tela de Configurações; o acerto vai aqui.
-- ─────────────────────────────────────────

update public.banks set name = 'PagBank' where name = 'PagSeguro';
insert into public.banks (name, type) values ('PIX PagBank', 'pix') on conflict (name) do nothing;
update public.banks set active = false where name in ('Stone', 'PIX TON');

-- ─────────────────────────────────────────
-- 2. Bandeira na venda. Só o débito da PagBank pede; nas outras, fica vazia.
-- ─────────────────────────────────────────

alter table public.sales
  add column if not exists card_brand text check (card_brand in ('visa_master', 'outras'));

-- ─────────────────────────────────────────
-- 3. Taxas. Ninguém altera nem apaga uma linha: alterar é cadastrar de novo.
-- ─────────────────────────────────────────

create table public.taxas_de_cartao (
  id           uuid primary key default gen_random_uuid(),
  bank_id      uuid not null references public.banks(id) on delete restrict,
  forma        text not null check (forma in ('pix', 'debit', 'credit')),
  parcelado    boolean not null default false,
  bandeira     text check (bandeira in ('visa_master', 'outras')),
  taxa         numeric(5,2) not null check (taxa >= 0 and taxa <= 20),
  definido_em  timestamptz not null default now(),
  definido_por uuid references public.users(id) on delete set null,
  check (forma = 'credit' or parcelado = false),
  check (bandeira is null or forma = 'debit')
);

create index idx_taxas_de_cartao_combinacao
  on public.taxas_de_cartao (bank_id, forma, parcelado, bandeira, definido_em desc);

-- Quem e quando vêm do banco, como no valor do atendimento (US-19).
create or replace function public.carimbar_taxa_de_cartao()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.definido_em := now();
  new.definido_por := auth.uid();
  return new;
end;
$$;

create trigger carimbo_da_taxa_de_cartao
  before insert on public.taxas_de_cartao
  for each row execute function public.carimbar_taxa_de_cartao();

-- A equipe lê (o caixa precisa da taxa ao registrar a venda); só a coordenação grava.
alter table public.taxas_de_cartao enable row level security;

create policy "equipe le" on public.taxas_de_cartao
  for select to authenticated using (public.eh_equipe());
create policy "coordenacao define" on public.taxas_de_cartao
  for insert to authenticated with check (public.eh_coordenacao());

revoke all on public.taxas_de_cartao from anon;

-- ─────────────────────────────────────────
-- 4. Taxa em vigor de cada combinação: a linha mais recente.
-- ─────────────────────────────────────────

create view public.taxas_em_vigor
with (security_invoker = true) as
select distinct on (t.bank_id, t.forma, t.parcelado, coalesce(t.bandeira, ''))
  t.id,
  t.bank_id,
  b.name as bank_name,
  t.forma,
  t.parcelado,
  t.bandeira,
  t.taxa,
  t.definido_em,
  t.definido_por
from public.taxas_de_cartao t
join public.banks b on b.id = t.bank_id
order by t.bank_id, t.forma, t.parcelado, coalesce(t.bandeira, ''), t.definido_em desc, t.id desc;

revoke all on public.taxas_em_vigor from anon;
grant select on public.taxas_em_vigor to authenticated;

-- ─────────────────────────────────────────
-- 5. Taxas informadas pela Nílian em 30/10, e o Pix na Sicredi sem taxa (03/11).
--    O Pix da PagBank fica com 0,19% até ela confirmar (pergunta em aberto).
--    Na carga, auth.uid() é nulo.
-- ─────────────────────────────────────────

insert into public.taxas_de_cartao (bank_id, forma, parcelado, bandeira, taxa)
select b.id, v.forma, v.parcelado, v.bandeira, v.taxa
from (values
  ('SICREDI',     'credit', false, null::text,    1.88),
  ('SICREDI',     'credit', true,  null::text,    2.07),
  ('SICREDI',     'debit',  false, null::text,    1.05),
  ('PIX SICREDI', 'pix',    false, null::text,    0.00),
  ('PIX PagBank', 'pix',    false, null::text,    0.19),
  ('PagBank',     'debit',  false, 'visa_master', 2.39),
  ('PagBank',     'debit',  false, 'outras',      2.98),
  ('PagBank',     'credit', false, null::text,    3.19),
  ('PagBank',     'credit', true,  null::text,    3.79)
) as v(banco, forma, parcelado, bandeira, taxa)
join public.banks b on b.name = v.banco;

-- ─────────────────────────────────────────
-- 6. register_sale grava a bandeira. Parâmetro novo no fim, com padrão, para
--    quem chama sem ele continuar funcionando. Mesmo corpo de antes, com os
--    nomes completos (search_path vazio). Continua sem security definer: a
--    inserção passa pelas políticas de quem chama (US-23 e US-28).
-- ─────────────────────────────────────────

drop function if exists public.register_sale(uuid, text, uuid, uuid, int, numeric, uuid, timestamptz, jsonb);

create function public.register_sale(
  p_client_id         uuid,
  p_customer_name     text,
  p_payment_method_id uuid,
  p_bank_id           uuid,
  p_installments      int,
  p_net_amount        numeric,
  p_registered_by     uuid,
  p_sold_at           timestamptz,
  p_items             jsonb,
  p_card_brand        text default null
) returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_sale_id uuid;
  v_item    jsonb;
begin
  insert into public.sales (client_id, customer_name, payment_method_id, bank_id, installments, net_amount, registered_by, sold_at, card_brand)
  values (p_client_id, p_customer_name, p_payment_method_id, p_bank_id, p_installments, p_net_amount, p_registered_by, p_sold_at, p_card_brand)
  returning id into v_sale_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    insert into public.sale_items (sale_id, category_id, category_name, amount)
    values (v_sale_id, (v_item->>'category_id')::uuid, v_item->>'category_name', (v_item->>'amount')::numeric);
  end loop;

  return v_sale_id;
end;
$$;

revoke execute on function public.register_sale(uuid, text, uuid, uuid, int, numeric, uuid, timestamptz, jsonb, text) from public, anon;
grant execute on function public.register_sale(uuid, text, uuid, uuid, int, numeric, uuid, timestamptz, jsonb, text) to authenticated;
