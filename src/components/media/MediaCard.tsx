import { FocusableMediaCard } from '../tv/FocusableMediaCard';
import type { CatalogMediaType } from '@/features/catalog/types';

interface MediaCardProps {
  title: string;
  subtitle?: string;
  posterUrl?: string;
  year?: string | number;
  rating?: string | number;
  genres?: string[];
  mediaType?: CatalogMediaType;
  index: number;
  focusKey?: string;
  onEnterPress?: () => void;
  onArrowPress?: (direction: string) => boolean;
}

export function MediaCard({
  title,
  subtitle,
  posterUrl,
  year,
  rating,
  genres,
  mediaType,
  index,
  focusKey,
  onEnterPress,
  onArrowPress,
}: MediaCardProps) {
  return (
    <FocusableMediaCard
      title={title}
      subtitle={subtitle}
      posterUrl={posterUrl}
      year={year}
      rating={rating}
      genres={genres}
      mediaType={mediaType}
      focusKey={focusKey ?? `media-card-${index + 1}`}
      onEnterPress={onEnterPress}
      onArrowPress={onArrowPress}
    />
  );
}
