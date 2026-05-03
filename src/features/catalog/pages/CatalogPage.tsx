import { setFocus } from '@noriginmedia/norigin-spatial-navigation';

import { AppShell } from '../../../components/layout/AppShell';
import { CatalogHero } from '../../../components/media/CatalogHero';
import { MediaCard } from '../../../components/media/MediaCard';
import { FocusableButton } from '../../../components/tv/FocusableButton';
import { FocusableSection } from '../../../components/tv/FocusableSection';
import { useDeviceType } from '../../../hooks/useDeviceType';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useRouteInitialFocus } from '../../../hooks/useRouteInitialFocus';
import {
  FOCUS_KEYS,
  getMediaCardFocusKey,
} from '../../../lib/spatial/focusKeys';

const continueWatchingItems = [
  'Canal Ao Vivo',
  'Filme em Destaque',
  'Série Popular',
  'Documentário',
  'Infantil',
  'Esportes',
  'Notícias',
  'Ação',
  'Comédia',
  'Drama',
];

const liveChannels = [
  'Xande Cine',
  'Xande Séries',
  'Xande Kids',
  'Xande Sports',
  'Xande News',
  'Xande Hits',
  'Xande Premium',
  'Xande Brasil',
];

const HERO_SCROLL_OPTIONS: ScrollIntoViewOptions = {
  behavior: 'smooth',
  block: 'start',
  inline: 'nearest',
};

const CARD_SCROLL_OPTIONS: ScrollIntoViewOptions = {
  behavior: 'smooth',
  block: 'center',
  inline: 'nearest',
};

function scrollHeroIntoView() {
  const heroElement = document.querySelector<HTMLElement>(
    `[data-nav-id="${FOCUS_KEYS.CATALOG_HERO_SECTION}"]`,
  );

  heroElement?.scrollIntoView(HERO_SCROLL_OPTIONS);
}

function scrollFocusKeyIntoView(focusKey: string) {
  const element = document.querySelector<HTMLElement>(
    `[data-nav-id="${focusKey}"]`,
  );

  element?.scrollIntoView(CARD_SCROLL_OPTIONS);
}

export function CatalogPage() {
  const { user, signOut } = useAuth();
  const { isTv, isMobile } = useDeviceType();

  useRouteInitialFocus();

  const gridClassName = isTv
    ? 'grid-cols-5 xl:grid-cols-6'
    : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5';

  const columnsPerRow = isTv ? 6 : isMobile ? 2 : 5;
  const firstRowLimit = columnsPerRow;

  function focusHeroPlayButton() {
    setFocus(FOCUS_KEYS.HERO_PLAY_BUTTON);

    window.requestAnimationFrame(() => {
      scrollHeroIntoView();
    });

    return false;
  }

  function focusContinueWatchingCardAbove(liveChannelIndex: number) {
    const continueRows = Math.ceil(continueWatchingItems.length / columnsPerRow);
    const lastContinueRowStartIndex = (continueRows - 1) * columnsPerRow;

    const columnIndex = liveChannelIndex % columnsPerRow;

    const targetIndex = Math.min(
      lastContinueRowStartIndex + columnIndex,
      continueWatchingItems.length - 1,
    );

    const targetFocusKey = getMediaCardFocusKey(targetIndex);

    console.log('[Xandeflix ManualNav] LiveChannels ArrowUp', {
      liveChannelIndex,
      columnsPerRow,
      targetIndex,
      targetFocusKey,
    });

    setFocus(targetFocusKey);

    window.requestAnimationFrame(() => {
      scrollFocusKeyIntoView(targetFocusKey);
    });

    return false;
  }

  return (
    <AppShell userEmail={user?.email} onSignOut={() => void signOut()}>
      <CatalogHero />

      <FocusableSection
        focusKey={FOCUS_KEYS.CONTINUE_WATCHING_SECTION}
        className="mb-12"
        onArrowPress={(direction) => {
          if (direction === 'up') {
            return focusHeroPlayButton();
          }

          return true;
        }}
      >
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-xf-red">
              {isMobile ? 'Mobile' : isTv ? 'TV Mode' : 'Web'}
            </p>

            <h2 className="mt-1 text-2xl font-black text-white md:text-4xl">
              Continuar assistindo
            </h2>
          </div>

          {!isMobile && (
            <FocusableButton
              focusKey={FOCUS_KEYS.CONTINUE_SEE_ALL}
              className="inline-flex rounded-full bg-xf-surface px-5 py-3 text-sm font-bold text-white"
              onEnterPress={() => {
                console.log('[D-Pad] Ver tudo: Continuar assistindo');
              }}
              onArrowPress={(direction) => {
                if (direction === 'up') {
                  return focusHeroPlayButton();
                }

                return true;
              }}
            >
              Ver tudo
            </FocusableButton>
          )}
        </div>

        <div className={`grid gap-4 md:gap-5 ${gridClassName}`}>
          {continueWatchingItems.map((title, index) => (
            <MediaCard
              key={title}
              title={title}
              subtitle="Retomar reprodução"
              index={index}
              onEnterPress={() => {
                console.log(`[D-Pad] Abrir mídia: ${title}`);
              }}
              onArrowPress={(direction) => {
                if (direction === 'up' && index < firstRowLimit) {
                  return focusHeroPlayButton();
                }

                return true;
              }}
            />
          ))}
        </div>
      </FocusableSection>

      <FocusableSection
        focusKey={FOCUS_KEYS.LIVE_CHANNELS_SECTION}
        onArrowPress={(direction) => {
          if (direction === 'up') {
            const fallbackTargetIndex = Math.max(
              continueWatchingItems.length - columnsPerRow,
              0,
            );

            const targetFocusKey = getMediaCardFocusKey(fallbackTargetIndex);

            setFocus(targetFocusKey);

            window.requestAnimationFrame(() => {
              scrollFocusKeyIntoView(targetFocusKey);
            });

            return false;
          }

          return true;
        }}
      >
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-xf-red">
              Ao vivo
            </p>

            <h2 className="mt-1 text-2xl font-black text-white md:text-4xl">
              Canais em destaque
            </h2>
          </div>
        </div>

        <div className={`grid gap-4 md:gap-5 ${gridClassName}`}>
          {liveChannels.map((title, index) => (
            <MediaCard
              key={title}
              title={title}
              subtitle="Canal disponível"
              index={index + continueWatchingItems.length}
              onEnterPress={() => {
                console.log(`[D-Pad] Abrir canal: ${title}`);
              }}
              onArrowPress={(direction) => {
                if (direction === 'up') {
                  return focusContinueWatchingCardAbove(index);
                }

                return true;
              }}
            />
          ))}
        </div>
      </FocusableSection>
    </AppShell>
  );
}