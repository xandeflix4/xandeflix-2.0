import { Info, Play } from 'lucide-react';
import { setFocus } from '@noriginmedia/norigin-spatial-navigation';

import { FocusableButton } from '../tv/FocusableButton';
import { FocusableSection } from '../tv/FocusableSection';
import { FOCUS_KEYS } from '../../lib/spatial/focusKeys';

const HERO_SCROLL_OPTIONS: ScrollIntoViewOptions = {
  behavior: 'smooth',
  block: 'start',
  inline: 'nearest',
};

export function CatalogHero() {
  function handlePlay() {
    console.log('[D-Pad] Assistir agora');
  }

  function handleMoreInfo() {
    console.log('[D-Pad] Mais informações');
  }

  function focusFirstMediaCard() {
    setFocus(FOCUS_KEYS.FIRST_MEDIA_CARD);
    return false;
  }

  function focusHeaderSearch() {
    setFocus(FOCUS_KEYS.HEADER_SEARCH_BUTTON);
    return false;
  }

  function focusHeaderProfile() {
    setFocus(FOCUS_KEYS.HEADER_PROFILE_BUTTON);
    return false;
  }

  return (
    <FocusableSection
      focusKey={FOCUS_KEYS.CATALOG_HERO_SECTION}
      focusScrollOptions={HERO_SCROLL_OPTIONS}
      onArrowPress={(direction) => {
        if (direction === 'down') {
          return focusFirstMediaCard();
        }

        return true;
      }}
      className="hero-gradient relative mb-10 flex min-h-[520px] overflow-hidden rounded-3xl border border-white/5 bg-xf-surface p-6 md:p-10 lg:min-h-[620px]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(229,9,20,0.26),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_38%)]" />

      <div className="relative z-10 flex max-w-3xl flex-col justify-center">
        <p className="mb-4 text-sm font-black uppercase tracking-[0.4em] text-xf-red">
          Destaque
        </p>

        <h1 className="font-display text-5xl font-black leading-none text-white md:text-7xl lg:text-8xl">
          Xandeflix 2.0
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-7 text-xf-muted md:text-xl md:leading-8">
          Base premium preparada para streaming em Android Mobile, Android TV,
          Tizen, webOS e navegador. Interface otimizada para toque e controle
          remoto.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <FocusableButton
            focusKey={FOCUS_KEYS.HERO_PLAY_BUTTON}
            focusScrollTarget="closest-section"
            focusScrollOptions={HERO_SCROLL_OPTIONS}
            className="inline-flex items-center justify-center gap-3 rounded-xl bg-xf-red px-7 py-4 text-lg font-black text-white"
            onEnterPress={handlePlay}
            onArrowPress={(direction) => {
              if (direction === 'up') {
                return focusHeaderSearch();
              }

              if (direction === 'down') {
                return focusFirstMediaCard();
              }

              return true;
            }}
          >
            <Play size={24} fill="white" />
            Assistir agora
          </FocusableButton>

          <FocusableButton
            focusKey={FOCUS_KEYS.HERO_INFO_BUTTON}
            focusScrollTarget="closest-section"
            focusScrollOptions={HERO_SCROLL_OPTIONS}
            className="inline-flex items-center justify-center gap-3 rounded-xl bg-white/10 px-7 py-4 text-lg font-black text-white"
            onEnterPress={handleMoreInfo}
            onArrowPress={(direction) => {
              if (direction === 'up') {
                return focusHeaderProfile();
              }

              if (direction === 'down') {
                return focusFirstMediaCard();
              }

              return true;
            }}
          >
            <Info size={24} />
            Mais informações
          </FocusableButton>
        </div>
      </div>
    </FocusableSection>
  );
}