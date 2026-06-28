-- ─────────────────────────────────────────
-- Vincula o usuário do Auth a public.users (necessário p/ registrar venda:
-- sales.registered_by referencia users.id). Resolve o UUID pelo e-mail.
-- Rode no SQL Editor. Idempotente.
-- ─────────────────────────────────────────
insert into public.users (id, name, role)
select id, 'Pedro', 'admin'
from auth.users
where email = 'pedros@ufcspa.edu.br'
on conflict (id) do update
  set name = excluded.name, role = excluded.role, active = true;

select id, name, role, active from public.users;
