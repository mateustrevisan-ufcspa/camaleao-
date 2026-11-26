-- US-38 · Comissão nas vendas, com quem captou
-- O mesmo desenho da US-31: uma marcação por venda (teve ou não comissão, para
-- quem), o percentual em vigor gravado na marcação e o valor calculado sobre o
-- líquido. Só a coordenação.

create table public.comissoes_de_venda (
  id            uuid primary key default gen_random_uuid(),
  sale_id       uuid not null unique references public.sales(id) on delete cascade,
  teve_comissao boolean not null,
  captador_id   uuid references public.captadores(id) on delete restrict,
  percentual    numeric(5,2) check (percentual >= 0 and percentual <= 100),
  definido_em   timestamptz not null default now(),
  definido_por  uuid references public.users(id) on delete set null,
  constraint comissao_da_venda_com_quem_captou check (
    (teve_comissao and captador_id is not null) or (not teve_comissao and captador_id is null)
  )
);

create index idx_comissoes_de_venda_captador on public.comissoes_de_venda (captador_id);

-- Quem, quando e o percentual vêm do banco (a mesma função da US-31).
-- "carimbo" vem antes de "trilha" na ordem alfabética.
create trigger carimbo_da_comissao
  before insert or update on public.comissoes_de_venda
  for each row execute function public.carimbar_comissao();

create trigger trilha_de_auditoria before update or delete on public.comissoes_de_venda
  for each row execute function public.registrar_na_trilha();

alter table public.comissoes_de_venda enable row level security;

create policy "coordenacao le" on public.comissoes_de_venda
  for select to authenticated using (public.eh_coordenacao());
create policy "coordenacao marca" on public.comissoes_de_venda
  for insert to authenticated with check (public.eh_coordenacao());
create policy "coordenacao corrige" on public.comissoes_de_venda
  for update to authenticated using (public.eh_coordenacao()) with check (public.eh_coordenacao());
create policy "coordenacao desmarca" on public.comissoes_de_venda
  for delete to authenticated using (public.eh_coordenacao());

revoke all on public.comissoes_de_venda from anon;
grant select, insert, update, delete on public.comissoes_de_venda to authenticated;

-- Marcações com a venda, quem captou e o valor sobre o líquido. security_invoker:
-- só a coordenação recebe linhas, e a venda cancelada (US-04b) não aparece.
create view public.comissoes_de_venda_view
with (security_invoker = true) as
select
  k.id,
  k.sale_id,
  k.teve_comissao,
  k.captador_id,
  c.nome as captador_nome,
  k.percentual,
  case
    when k.teve_comissao and s.net_amount is not null and k.percentual is not null
      then round(s.net_amount * k.percentual / 100, 2)
  end as valor,
  k.definido_em,
  s.sold_at,
  s.customer_name,
  -- sales não tem coluna amount: o valor da venda é a soma dos itens (como na sales_view).
  coalesce((select sum(si.amount) from public.sale_items si where si.sale_id = s.id), 0) as amount,
  s.net_amount
from public.comissoes_de_venda k
left join public.captadores c on c.id = k.captador_id
join public.sales s on s.id = k.sale_id;

revoke all on public.comissoes_de_venda_view from anon;
grant select on public.comissoes_de_venda_view to authenticated;
