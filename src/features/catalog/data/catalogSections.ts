export interface CatalogItem {
  id: string;
  title: string;
  subtitle?: string;
}

export interface CatalogSection {
  id: string;
  eyebrow: string;
  title: string;
  showSeeAll?: boolean;
  items: CatalogItem[];
}

export const catalogSections: CatalogSection[] = [
  {
    id: 'continue-watching',
    eyebrow: 'TV Mode',
    title: 'Continuar assistindo',
    showSeeAll: true,
    items: [
      { id: 'canal-ao-vivo', title: 'Canal Ao Vivo', subtitle: 'Retomar reprodução' },
      { id: 'filme-em-destaque', title: 'Filme em Destaque', subtitle: 'Retomar reprodução' },
      { id: 'serie-popular', title: 'Série Popular', subtitle: 'Retomar reprodução' },
      { id: 'documentario', title: 'Documentário', subtitle: 'Retomar reprodução' },
      { id: 'infantil', title: 'Infantil', subtitle: 'Retomar reprodução' },
      { id: 'esportes', title: 'Esportes', subtitle: 'Retomar reprodução' },
      { id: 'noticias', title: 'Notícias', subtitle: 'Retomar reprodução' },
      { id: 'acao', title: 'Ação', subtitle: 'Retomar reprodução' },
      { id: 'comedia', title: 'Comédia', subtitle: 'Retomar reprodução' },
      { id: 'drama', title: 'Drama', subtitle: 'Retomar reprodução' },
    ],
  },
  {
    id: 'live-channels',
    eyebrow: 'Ao vivo',
    title: 'Canais em destaque',
    items: [
      { id: 'xande-cine', title: 'Xande Cine', subtitle: 'Canal disponível' },
      { id: 'xande-series', title: 'Xande Séries', subtitle: 'Canal disponível' },
      { id: 'xande-kids', title: 'Xande Kids', subtitle: 'Canal disponível' },
      { id: 'xande-sports', title: 'Xande Sports', subtitle: 'Canal disponível' },
      { id: 'xande-news', title: 'Xande News', subtitle: 'Canal disponível' },
      { id: 'xande-hits', title: 'Xande Hits', subtitle: 'Canal disponível' },
      { id: 'xande-premium', title: 'Xande Premium', subtitle: 'Canal disponível' },
      { id: 'xande-brasil', title: 'Xande Brasil', subtitle: 'Canal disponível' },
    ],
  },
  {
    id: 'movies',
    eyebrow: 'Filmes',
    title: 'Filmes em alta',
    items: [
      { id: 'filme-1', title: 'Filme 1', subtitle: 'Filme disponível' },
      { id: 'filme-2', title: 'Filme 2', subtitle: 'Filme disponível' },
      { id: 'filme-3', title: 'Filme 3', subtitle: 'Filme disponível' },
      { id: 'filme-4', title: 'Filme 4', subtitle: 'Filme disponível' },
      { id: 'filme-5', title: 'Filme 5', subtitle: 'Filme disponível' },
      { id: 'filme-6', title: 'Filme 6', subtitle: 'Filme disponível' },
      { id: 'filme-7', title: 'Filme 7', subtitle: 'Filme disponível' },
    ],
  },
];