# Auditoria visual e mapa da experiencia do app cliente - Xandeflix 2.0

## 1. Resumo executivo

O app cliente esta funcional no fluxo basico de ativacao, carregamento e reproducao, mas ainda esta em estado visual/tatico intermediario para TV.

Pontos positivos ja existentes:
- separacao clara entre rotas cliente e admin;
- fluxo de ativacao com persistencia local;
- tela de preparacao da Home com acoes de recuperacao (PR #64);
- Live TV com tentativa de carregar canais autorizados do cache e fallback legado;
- player universal com sessao de playback (start/heartbeat/end).

Principais lacunas para experiencia premium:
- Home/Catalogo ainda usa dados estaticos/mock;
- foco D-pad inconsistente em algumas rotas (especialmente Live/Settings/erro da Preparing Home);
- layout e comportamento do player ainda em formato tecnico/diagnostico;
- riscos de performance no Fire Stick (listas extensas, efeitos visuais e bundles grandes).

## 2. Contexto da fase 4.11-B1

Esta fase foi executada como auditoria/documentacao. Nenhuma alteracao funcional pesada foi aplicada.

Base confirmada antes da auditoria:
- `main` sincronizada com `origin/main`;
- PR #64 integrada:
  - merge commit: `4168707`
  - commit da branch: `1c51cad`

## 3. Escopo analisado

Arquivos principais inspecionados (cliente, layout, foco, runtime):
- `src/app/routes.tsx`
- `src/app/providers/AppProviders.tsx`
- `src/app/providers/SpatialNavigationProvider.tsx`
- `src/features/auth/pages/LoginPage.tsx`
- `src/features/catalog/pages/PreparingHomePage.tsx`
- `src/features/catalog/pages/CatalogPage.tsx`
- `src/features/catalog/data/catalogSections.ts`
- `src/features/catalog/services/prepareHomePlaylist.service.ts`
- `src/features/live/pages/LiveTvPage.tsx`
- `src/features/player/pages/UniversalPlayerPage.tsx`
- `src/features/settings/pages/SettingsPage.tsx`
- `src/features/playlists/pages/DirectSourcePlaylistPage.tsx`
- `src/features/playlists/providers/PlaylistRuntimeProvider.tsx`
- `src/features/playlists/services/authorizedIptvSource.service.ts`
- `src/features/playlists/services/authorizedLicenseChannels.service.ts`
- `src/features/licensing/services/licenseActivation.service.ts`
- `src/features/licensing/services/playbackSession.service.ts`
- `src/features/licensing/lib/licenseActivationStorage.ts`
- `src/components/layout/AppShell.tsx`
- `src/components/layout/AppHeader.tsx`
- `src/components/layout/TvSidebar.tsx`
- `src/components/layout/MobileBottomNav.tsx`
- `src/components/media/CatalogHero.tsx`
- `src/components/media/MediaCard.tsx`
- `src/components/tv/FocusableButton.tsx`
- `src/components/tv/FocusableInput.tsx`
- `src/features/tv-focus/FocusSafetyGuard.tsx`
- `src/features/tv-focus/focusKeys.ts`
- `src/hooks/useRouteInitialFocus.ts`
- `src/hooks/useCatalogGridNavigation.ts`
- `src/lib/spatial/focusNavigation.ts`
- `src/platform/deviceProfile.ts`
- `src/platform/useDeviceProfile.ts`
- `src/styles/globals.css`

## 4. Mapa das rotas do app cliente

### 4.1 Login / ativacao

Rota:
- `/login` -> `LoginPage`

Comportamento:
- gera/recupera `deviceIdentifier`;
- ativa licenca via `activateLicense`;
- salva em localStorage (`xandeflix.licenseActivation`);
- redireciona para `/preparing-home`.

Protecao:
- rotas cliente usam `LicenseRoute`, que valida apenas existencia de `licenseCode` e `deviceIdentifier` em storage.

### 4.2 Preparando sua Home

Rota:
- `/preparing-home` -> `PreparingHomePage`

Comportamento:
- chama `prepareHomePlaylist` e preenche runtime;
- mostra estado de carregamento/progresso;
- em erro exibe botoes "Tentar novamente" e "Trocar licenca" (entrega da PR #64).

### 4.3 Home / Catalogo

Rota:
- `/` -> `CatalogPage` (protegida por `LicenseRoute`)

Comportamento:
- renderiza Hero + secoes de catalogo;
- dados vindos de `catalogSections` (mock estatico local).

Observacao:
- `HomePage` com esse nome nao foi localizada. O equivalente atual e `CatalogPage`.

### 4.4 Live TV

Rota:
- `/live` -> `LiveTvPage` (protegida por `LicenseRoute`)

Comportamento:
- tenta resolver fonte autorizada por licenca/dispositivo;
- tenta carregar canais do cache (`list-license-channels-cache`) via service;
- se cache falha/vazio, fallback para playlist direta autorizada;
- organiza canais por grupo e navega para `/player`.

### 4.5 Player universal

Rota:
- `/player` -> `UniversalPlayerPage` (protegida por `LicenseRoute`)

Comportamento:
- recebe `src` e `title` via querystring;
- usa estrategia por tipo de stream (HLS/MPEGTS/native Android/video nativo);
- integra sessao de reproducao (`start-playback-session`, `heartbeat-playback-session`, `end-playback-session`).

### 4.6 Settings

Rota:
- `/settings` -> `SettingsPage` (protegida por `LicenseRoute`)

Comportamento:
- permite reativar licenca;
- mostra `deviceIdentifier`;
- possui campo de URL manual (mais informativo do que operacional nesta etapa).

### 4.7 Rotas legadas ou auxiliares, se existirem

Rota auxiliar/legada encontrada:
- `/playlists/direct-source` -> `DirectSourcePlaylistPage` (protegida por `LicenseRoute`)

Uso atual:
- tela tecnica de carregamento direto de playlist;
- controles de diagnostico/runtime;
- aparenta ser rota util para suporte/homologacao, nao para UX final premium.

Separacao admin:
- rotas `/admin/**` isoladas por `AdminRoute` e fora do escopo da experiencia cliente.

## 5. Mapa dos componentes principais

### 5.1 AppShell

Arquivo:
- `src/components/layout/AppShell.tsx`

Papel:
- estrutura base da tela cliente;
- decide layout TV/mobile com `useDeviceProfile` + `useDeviceType`;
- renderiza `TvSidebar` em TV e `MobileBottomNav` fora de TV.

### 5.2 Header

Arquivo:
- `src/components/layout/AppHeader.tsx`

Papel:
- acoes de pesquisa/perfil/sair;
- em TV ele e ocultado (`shouldShowActions = !isTv`), concentrando navegacao no sidebar.

### 5.3 Sidebar

Arquivo real localizado:
- `src/components/layout/TvSidebar.tsx`

Papel:
- barra lateral fixa com icones (Inicio, Pesquisar, Canais, Filmes, Series, Configuracoes, Sair).

Observacao:
- componente chamado genericamente de "Sidebar" nao existe com esse nome; o equivalente real e `TvSidebar`.

### 5.4 Cards e carrosseis

Arquivos:
- `src/components/media/CatalogHero.tsx`
- `src/components/media/MediaCard.tsx`
- `src/components/tv/FocusableMediaCard.tsx`

Observacao:
- `src/components/media/MediaRow.tsx` existe mas esta vazio no estado atual.

### 5.5 Componentes de foco

Arquivos:
- `src/components/tv/FocusableButton.tsx`
- `src/components/tv/FocusableInput.tsx`
- `src/components/tv/FocusableSection.tsx`
- `src/components/tv/keyboard/TvKeyboardModal.tsx`

Observacao:
- `src/components/tv/TvGrid.tsx` existe, mas esta vazio no estado atual.

### 5.6 Providers e hooks de navegacao espacial

Arquivos:
- `src/app/providers/SpatialNavigationProvider.tsx`
- `src/features/tv-focus/FocusSafetyGuard.tsx`
- `src/features/tv-focus/focusKeys.ts`
- `src/hooks/useRouteInitialFocus.ts`
- `src/hooks/useCatalogGridNavigation.ts`
- `src/lib/spatial/focusNavigation.ts`

## 6. Diagnostico visual atual

Estado atual:
- identidade escura/vermelha coerente com produto de streaming;
- base de componentes focaveis para TV ja existe;
- estrutura visual funciona, mas com cara de "base tecnica".

Pontos aceitaveis:
- contraste geral bom para TV;
- foco visivel em elementos interativos;
- sidebar de TV funcional e simples.

Pontos funcionais, mas visualmente basicos:
- Home com conteudo mock;
- textos de placeholder/diagnostico em varias telas (Live/Player/Direct Source);
- Hero sem midia real de catalogo.

## 7. Diagnostico da navegacao D-pad

Pontos fortes:
- Norigin Spatial Navigation configurado;
- keymap inclui codigos relevantes para controle remoto;
- `FocusSafetyGuard` tenta recuperar foco perdido.

Riscos/lacunas:
- `useRouteInitialFocus` so cobre `/login` e `/`;
- candidatos de foco no login incluem chaves antigas (`login-test-button`, `login-email-input`, `login-password-input`) que nao representam a tela atual;
- `/live` e `/settings` nao tem configuracao dedicada de foco inicial;
- fallback de `FocusSafetyGuard` para rotas nao mapeadas cai no conjunto de Catalogo, podendo apontar para elementos inexistentes nessas rotas;
- em `PreparingHomePage`, botoes de erro sao `button` nativos (nao `FocusableButton`), reduzindo previsibilidade de navegacao por controle remoto.

## 8. Diagnostico de performance no Fire Stick

Riscos principais observados:
- bundles grandes no build de producao (avisos de chunks > 500 kB em `hls` e `index`);
- Live TV pode renderizar ate `MAX_VISIBLE_CHANNELS_PER_GROUP = 160` por grupo, sem virtualizacao;
- uso intenso de gradientes, blur, sombra e escalas de foco pode aumentar custo de composicao;
- varios fluxos com timers/retries de foco e scroll programatico;
- listas com logos/imagens podem gerar custo adicional de decode/layout em hardware limitado.

Pontos positivos:
- carregamento progressivo de secoes no Catalogo para TV;
- `loading=\"lazy\"` em logos na lista de canais;
- fallback funcional quando cache de canais falha.

## 9. Diagnostico de estados de loading, erro e vazio

Login:
- feedback de sucesso/erro claro.

Preparing Home:
- loading e progresso com mensagem clara;
- erro com recuperacao manual (`Tentar novamente` / `Trocar licenca`).

Catalogo:
- nao possui skeleton/placeholder premium; conteudo aparece direto via mock.

Live TV:
- loading, vazio, erro e mensagens de fallback entre cache e playlist direta.

Player:
- estados detalhados e telemetria abundante;
- UX atual mais tecnica do que orientada a usuario final.

Settings:
- estados de ativacao e erro presentes;
- bloco "Ativando licenca..." aparece duplicado (duas secoes iguais).

## 10. Diagnostico do fluxo de ativacao e recuperacao

Fluxo atual:
1. usuario ativa em `/login` (ou `/settings`);
2. licenca/dispositivo ficam em localStorage;
3. `/preparing-home` tenta preparar playlist inicial;
4. em sucesso vai para `/`;
5. em erro oferece retry ou troca de licenca.

Observacoes:
- gate de rota cliente (`LicenseRoute`) depende de storage local, nao de validacao de sessao/licenca em tempo real;
- recuperacao da PR #64 melhorou resiliencia do primeiro boot;
- `prepareHomePlaylist` ainda carrega por fonte autorizada (playlist), sem tentativa de cache de canais nesta etapa.

## 11. Diagnostico da Home / Catalogo

Estado atual:
- Home e visualmente organizada, mas os dados sao estaticos em `catalogSections.ts`;
- nao ha relacao direta com catalogo real, historico real ou recomendacao real.

Impacto:
- experiencia pode parecer "demo" para usuario final;
- baixa fidelidade para cenarios com milhares de itens/canais reais.

## 12. Diagnostico da Live TV

Estado atual:
- integra tentativa de consumo de cache por licenca (`authorizedLicenseChannels.service.ts`);
- fallback para playlist direta autorizado continua ativo;
- grupos e canais sao navegaveis por D-pad;
- preview principal ainda e informativo/placeholder (nao preview de video inline ativo).

Lacunas:
- sem EPG real;
- filtro de "canal ao vivo" baseado em termos de grupo pode classificar incorretamente;
- sem virtualizacao para grandes volumes.

## 13. Diagnostico do Player / Overlay

Estado atual:
- engine de reproducao e sessao de playback estao robustas no aspecto tecnico;
- pagina do player expoe muito diagnostico (telemetria/eventos) para UX final.

Lacunas premium:
- overlay de controles ainda nao foi desenhado para experiencia leanback;
- hierarquia visual prioriza debug, nao consumo de conteudo;
- sem fluxo de "up next", grade lateral, mini-info de canal e comportamento TV premium.

## 14. Lacunas para experiencia premium

Lacunas criticas:
- Home sem dados reais;
- foco inicial/fallback incompleto fora de `/login` e `/`;
- botoes de erro da Preparing Home fora do padrao focavel TV.

Lacunas altas:
- Live TV sem virtualizacao e sem EPG;
- player com UI de diagnostico;
- inconsistencias de foco entre telas.

Lacunas medias:
- textos e sinais visuais ainda tecnicos;
- componentes vazios (`MediaRow`, `TvGrid`) sem papel claro no fluxo atual;
- duplicacao de bloco de status em Settings.

## 15. Referencia de intencao visual

Referencia de intencao (sem copiar identidade proprietaria de terceiros):
- hierarquia visual forte por contexto (hero, secoes, detalhes);
- navegacao horizontal previsivel por secoes;
- foco visivel, estavel e sem "saltos";
- leitura a distancia (tipografia, espacamento, contraste);
- estados de loading elegantes e discretos;
- transicoes leves e consistentes;
- comportamento de controle remoto previsivel;
- performance priorizada para hardware de TV.

## 16. Riscos tecnicos

Riscos de navegacao:
- mismatch entre mapas de foco e elementos reais em algumas rotas;
- fallback generico pode tentar focar elementos ausentes.

Riscos de performance:
- volume de itens renderizados na Live TV sem virtualizacao;
- efeitos visuais e animacoes globais em foco podem elevar custo em Fire Stick.

Riscos de produto:
- Home com mock pode divergir da expectativa de conteudo real;
- rota direta `/playlists/direct-source` exposta em app cliente pode confundir fluxo final.

## 17. Restricoes preservadas nesta fase

Esta fase preservou explicitamente:
- nao altera Admin;
- nao altera Supabase;
- nao altera Edge Functions;
- nao altera migrations/schema;
- nao altera Android/Capacitor;
- nao altera regras de licenciamento;
- nao faz redesign pesado;
- nao remove fallback existente;
- nao muda contrato de dados.

## 18. Plano faseado recomendado

### 18.1 Fase 4.11-B2 - Home premium base

Objetivo:
- transformar Home de mock para experiencia premium base.

Arquivos provaveis:
- `src/features/catalog/pages/CatalogPage.tsx`
- `src/components/media/CatalogHero.tsx`
- `src/components/media/MediaCard.tsx`
- `src/components/layout/AppShell.tsx`
- `src/hooks/useRouteInitialFocus.ts`

### 18.2 Fase 4.11-B3 - Live TV premium

Objetivo:
- grade premium de Live TV com navegacao/preview melhorados.

Arquivos provaveis:
- `src/features/live/pages/LiveTvPage.tsx`
- `src/components/tv/FocusableButton.tsx`
- `src/features/playlists/providers/PlaylistRuntimeProvider.tsx` (somente se necessario para suporte de estado)

### 18.3 Fase 4.11-B4 - Player/overlay premium

Objetivo:
- overlay TV-first no player, reduzindo interface de debug na experiencia final.

Arquivos provaveis:
- `src/features/player/pages/UniversalPlayerPage.tsx`
- `src/components/player/PlayerControls.tsx`
- `src/components/player/VideoSurface.tsx`

### 18.4 Fase 4.11-B5 - Polimento D-pad Fire Stick

Objetivo:
- padronizar foco inicial, fallback e recuperacao por rota.

Arquivos provaveis:
- `src/hooks/useRouteInitialFocus.ts`
- `src/features/tv-focus/FocusSafetyGuard.tsx`
- `src/features/tv-focus/focusKeys.ts`
- `src/lib/spatial/focusNavigation.ts`

### 18.5 Fase 4.11-B6 - Performance Fire Stick

Objetivo:
- reduzir custo de render/composicao e melhorar responsividade.

Arquivos provaveis:
- `src/features/live/pages/LiveTvPage.tsx`
- `src/styles/globals.css`
- `vite` build strategy (code split pontual sem quebrar arquitetura)

### 18.6 Fase 4.11-C - Edge Function cliente owner-aware para canais autorizados

Objetivo:
- consolidar caminho de leitura de canais autorizados para app cliente com contrato definitivo.

Observacao:
- fase de backend controlada, fora desta B1.

### 18.7 Fase 4.12 - Self-service IPTV

Objetivo:
- iniciar capacidades self-service com seguranca e owner-aware.

### 18.8 Fase 5 - Estabilizacao TV/Fire Stick

Objetivo:
- endurecimento de navegacao, memoria, reconnect, fallback e telemetria.

### 18.9 Fase 6 - Deploy e producao

Objetivo:
- checklist final de release, homologacao e rollout controlado.

## 19. Criterios de aceite para a B1

Checklist B1 atendido:
- mapa real de rotas cliente documentado;
- mapa real de componentes e foco documentado;
- diagnostico visual atual produzido;
- riscos D-pad e Fire Stick documentados;
- lacunas para UX premium classificadas;
- plano faseado B2-B6 e fases seguintes definido;
- sem mudanca funcional pesada no app.

## 20. Conclusao

O app cliente ja possui base tecnica relevante para TV (foco, shell, player e fluxo de ativacao), mas a experiencia premium ainda depende de fases dedicadas de produto/UX/performance.

A PR #64 melhorou significativamente o fluxo de recuperacao na Preparing Home. O proximo passo recomendado e iniciar a B2 com foco em Home premium base e, em paralelo, fechar lacunas de foco D-pad por rota para diminuir risco de regressao no Fire Stick.
