# Chave secreta no build (SEC-06)

## O que é checado

- **Em todo `next build` e `next dev`** (`next.config.mjs`): nenhuma variável `NEXT_PUBLIC_` pode ter chave secreta do Supabase (`sb_secret_...`, ou chave antiga em formato JWT com o papel `service_role`). Vale na Vercel, na esteira e na máquina de cada pessoa.
- **Na esteira, depois do build:** nenhum arquivo de `.next/static` pode ter o formato de uma chave secreta (`sb_secret_` seguido de 20 ou mais caracteres).

## Por quê

Em 21/10 a variável `NEXT_PUBLIC_SUPABASE_ANON_KEY` de produção, na Vercel, recebeu uma chave secreta, que foi publicada no site. Registro completo no `PROGRESSO.md` da Sprint 4.

## Se o build falhar por isso

1. **Não** tire a checagem para o build passar.
2. Veja qual variável o erro aponta. Na Vercel: Settings, Environment Variables, nos ambientes Production e Preview.
3. Troque o valor pela chave **publicável** do projeto (Supabase, Project Settings, API Keys, `sb_publishable_...`).
4. Se a chave secreta chegou a ser publicada em algum deploy, trate como incidente: apague a chave no Supabase, crie outra se precisar e registre no `PROGRESSO.md` da sprint.
5. Faça um deploy novo e confira o login.

## Se a esteira falhar no passo "Nenhuma chave secreta nos arquivos do site"

O log mostra só o nome do arquivo. Procure no código uma chave escrita à mão (`grep -rn "sb_secret_" app components lib actions`), tire do código e, se a chave for real, apague-a no Supabase.

## Prova de bloqueio

Registrada no `PROGRESSO.md` da Sprint 5 (data, comando e resultado).