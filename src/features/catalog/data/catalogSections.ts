import type { CatalogSection } from '../types';

export const catalogSections: CatalogSection[] = [
  {
    id: 'continue-watching',
    eyebrow: 'Recomendado para voce',
    title: 'Continue de onde parou',
    description:
      'Retome filmes, series e canais com leitura rapida para controle remoto.',
    showSeeAll: true,
    items: [
      {
        id: 'cw-neon-city',
        title: 'Neon City',
        subtitle: 'Retomar episodio 4',
        posterUrl: 'https://picsum.photos/seed/xande-cw-neon-city/720/1080',
        backdropUrl: 'https://picsum.photos/seed/xande-cw-neon-city-bg/1600/900',
        tmdbId: 7001,
        year: 2025,
        rating: 8.4,
        genres: ['Ficcao', 'Acao'],
        overview:
          'Uma equipe clandestina precisa atravessar a megacidade antes que a rede principal seja comprometida.',
        mediaType: 'series',
      },
      {
        id: 'cw-red-tide',
        title: 'Red Tide',
        subtitle: 'Sua ultima sessao',
        posterUrl: 'https://picsum.photos/seed/xande-cw-red-tide/720/1080',
        backdropUrl: 'https://picsum.photos/seed/xande-cw-red-tide-bg/1600/900',
        tmdbId: 7002,
        year: 2024,
        rating: 7.9,
        genres: ['Drama', 'Suspense'],
        overview:
          'Depois de um desaparecimento misterioso, um porto inteiro entra em alerta em plena madrugada.',
        mediaType: 'movie',
      },
      {
        id: 'cw-live-brazil',
        title: 'Xande Brasil HD',
        subtitle: 'Ao vivo agora',
        posterUrl: 'https://picsum.photos/seed/xande-cw-live-brazil/720/1080',
        backdropUrl: 'https://picsum.photos/seed/xande-cw-live-brazil-bg/1600/900',
        year: 2026,
        rating: '4.6/5',
        genres: ['Ao vivo', 'Variedades'],
        overview:
          'Programacao nacional com jornalismo, entretenimento e esporte em horario estendido.',
        mediaType: 'channel',
      },
      {
        id: 'cw-atlas-zero',
        title: 'Atlas Zero',
        subtitle: 'Faltam 22 min',
        posterUrl: 'https://picsum.photos/seed/xande-cw-atlas-zero/720/1080',
        backdropUrl: 'https://picsum.photos/seed/xande-cw-atlas-zero-bg/1600/900',
        tmdbId: 7003,
        year: 2023,
        rating: 8.1,
        genres: ['Aventura', 'Ficcao'],
        overview:
          'Uma missao espacial avaria e a tripulacao precisa recalcular a rota com recursos minimos.',
        mediaType: 'movie',
      },
      {
        id: 'cw-familia-plus',
        title: 'Familia Plus',
        subtitle: 'Favoritos da casa',
        posterUrl: 'https://picsum.photos/seed/xande-cw-familia-plus/720/1080',
        backdropUrl: 'https://picsum.photos/seed/xande-cw-familia-plus-bg/1600/900',
        year: 2025,
        rating: 8.0,
        genres: ['Comedia', 'Familia'],
        overview:
          'Uma colecao leve para maratonar com toda a familia no fim de semana.',
        mediaType: 'collection',
      },
      {
        id: 'cw-shadow-protocol',
        title: 'Shadow Protocol',
        subtitle: 'Novo episodio disponivel',
        posterUrl: 'https://picsum.photos/seed/xande-cw-shadow-protocol/720/1080',
        backdropUrl:
          'https://picsum.photos/seed/xande-cw-shadow-protocol-bg/1600/900',
        tmdbId: 7004,
        year: 2022,
        rating: 8.7,
        genres: ['Thriller', 'Investigacao'],
        overview:
          'Agentes independentes descobrem um esquema de vigilancia que atinge varias capitais.',
        mediaType: 'series',
      },
      {
        id: 'cw-sports-now',
        title: 'Sports Now',
        subtitle: 'Evento principal em andamento',
        posterUrl: 'https://picsum.photos/seed/xande-cw-sports-now/720/1080',
        backdropUrl: 'https://picsum.photos/seed/xande-cw-sports-now-bg/1600/900',
        year: 2026,
        rating: '4.7/5',
        genres: ['Esporte', 'Ao vivo'],
        overview:
          'Cobertura ao vivo com pre-jogo, evento principal e analise de pos-jogo.',
        mediaType: 'channel',
      },
      {
        id: 'cw-midnight-files',
        title: 'Midnight Files',
        subtitle: 'Continue assistindo',
        posterUrl: 'https://picsum.photos/seed/xande-cw-midnight-files/720/1080',
        backdropUrl:
          'https://picsum.photos/seed/xande-cw-midnight-files-bg/1600/900',
        tmdbId: 7005,
        year: 2021,
        rating: 7.8,
        genres: ['Crime', 'Drama'],
        overview:
          'Casos arquivados reaparecem quando uma jornalista encontra pistas em fitas antigas.',
        mediaType: 'series',
      },
      {
        id: 'cw-documenta-x',
        title: 'Documenta X',
        subtitle: 'Colecao em destaque',
        posterUrl: 'https://picsum.photos/seed/xande-cw-documenta-x/720/1080',
        backdropUrl:
          'https://picsum.photos/seed/xande-cw-documenta-x-bg/1600/900',
        tmdbId: 7006,
        year: 2024,
        rating: 8.9,
        genres: ['Documentario', 'Historia'],
        overview:
          'Serie documental com episodios curtos sobre eventos que mudaram a cultura pop.',
        mediaType: 'collection',
      },
      {
        id: 'cw-starlight-kids',
        title: 'Starlight Kids',
        subtitle: 'Infantil em alta',
        posterUrl: 'https://picsum.photos/seed/xande-cw-starlight-kids/720/1080',
        backdropUrl:
          'https://picsum.photos/seed/xande-cw-starlight-kids-bg/1600/900',
        year: 2025,
        rating: 'Livre',
        genres: ['Infantil', 'Animacao'],
        overview:
          'Conteudo infantil com episodios curtos, trilhas leves e personagens coloridos.',
        mediaType: 'channel',
      },
    ],
  },
  {
    id: 'live-channels',
    eyebrow: 'Ao vivo',
    title: 'Canais em destaque',
    description:
      'Selecao ao vivo organizada para navegar rapidamente pela grade principal.',
    items: [
      {
        id: 'live-prime-news',
        title: 'Prime News',
        subtitle: 'Noticias em tempo real',
        posterUrl: 'https://picsum.photos/seed/xande-live-prime-news/720/1080',
        backdropUrl:
          'https://picsum.photos/seed/xande-live-prime-news-bg/1600/900',
        year: 2026,
        rating: 'Ao vivo',
        genres: ['Noticias'],
        overview:
          'Plantao continuo com analise, cobertura nacional e internacional.',
        mediaType: 'channel',
      },
      {
        id: 'live-cine-pop',
        title: 'Cine Pop',
        subtitle: 'Cinema 24h',
        posterUrl: 'https://picsum.photos/seed/xande-live-cine-pop/720/1080',
        backdropUrl:
          'https://picsum.photos/seed/xande-live-cine-pop-bg/1600/900',
        year: 2026,
        rating: 'HD',
        genres: ['Filmes'],
        overview:
          'Filmes populares em rotacao continua com blocos especiais no horario nobre.',
        mediaType: 'channel',
      },
      {
        id: 'live-series-zone',
        title: 'Series Zone',
        subtitle: 'Maratona noturna',
        posterUrl: 'https://picsum.photos/seed/xande-live-series-zone/720/1080',
        backdropUrl:
          'https://picsum.photos/seed/xande-live-series-zone-bg/1600/900',
        year: 2026,
        rating: 'HD',
        genres: ['Series'],
        overview:
          'Sequencia de series com episodios consecutivos para maratonar sem pausa.',
        mediaType: 'channel',
      },
      {
        id: 'live-sport-arena',
        title: 'Sport Arena',
        subtitle: 'Evento principal',
        posterUrl: 'https://picsum.photos/seed/xande-live-sport-arena/720/1080',
        backdropUrl:
          'https://picsum.photos/seed/xande-live-sport-arena-bg/1600/900',
        year: 2026,
        rating: 'Ao vivo',
        genres: ['Esporte'],
        overview:
          'Esporte ao vivo com narracao dedicada e janela de destaques em tempo real.',
        mediaType: 'channel',
      },
      {
        id: 'live-familia',
        title: 'Familia TV',
        subtitle: 'Conteudo para todos',
        posterUrl: 'https://picsum.photos/seed/xande-live-familia/720/1080',
        backdropUrl: 'https://picsum.photos/seed/xande-live-familia-bg/1600/900',
        year: 2026,
        rating: 'Livre',
        genres: ['Variedades'],
        overview:
          'Programacao com humor, entrevistas e variedades para diferentes faixas de publico.',
        mediaType: 'channel',
      },
      {
        id: 'live-world-docs',
        title: 'World Docs',
        subtitle: 'Documentarios',
        posterUrl: 'https://picsum.photos/seed/xande-live-world-docs/720/1080',
        backdropUrl:
          'https://picsum.photos/seed/xande-live-world-docs-bg/1600/900',
        year: 2026,
        rating: 'HD',
        genres: ['Documentario'],
        overview:
          'Blocos especiais sobre natureza, ciencia e historias reais.',
        mediaType: 'channel',
      },
      {
        id: 'live-kids-time',
        title: 'Kids Time',
        subtitle: 'Bloco infantil',
        posterUrl: 'https://picsum.photos/seed/xande-live-kids-time/720/1080',
        backdropUrl:
          'https://picsum.photos/seed/xande-live-kids-time-bg/1600/900',
        year: 2026,
        rating: 'Livre',
        genres: ['Infantil', 'Animacao'],
        overview:
          'Canal infantil com blocos educativos e series de animacao.',
        mediaType: 'channel',
      },
      {
        id: 'live-music-vibe',
        title: 'Music Vibe',
        subtitle: 'Hits do dia',
        posterUrl: 'https://picsum.photos/seed/xande-live-music-vibe/720/1080',
        backdropUrl:
          'https://picsum.photos/seed/xande-live-music-vibe-bg/1600/900',
        year: 2026,
        rating: 'HD',
        genres: ['Musica'],
        overview:
          'Videoclipes, shows gravados e especiais musicais em rotacao continua.',
        mediaType: 'channel',
      },
    ],
  },
  {
    id: 'movies',
    eyebrow: 'Filmes',
    title: 'Filmes para hoje',
    description:
      'Uma vitrine com capas, metadados e sinopses curtas para decisao rapida na TV.',
    items: [
      {
        id: 'movie-glass-ocean',
        title: 'Glass Ocean',
        subtitle: 'Suspense investigativo',
        posterUrl: 'https://picsum.photos/seed/xande-movie-glass-ocean/720/1080',
        backdropUrl:
          'https://picsum.photos/seed/xande-movie-glass-ocean-bg/1600/900',
        tmdbId: 7101,
        year: 2023,
        rating: 8.2,
        genres: ['Suspense', 'Drama'],
        overview:
          'Uma analista forense volta para sua cidade natal para investigar um desaparecimento em massa.',
        mediaType: 'movie',
      },
      {
        id: 'movie-skyline-run',
        title: 'Skyline Run',
        subtitle: 'Acao urbana',
        posterUrl: 'https://picsum.photos/seed/xande-movie-skyline-run/720/1080',
        backdropUrl:
          'https://picsum.photos/seed/xande-movie-skyline-run-bg/1600/900',
        tmdbId: 7102,
        year: 2025,
        rating: 7.6,
        genres: ['Acao', 'Aventura'],
        overview:
          'Em uma noite caotica, dois desconhecidos cruzam a cidade para impedir um ataque coordenado.',
        mediaType: 'movie',
      },
      {
        id: 'movie-north-trail',
        title: 'North Trail',
        subtitle: 'Drama historico',
        posterUrl: 'https://picsum.photos/seed/xande-movie-north-trail/720/1080',
        backdropUrl:
          'https://picsum.photos/seed/xande-movie-north-trail-bg/1600/900',
        tmdbId: 7103,
        year: 2020,
        rating: 8.5,
        genres: ['Drama', 'Historia'],
        overview:
          'Uma expedicao no extremo norte testa os limites de uma equipe diante de condicoes severas.',
        mediaType: 'movie',
      },
      {
        id: 'movie-solar-echo',
        title: 'Solar Echo',
        subtitle: 'Ficcao cientifica',
        posterUrl: 'https://picsum.photos/seed/xande-movie-solar-echo/720/1080',
        backdropUrl:
          'https://picsum.photos/seed/xande-movie-solar-echo-bg/1600/900',
        tmdbId: 7104,
        year: 2026,
        rating: 8.0,
        genres: ['Ficcao', 'Aventura'],
        overview:
          'Uma tripulacao internacional recebe um sinal impossivel vindo de uma estrela prestes a colapsar.',
        mediaType: 'movie',
      },
      {
        id: 'movie-night-tram',
        title: 'Night Tram',
        subtitle: 'Thriller noturno',
        posterUrl: 'https://picsum.photos/seed/xande-movie-night-tram/720/1080',
        backdropUrl:
          'https://picsum.photos/seed/xande-movie-night-tram-bg/1600/900',
        tmdbId: 7105,
        year: 2022,
        rating: 7.7,
        genres: ['Thriller', 'Crime'],
        overview:
          'Durante uma madrugada chuvosa, passageiros de um ultimo trem ficam presos em uma rede de conspiracoes.',
        mediaType: 'movie',
      },
      {
        id: 'movie-golden-hour',
        title: 'Golden Hour',
        subtitle: 'Comedia romantica',
        posterUrl: 'https://picsum.photos/seed/xande-movie-golden-hour/720/1080',
        backdropUrl:
          'https://picsum.photos/seed/xande-movie-golden-hour-bg/1600/900',
        tmdbId: 7106,
        year: 2024,
        rating: 7.4,
        genres: ['Comedia', 'Romance'],
        overview:
          'Dois fotografos rivais descobrem que precisam colaborar para salvar um estudio historico.',
        mediaType: 'movie',
      },
      {
        id: 'movie-frontier-line',
        title: 'Frontier Line',
        subtitle: 'Aventura epica',
        posterUrl:
          'https://picsum.photos/seed/xande-movie-frontier-line/720/1080',
        backdropUrl:
          'https://picsum.photos/seed/xande-movie-frontier-line-bg/1600/900',
        tmdbId: 7107,
        year: 2021,
        rating: 8.3,
        genres: ['Aventura', 'Acao'],
        overview:
          'Uma tripulacao improvavel cruza fronteiras extremas para entregar um arquivo que pode mudar uma guerra.',
        mediaType: 'movie',
      },
    ],
  },
];

export type { CatalogItem, CatalogSection } from '../types';
