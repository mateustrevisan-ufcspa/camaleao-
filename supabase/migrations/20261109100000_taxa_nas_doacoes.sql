-- US-35 · Taxa da maquininha nas doações em dinheiro
-- A doação pode dizer por onde o dinheiro entrou (banco ou maquininha, forma e,
-- no débito da PagBank, bandeira). O banco de dados busca a taxa em vigor
-- (US-32), grava a taxa usada e calcula o líquido. Sem maquininha, líquido = valor.

-- ─────────────────────────────────────────
-- 1. Banco só de doação: a plataforma do site (Doação Solutions) não pode
--    aparecer na venda do brechó. Os bancos de hoje servem para as duas.
-- ─────────────────────────────────────────

alter table public.banks
  add column if not exists uso text not null default 'ambos' check (uso in ('vendas', 'doacoes', 'ambos'));

insert into public.banks (name, type, uso) values ('Doação Solutions', 'card', 'doacoes')
on conflict (name) do nothing;

-- ─────────────────────────────────────────
-- 2. Colunas novas na doação em dinheiro. A combinação segue as regras da
--    tabela de taxas: parcelado só no crédito, bandeira só no débito.
-- ─────────────────────────────────────────

alter table public.donations_cash
  add column if not exists bank_id    uuid references public.banks(id) on delete restrict,
  add column if not exists forma      text check (forma in ('pix', 'debit', 'credit')),
  add column if not exists parcelado  boolean not null default false,
  add column if not exists bandeira   text check (bandeira in ('visa_master', 'outras')),
  add column if not exists taxa       numeric(5,2),
  add column if not exists net_amount numeric;

alter table public.donations_cash
  add constraint donations_cash_forma_com_banco check ((bank_id is null) = (forma is null)),
  add constraint donations_cash_parcelado_no_credito check (forma = 'credit' or parcelado = false),
  add constraint donations_cash_bandeira_no_debito check (bandeira is null or forma = 'debit');

-- Doações de antes desta story: sem maquininha, líquido igual ao valor.
update public.donations_cash set net_amount = amount where bank_id is null and net_amount is null;

-- ─────────────────────────────────────────
-- 3. Líquido calculado pelo banco de dados. Quem chama não escolhe taxa nem
--    líquido. Sem security definer: a taxa é lida com as permissões de quem
--    registra (a equipe lê as taxas, US-32).
--    Nome do gatilho: os gatilhos before de donations_cash rodam em ordem
--    alfabética (exigir_motivo_na_correcao, US-04b; liquido_da_doacao, esta;
--    trilha_de_auditoria, SEC-04).
-- ─────────────────────────────────────────

create or replace function public.calcular_liquido_da_doacao()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.bank_id is null then
    new.forma := null;
    new.parcelado := false;
    new.bandeira := null;
    new.taxa := null;
  elsif tg_op = 'INSERT'
     or new.bank_id   is distinct from old.bank_id
     or new.forma     is distinct from old.forma
     or new.parcelado is distinct from old.parcelado
     or new.bandeira  is distinct from old.bandeira then
    select t.taxa into new.taxa
      from public.taxas_em_vigor t
     where t.bank_id = new.bank_id
       and t.forma = new.forma
       and t.parcelado = new.parcelado
       and coalesce(t.bandeira, '') = coalesce(new.bandeira, '');
    -- Sem linha: taxa fica nula ("taxa não cadastrada").
    if not found then
      new.taxa := null;
    end if;
  else
    -- Só o valor (ou outro campo) mudou: vale a taxa gravada no registro.
    new.taxa := old.taxa;
  end if;

  new.net_amount := case
    when new.bank_id is null then new.amount
    when new.taxa is null then null
    else round(new.amount * (1 - new.taxa / 100), 2)
  end;
  return new;
end;
$$;

create trigger liquido_da_doacao
  before insert or update on public.donations_cash
  for each row execute function public.calcular_liquido_da_doacao();

-- ─────────────────────────────────────────
-- 4. A view das doações em dinheiro passa a trazer maquininha, taxa e líquido.
--    Recriada, como na US-12 e na US-13, com security_invoker.
-- ─────────────────────────────────────────

drop view if exists public.donations_cash_view;
create view public.donations_cash_view
with (security_invoker = true) as
select
  d.id,
  d.client_id,
  d.donor_name,
  d.donor_phone,
  d.amount,
  d.frequency,
  d.donated_at,
  d.notes,
  d.created_at,
  coalesce(o.name, '') as origin,
  d.event_id,
  coalesce(e.name, '') as event_name,
  d.campaign_id,
  coalesce(c.name, '') as campaign_name,
  d.bank_id,
  coalesce(b.name, '') as bank_name,
  d.forma,
  d.parcelado,
  d.bandeira,
  d.taxa,
  d.net_amount
from public.donations_cash d
left join public.cash_origins o on o.id = d.origin_id
left join public.events e on e.id = d.event_id
left join public.campaigns c on c.id = d.campaign_id
left join public.banks b on b.id = d.bank_id;

revoke all on public.donations_cash_view from anon;
grant select on public.donations_cash_view to authenticated;
