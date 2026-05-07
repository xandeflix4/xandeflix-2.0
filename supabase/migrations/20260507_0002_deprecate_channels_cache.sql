-- Fase 9 — Descontinuação do cache administrativo de canais IPTV
-- Esta migration não remove a tabela imediatamente.
-- Ela marca a tabela legada como descontinuada e bloqueia novas escritas.
-- O drop definitivo deve ser feito somente após validação em produção.

comment on table public.channels_cache is
  'LEGACY/DEPRECATED: cache de canais IPTV descontinuado na Fase 9. O app deve resolver fonte autorizada por get-authorized-iptv-source e parsear a playlist localmente no dispositivo. Não inserir novos dados nesta tabela.';

comment on policy "Admins can manage channels cache" on public.channels_cache is
  'LEGACY/DEPRECATED: política mantida apenas por compatibilidade com instalações que já aplicaram a migration inicial. Não usar channels_cache em novos fluxos.';

create or replace function public.prevent_channels_cache_writes()
returns trigger
language plpgsql
as $$
begin
  raise exception 'channels_cache foi descontinuada. Use get-authorized-iptv-source e parse local no dispositivo.';
end;
$$;

drop trigger if exists trg_prevent_channels_cache_writes on public.channels_cache;

create trigger trg_prevent_channels_cache_writes
before insert or update on public.channels_cache
for each row
execute function public.prevent_channels_cache_writes();
