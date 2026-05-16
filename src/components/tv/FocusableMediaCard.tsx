import { useMemo, useState } from 'react';
import { useFocusable } from '@noriginmedia/norigin-spatial-navigation';

import { rememberLastCatalogFocusKey } from '@/lib/spatial/focusNavigation';
import {
  getCatalogMediaTypeLabel,
  getCatalogRatingLabel,
  getCatalogYearLabel,
} from '@/features/catalog/lib/catalogVisuals';
import type { CatalogMediaType } from '@/features/catalog/types';

interface FocusableMediaCardProps {
  title: string;
  subtitle?: string;
  posterUrl?: string;
  year?: string | number;
  rating?: string | number;
  genres?: string[];
  mediaType?: CatalogMediaType;
  focusKey: string;
  onEnterPress?: () => void;
  onArrowPress?: (direction: string) => boolean;
}

type CardPalette = {
  background: string;
  accent: string;
};

const CARD_PALETTES: CardPalette[] = [
  { background: '#0f172a', accent: '#dc2626' },
  { background: '#111827', accent: '#f97316' },
  { background: '#172554', accent: '#ef4444' },
  { background: '#1f2937', accent: '#fb7185' },
  { background: '#18181b', accent: '#f59e0b' },
  { background: '#0b1324', accent: '#e11d48' },
];

function getFallbackPalette(title: string) {
  const seed = Array.from(title).reduce((accumulator, character) => {
    return accumulator + character.charCodeAt(0);
  }, 0);

  return CARD_PALETTES[seed % CARD_PALETTES.length];
}

export function FocusableMediaCard({
  title,
  subtitle,
  posterUrl,
  year,
  rating,
  genres = [],
  mediaType,
  focusKey,
  onEnterPress,
  onArrowPress,
}: FocusableMediaCardProps) {
  const [hasPosterError, setHasPosterError] = useState(false);
  const shouldShowPoster = Boolean(posterUrl) && !hasPosterError;

  const fallbackPalette = useMemo(() => getFallbackPalette(title), [title]);
  const yearLabel = getCatalogYearLabel(year);
  const ratingLabel = getCatalogRatingLabel(rating);
  const mediaTypeLabel = getCatalogMediaTypeLabel(mediaType);
  const tags = [mediaTypeLabel, yearLabel, ...genres.slice(0, 1)].filter(
    Boolean,
  ) as string[];
  const cardBadge = mediaTypeLabel || 'Destaque';

  const { ref, focused } = useFocusable({
    focusKey,
    onEnterPress,
    onArrowPress,
    onFocus: () => {
      if (focusKey.startsWith('catalog-section-')) {
        rememberLastCatalogFocusKey(focusKey);
      }

      ref.current?.scrollIntoView({
        behavior: 'auto',
        block: 'center',
        inline: 'nearest',
      });
    },
  });

  return (
    <button
      ref={ref}
      className="media-card tv-focusable relative aspect-[2/3] overflow-hidden rounded-2xl border border-white/10 bg-xf-surface-soft text-left"
      style={
        shouldShowPoster
          ? undefined
          : {
              backgroundImage: `linear-gradient(165deg, ${fallbackPalette.accent}22 0%, ${fallbackPalette.background} 46%, #050505 100%)`,
            }
      }
      type="button"
      data-focused={focused ? 'true' : undefined}
      data-nav-id={focusKey}
      onClick={onEnterPress}
    >
      {shouldShowPoster && (
        <img
          src={posterUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() => setHasPosterError(true)}
        />
      )}

      {!shouldShowPoster && (
        <div className="absolute inset-0 z-[1] flex items-start justify-between px-4 pt-4">
          <div className="rounded-xl border border-white/25 bg-black/45 px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.2em] text-zinc-100">
            {cardBadge}
          </div>
          <div className="rounded-full border border-white/20 bg-black/55 px-3 py-1 text-xs font-semibold text-zinc-200">
            {title.charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

      <div className="absolute right-3 top-3 z-10 rounded-full border border-white/20 bg-black/65 px-2.5 py-1 text-[0.62rem] font-black uppercase tracking-[0.14em] text-white">
        {cardBadge}
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/90 to-black/45 px-4 pb-4 pt-8">
        <p className="line-clamp-2 text-base font-black leading-tight text-white md:text-lg">
          {title}
        </p>

        {tags.length > 0 ? (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[0.65rem] uppercase tracking-[0.16em] text-zinc-200">
            {tags.map((tag) => (
              <span
                key={`${focusKey}-${tag}`}
                className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <p className="mt-2 line-clamp-2 text-xs font-medium leading-relaxed text-zinc-300">
          {subtitle || 'Disponivel agora'}
        </p>

        {ratingLabel ? (
          <p className="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-zinc-200">
            {ratingLabel}
          </p>
        ) : null}
      </div>
    </button>
  );
}
