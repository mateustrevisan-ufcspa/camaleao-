-- ─────────────────────────────────────────
-- SEED LOCAL (só para o Supabase local em Docker; nunca rodar em projeto hospedado)
-- Aplicado automaticamente por `npx supabase start` e `npx supabase db reset`,
-- antes do seed-demo.sql (ordem em config.toml → [db.seed].sql_paths).
--
-- Cria uma usuária por perfil, todas com a senha camaleao-local:
--   voluntaria@camaleao.local  coordenação (admin), usada no README e nos testes de fumaça
--   balcao@camaleao.local      voluntária (volunteer)
--   caixa@camaleao.local       caixa (cashier)
--   desativada@camaleao.local  voluntária desativada (active = false)
-- O banco local é descartável e só aceita conexão de 127.0.0.1, então esta
-- senha não dá acesso a nenhum dado do Instituto.
-- ─────────────────────────────────────────

do $$
declare
  p record;
begin
  for p in
    select * from (values
      ('00000000-0000-4000-8000-000000000001'::uuid, 'voluntaria@camaleao.local', 'Coordenação Local', 'admin',     true),
      ('00000000-0000-4000-8000-000000000002'::uuid, 'balcao@camaleao.local',     'Voluntária Local',  'volunteer', true),
      ('00000000-0000-4000-8000-000000000003'::uuid, 'caixa@camaleao.local',      'Caixa Local',       'cashier',   true),
      ('00000000-0000-4000-8000-000000000004'::uuid, 'desativada@camaleao.local', 'Desativada Local',  'volunteer', false)
    ) as t(uid, mail, nome, papel, ativa)
  loop
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, recovery_token, email_change, email_change_token_new
    ) values (
      '00000000-0000-0000-0000-000000000000', p.uid, 'authenticated', 'authenticated', p.mail,
      extensions.crypt('camaleao-local', extensions.gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}', '{}',
      now(), now(),
      '', '', '', ''
    ) on conflict (id) do nothing;

    insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
    values (
      p.uid, p.uid, p.uid::text, 'email',
      jsonb_build_object('sub', p.uid::text, 'email', p.mail, 'email_verified', true),
      now(), now(), now()
    ) on conflict do nothing;

    insert into public.users (id, name, role, active)
    values (p.uid, p.nome, p.papel, p.ativa)
    on conflict (id) do nothing;
  end loop;
end $$;
