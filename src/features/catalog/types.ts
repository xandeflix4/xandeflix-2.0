export type CatalogMediaType = 'movie' | 'series' | 'channel' | 'collection';

export interface CatalogItem {
  id: string;
  title: string;
  subtitle?: string;
  streamUrl?: string;
  logoUrl?: string | null;
  groupTitle?: string | null;
  posterUrl?: string;
  backdropUrl?: string;
  thumbnailUrl?: string;
  imageUrl?: string;
  posterPath?: string;
  backdropPath?: string;
  tmdbId?: number;
  year?: string | number;
  rating?: string | number;
  genres?: string[];
  overview?: string;
  mediaType?: CatalogMediaType;
}

export interface CatalogSection {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  showSeeAll?: boolean;
  items: CatalogItem[];
}
