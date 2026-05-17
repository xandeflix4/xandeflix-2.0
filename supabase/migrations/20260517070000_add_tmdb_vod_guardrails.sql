update public.license_channels_cache
set
  content_kind = 'live',
  tmdb_id = null,
  tmdb_media_type = null,
  tmdb_match_status = 'skipped',
  tmdb_match_score = null,
  tmdb_title = null,
  tmdb_original_title = null,
  tmdb_overview = null,
  tmdb_poster_path = null,
  tmdb_backdrop_path = null,
  tmdb_release_year = null,
  tmdb_rating = null,
  tmdb_genres = null,
  tmdb_last_enriched_at = now()
where content_kind in ('movie', 'series')
  and (
    name ~* '^(A&E|AMC|ANIMAL PLANET|ARTE 1|AXN|BAND|BIS|CANAL BRASIL|CARTOON|CINEMAX|CNN|COMBATE|DISCOVERY|DISNEY|ESPN|FOX|FX|GLOOB|GLOBO|HBO|MAX|MEGAPIX|MTV|MULTISHOW|NAT GEO|NICK|PARAMOUNT|PREMIERE|RECORD|SONY|SPACE|SPORTV|STAR|SYFY|TELECINE|TNT|TOONCAST|UNIVERSAL|WARNER)(\s|$)'
    or (
      group_title ilike '%canais%'
      and name ~* '\m(SD|HD|FHD|UHD|4K|H265|HEVC)\M'
    )
  );
