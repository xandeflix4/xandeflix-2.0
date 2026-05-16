import { useEffect, useMemo, useState } from 'react';

import { useAuth } from '../../../app/providers/AuthProvider';
import { AppShell } from '../../../components/layout/AppShell';
import { CatalogHero } from '../../../components/media/CatalogHero';
import { MediaCard } from '../../../components/media/MediaCard';
import { FocusableButton } from '../../../components/tv/FocusableButton';
import { FocusableSection } from '../../../components/tv/FocusableSection';
import { useDeviceType } from '../../../hooks/useDeviceType';
import { useCatalogGridNavigation } from '../../../hooks/useCatalogGridNavigation';
import { useRouteInitialFocus } from '../../../hooks/useRouteInitialFocus';
import {
  getCategoryItemFocusKey,
  getCategorySectionFocusKey,
  getCategorySeeAllFocusKey,
} from '../../../lib/spatial/categoryFocusKeys';
import { spatialDebug } from '@/lib/spatial/spatialDebug';
import {
  getCatalogBackdropUrl,
  getCatalogOverview,
  getCatalogPosterUrl,
} from '@/features/catalog/lib/catalogVisuals';
import type { CatalogItem } from '@/features/catalog/types';

import { catalogSections } from '../data/catalogSections';

const INITIAL_TV_VISIBLE_SECTIONS = 1;
const INITIAL_TV_VISIBLE_ITEMS_PER_SECTION = 5;
const TV_REMAINING_SECTIONS_DELAY_MS = 1500;
const SECTION_LOADING_CARD_COUNT = 4;

function shouldShowSeeAll(section: { showSeeAll?: boolean }) {
  return Boolean(section.showSeeAll);
}

function getFirstFeaturedItem(items: CatalogItem[]) {
  return (
    items.find((item) => getCatalogBackdropUrl(item) || getCatalogPosterUrl(item)) ||
    items[0] ||
    null
  );
}

export function CatalogPage() {
  const { signOut } = useAuth();
  const { isTv, isMobile } = useDeviceType();
  const resolvedCatalogSections = catalogSections;

  const [visibleSectionCount, setVisibleSectionCount] = useState(
    isTv ? INITIAL_TV_VISIBLE_SECTIONS : resolvedCatalogSections.length,
  );

  useEffect(() => {
    if (!isTv) {
      setVisibleSectionCount(resolvedCatalogSections.length);
      return;
    }

    setVisibleSectionCount(INITIAL_TV_VISIBLE_SECTIONS);

    const timer = window.setTimeout(() => {
      setVisibleSectionCount(resolvedCatalogSections.length);
    }, TV_REMAINING_SECTIONS_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [isTv, resolvedCatalogSections.length]);

  const visibleCatalogSections = useMemo(
    () => resolvedCatalogSections.slice(0, visibleSectionCount),
    [resolvedCatalogSections, visibleSectionCount],
  );
  const featuredSection = useMemo(
    () => resolvedCatalogSections.find((section) => section.items.length > 0) ?? null,
    [resolvedCatalogSections],
  );
  const featuredItem = useMemo(
    () => (featuredSection ? getFirstFeaturedItem(featuredSection.items) : null),
    [featuredSection],
  );
  const totalVisibleItems = useMemo(
    () =>
      visibleCatalogSections.reduce((total, section) => total + section.items.length, 0),
    [visibleCatalogSections],
  );

  const isProgressiveLoading =
    isTv && visibleSectionCount < resolvedCatalogSections.length;

  useRouteInitialFocus();

  const spatialNavigation = useCatalogGridNavigation({
    sections: resolvedCatalogSections,
  });

  return (
    <AppShell
      onSignOut={() => void signOut()}
      headerNavigation={{
        onSearchArrowPress: spatialNavigation.handleHeaderSearchArrowPress,
        onProfileArrowPress: spatialNavigation.handleHeaderProfileArrowPress,
        onLogoutArrowPress: spatialNavigation.handleHeaderLogoutArrowPress,
      }}
      mainClassName="px-4 pb-28 md:px-8 md:pb-10 lg:px-10"
    >
      <section className="mx-auto w-full max-w-[1680px]">
        <CatalogHero
          title={featuredItem?.title}
          description={featuredSection?.description}
          overview={featuredItem ? getCatalogOverview(featuredItem) : undefined}
          posterUrl={featuredItem ? getCatalogPosterUrl(featuredItem) : undefined}
          backdropUrl={featuredItem ? getCatalogBackdropUrl(featuredItem) : undefined}
          year={featuredItem?.year}
          rating={featuredItem?.rating}
          genres={featuredItem?.genres}
          mediaType={featuredItem?.mediaType}
          eyebrow={featuredSection?.eyebrow || 'Inicio'}
          stats={[
            {
              label: 'Secoes',
              value: String(visibleCatalogSections.length),
            },
            {
              label: 'Titulos',
              value: String(totalVisibleItems),
            },
            {
              label: 'Experiencia',
              value: isTv ? 'TV pronta' : 'Navegacao fluida',
            },
          ]}
          onSectionArrowPress={spatialNavigation.handleHeroSectionArrowPress}
          onPlayArrowPress={spatialNavigation.handleHeroPlayArrowPress}
          onInfoArrowPress={spatialNavigation.handleHeroInfoArrowPress}
        />

        <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 md:px-5">
          <p className="text-[0.68rem] font-black uppercase tracking-[0.26em] text-zinc-300">
            Catalogo premium
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            Vitrine com imagens, metadados e destaque visual para leitura a distancia.
          </p>
        </div>

        {visibleCatalogSections.length === 0 ? (
          <section className="rounded-2xl border border-white/10 bg-black/40 px-6 py-10 text-center">
            <p className="text-[0.72rem] font-black uppercase tracking-[0.26em] text-xf-red">
              Catalogo indisponivel
            </p>
            <p className="mt-3 text-sm font-semibold text-zinc-300">
              Nenhuma secao foi carregada para a Home neste momento.
            </p>
          </section>
        ) : (
          visibleCatalogSections.map((section, categoryIndex) => {
            const sectionItems =
              isTv &&
              isProgressiveLoading &&
              categoryIndex === 0
                ? section.items.slice(0, INITIAL_TV_VISIBLE_ITEMS_PER_SECTION)
                : section.items;

            const sectionEyebrow =
              section.id === 'continue-watching'
                ? isMobile
                  ? 'Mobile'
                  : isTv
                    ? 'TV mode'
                    : 'Web'
                : section.eyebrow;

            return (
              <FocusableSection
                key={section.id}
                focusKey={getCategorySectionFocusKey(section.id)}
                className="mb-10 rounded-2xl border border-white/10 bg-black/45 px-4 py-5 md:px-5 md:py-6"
                onArrowPress={(direction) =>
                  spatialNavigation.handleCategorySectionArrowPress(
                    direction,
                    categoryIndex,
                  )
                }
              >
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[0.68rem] font-black uppercase tracking-[0.32em] text-xf-red">
                      {sectionEyebrow}
                    </p>

                    <h2 className="mt-2 text-2xl font-black text-white md:text-4xl">
                      {section.title}
                    </h2>

                    <p className="mt-2 max-w-3xl text-sm text-zinc-400">
                      {section.description ||
                        'Selecao pronta para navegacao rapida na tela principal.'}
                    </p>
                  </div>

                  <div className="hidden rounded-xl border border-white/15 bg-white/5 px-3 py-2 md:block">
                    <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                      Itens visiveis
                    </p>
                    <p className="text-lg font-black text-white">
                      {sectionItems.length}
                    </p>
                  </div>

                  {shouldShowSeeAll(section) && !isMobile && !isTv && (
                    <FocusableButton
                      focusKey={getCategorySeeAllFocusKey(section.id)}
                      className="inline-flex rounded-full border border-white/20 bg-xf-surface px-5 py-3 text-sm font-bold text-white"
                      onEnterPress={() => {
                        spatialDebug('catalog-grid', 'Ver tudo:', section.title);
                      }}
                      onArrowPress={(direction) =>
                        spatialNavigation.handleCategorySeeAllArrowPress(
                          direction,
                          categoryIndex,
                        )
                      }
                    >
                      Ver tudo
                    </FocusableButton>
                  )}
                </div>

                {sectionItems.length > 0 ? (
                  <div className="xf-carousel-row flex gap-4 overflow-x-auto overflow-y-visible pb-6 pr-8 scroll-smooth md:gap-5">
                    {sectionItems.map((item, itemIndex) => (
                      <MediaCard
                        key={item.id}
                        title={item.title}
                        subtitle={item.subtitle || getCatalogOverview(item)}
                        posterUrl={getCatalogPosterUrl(item)}
                        year={item.year}
                        rating={item.rating}
                        genres={item.genres}
                        mediaType={item.mediaType}
                        index={itemIndex}
                        focusKey={getCategoryItemFocusKey(section.id, itemIndex)}
                        onEnterPress={() => {
                          spatialDebug('catalog-grid', 'Abrir item:', item.title);
                        }}
                        onArrowPress={(direction) =>
                          spatialNavigation.handleCategoryCardArrowPress(
                            direction,
                            categoryIndex,
                            itemIndex,
                          )
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-5">
                    <p className="text-sm font-semibold text-zinc-300">
                      Esta secao esta vazia no momento.
                    </p>
                  </div>
                )}
              </FocusableSection>
            );
          })
        )}

        {isProgressiveLoading ? (
          <section className="mb-8 rounded-2xl border border-white/10 bg-black/35 px-4 py-5 md:px-5 md:py-6">
            <p className="text-[0.68rem] font-black uppercase tracking-[0.32em] text-zinc-300">
              Carregando mais secoes
            </p>

            <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
              {Array.from({ length: SECTION_LOADING_CARD_COUNT }).map(
                (_, placeholderIndex) => (
                  <div
                    key={`catalog-loading-card-${placeholderIndex}`}
                    className="h-[16rem] w-[11rem] shrink-0 animate-pulse rounded-2xl border border-white/10 bg-white/5"
                  />
                ),
              )}
            </div>
          </section>
        ) : null}
      </section>
    </AppShell>
  );
}
