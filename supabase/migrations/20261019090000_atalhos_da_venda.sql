-- US-05 · Venda registrada em poucos toques
-- Atalhos com as combinações de categoria e valor mais vendidas.

-- ─────────────────────────────────────────
-- atalhos_da_venda: as combinações de categoria e valor que mais se repetem
-- nas últimas 300 peças vendidas.
--
-- security definer porque o balcão só enxerga as vendas lançadas hoje (US-23),
-- e de manhã a lista estaria vazia. Sai só categoria, valor e quantas vezes:
-- nenhuma pessoa, data ou forma de pagamento. Como a função passa por cima das
-- políticas, a primeira condição é public.eh_equipe(): sem perfil ativo, nada.
-- ─────────────────────────────────────────

create or replace function public.atalhos_da_venda(p_limite int default 8)
returns table (categoria text, valor numeric, vezes int)
language sql
stable
security definer
set search_path = ''
as $$
  with recentes as (
    select lower(btrim(si.category_name)) as categoria, si.amount as valor
    from public.sale_items si
    join public.sales s on s.id = si.sale_id
    where public.eh_equipe()
      and btrim(coalesce(si.category_name, '')) <> ''
    order by s.sold_at desc
    limit 300
  )
  select r.categoria, r.valor, count(*)::int as vezes
  from recentes r
  group by r.categoria, r.valor
  order by count(*) desc, r.categoria, r.valor
  limit least(greatest(coalesce(p_limite, 8), 1), 12)
$$;

revoke execute on function public.atalhos_da_venda(int) from public, anon;
grant  execute on function public.atalhos_da_venda(int) to authenticated;
