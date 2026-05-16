# Fase 4.11-B2.1 - Home premium com conteudo visual real

## 1. Objetivo

Tornar a evolucao visual da Home claramente perceptivel com Hero de imagem real, cards com capa/poster, metadados e fallback elegante, sem depender de API externa obrigatoria.

## 2. Diagnostico do problema visual

A B2 melhorou composicao e hierarquia, mas o impacto ficou limitado porque os dados da Home tinham pouco conteudo visual e metadados escassos.

## 3. Arquivos alterados

- `src/features/catalog/types.ts`
- `src/features/catalog/lib/catalogVisuals.ts`
- `src/features/catalog/data/catalogSections.ts`
- `src/components/media/CatalogHero.tsx`
- `src/components/media/MediaCard.tsx`
- `src/components/tv/FocusableMediaCard.tsx`
- `src/features/catalog/pages/CatalogPage.tsx`

## 4. Campos visuais adicionados ou reaproveitados

No tipo de item de catalogo, foram adicionados campos opcionais compativeis com uso local e TMDB-ready:

- `posterUrl`
- `backdropUrl`
- `thumbnailUrl`
- `imageUrl`
- `posterPath`
- `backdropPath`
- `tmdbId`
- `year`
- `rating`
- `genres`
- `overview`
- `mediaType`

Todos opcionais para preservar compatibilidade com itens existentes.

## 5. Hero com backdrop/metadados

- Hero agora pode usar `backdropUrl` como imagem principal.
- Fallback para `posterUrl` quando `backdropUrl` nao existir.
- Exibe tags visuais de metadados (tipo, ano, nota e generos).
- Exibe sinopse curta (`overview`) com fallback seguro.
- Mantem botoes focaveis existentes (`FocusableButton`) e fluxo D-pad.

## 6. Cards com poster/capa

- Cards passaram a consumir poster resolvido por helper (`getCatalogPosterUrl`).
- Metadados por card (tipo/ano/genero/nota) foram adicionados de forma leve.
- Quando imagem falha ou inexiste, fallback premium com gradiente, badge e iniciais.
- Mantido `loading="lazy"` e `decoding="async"` para imagens dos cards.

## 7. Fallbacks visuais

- Sem imagem: card usa fallback visual com paleta dinamica.
- Sem metadado: UI continua renderizando com textos padrao.
- Sem campos TMDB: Home funciona com dados locais seed.

## 8. Cuidados com TMDB

- Estrutura pronta para TMDB via `posterPath` e `backdropPath`.
- Helper local monta URL de imagem TMDB quando path existir.
- Nenhuma chave/segredo foi hardcoded.
- Home nao depende obrigatoriamente de API externa para funcionar.

## 9. Cuidados com D-pad

- Focus keys da Home foram preservadas.
- Hero continua com botoes focaveis ja existentes.
- Cards continuam navegaveis via `FocusableMediaCard`.
- Nenhum botao nativo novo foi introduzido no Hero para substituir componentes focaveis.

## 10. Cuidados com Fire Stick

- Nao houve aumento da quantidade de itens renderizados inicialmente.
- Nao foi adicionado autoplay/video no Hero.
- Mantido carregamento lazy das imagens dos cards.
- Sem animacoes continuas pesadas.
- Sem blur/backdrop-filter em massa.

## 11. Fora do escopo

- Nao altera Admin.
- Nao altera Supabase.
- Nao altera Edge Functions.
- Nao altera migrations/schema.
- Nao altera Android/Capacitor.
- Nao altera Live TV.
- Nao altera Player.
- Nao altera regras de licenciamento.

## 12. Proximas fases

1. Validacao visual manual em TV/desktop para calibrar densidade dos metadados.
2. B3 (Live TV premium) apenas apos confirmar que a Home atingiu nivel premium perceptivel.
3. Refino pontual de foco por rota (B5) se surgir regressao em navegacao por D-pad.
