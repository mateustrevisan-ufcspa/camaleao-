-- ─────────────────────────────────────────
-- SEED LOCAL (só para o Supabase local em Docker; nunca rodar em projeto hospedado)
-- Aplicado automaticamente por `npx supabase start` e `npx supabase db reset`,
-- antes do seed-demo.sql (ordem em config.toml → [db.seed].sql_paths).
--
-- Cria a usuária de desenvolvimento usada no README e nos testes de fumaça:
--   e-mail: voluntaria@camaleao.local
--   senha:  camaleao-local
-- O banco local é descartável e só aceita conexão de 127.0.0.1, então esta
-- senha não dá acesso a nenhum dado do Instituto.
-- ─────────────────────────────────────────

do $$
declare
  uid uuid := '00000000-0000-4000-8000-000000000001';
  mail text := 'voluntaria@camaleao.local';
begin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token, email_change, email_change_token_new
  ) values (
    '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', mail,
    extensions.crypt('camaleao-local', extensions.gen_salt('bf')),
    now(), '{"provider":"email","providers":["email"]}', '{}',
    now(), now(),
    '', '', '', ''
  ) on conflict (id) do nothing;

  insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
  values (
    uid, uid, uid::text, 'email',
    jsonb_build_object('sub', uid::text, 'email', mail, 'email_verified', true),
    now(), now(), now()
  ) on conflict do nothing;

  insert into public.users (id, name, role)
  values (uid, 'Voluntária Local', 'admin')
  on conflict (id) do nothing;
end $$;
