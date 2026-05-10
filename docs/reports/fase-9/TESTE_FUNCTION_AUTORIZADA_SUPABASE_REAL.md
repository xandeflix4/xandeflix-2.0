# Teste real — Edge Function get-authorized-iptv-source

## Objetivo

Validar no Supabase real o fluxo autorizado de IPTV.

Fluxo esperado:

1. usuário autenticado no app;
2. dispositivo com device_identifier cadastrado no admin;
3. cliente ativo e não expirado;
4. fonte IPTV ativa vinculada ao cliente;
5. Edge Function retorna apenas a fonte autorizada, sem importar/cachear canais.

## Pré-condições

No Supabase real, devem existir:

- um usuário autenticável no Auth;
- um registro em clients com status active e expires_at nulo ou futuro;
- um registro em devices com client_id apontando para o cliente;
- o registro em devices deve ter device_identifier igual ao gerado pelo app;
- o registro em devices deve ter is_active true;
- um registro em iptv_sources com client_id apontando para o cliente;
- o registro em iptv_sources deve ter is_active true;
- o registro em iptv_sources deve ter source_url preenchido.

## Deploy da function

Com o projeto Supabase linkado, execute:

    supabase functions deploy get-authorized-iptv-source

## Como obter o token de sessão

Use o access_token da sessão Supabase do app logado.

## Teste via curl

Substitua SUPABASE_URL, SUPABASE_ANON_KEY, ACCESS_TOKEN e DEVICE_IDENTIFIER:

    curl -i -X POST "SUPABASE_URL/functions/v1/get-authorized-iptv-source" \
      -H "Authorization: Bearer ACCESS_TOKEN" \
      -H "apikey: SUPABASE_ANON_KEY" \
      -H "Content-Type: application/json" \
      -d "{\"deviceIdentifier\":\"DEVICE_IDENTIFIER\"}"

## Resultado esperado

HTTP 200 com ok true, client, device e source.

A resposta deve conter source.url, mas a function não deve baixar playlist, não deve parsear canais e não deve gravar channels_cache.

## Resultados negativos esperados

- Sem token: HTTP 401.
- Sem deviceIdentifier: HTTP 400.
- Dispositivo não cadastrado: HTTP 403.
- Dispositivo inativo: HTTP 403.
- Cliente inativo, bloqueado ou expirado: HTTP 403.
- Sem fonte IPTV ativa: HTTP 404.

## Observação arquitetural

Esta function não deve baixar playlist, não deve parsear canais e não deve gravar channels_cache.
