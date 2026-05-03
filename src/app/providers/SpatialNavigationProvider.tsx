import { useEffect, type ReactNode } from 'react';
import {
  init,
  setKeyMap,
  setFocus,
  getCurrentFocusKey,
} from '@noriginmedia/norigin-spatial-navigation';

import { useDeviceType } from '../../hooks/useDeviceType';

interface SpatialNavigationProviderProps {
  children: ReactNode;
}

export function SpatialNavigationProvider({
  children,
}: SpatialNavigationProviderProps) {
  const { isTv } = useDeviceType();

  useEffect(() => {
    init({
      debug: true,
      visualDebug: false,
      nativeMode: false,
      throttle: 0,
      throttleKeypresses: false,
    });

    setKeyMap({
      left: [37, 21],
      up: [38, 19],
      right: [39, 22],
      down: [40, 20],
      enter: [13, 23, 66],
    });

    // Ensure initial focus
    const timer = setTimeout(() => {
      const currentFocus = getCurrentFocusKey();
      console.log('[Xandeflix Focus] Current focus on boot:', currentFocus || 'NONE');
      if (!currentFocus) {
        const initialFocus = isTv ? 'sidebar-home' : 'mobile-home';
        console.log('[Xandeflix Focus] Setting initial focus to:', initialFocus);
        setFocus(initialFocus);
      }
    }, 1500);

    const handleKeyDown = (event: KeyboardEvent) => {
      const currentFocus = getCurrentFocusKey();
      console.log(`[Xandeflix KeyDown] Key: ${event.key} | Current Focus: ${currentFocus || 'NONE'} | Target: ${(event.target as HTMLElement)?.tagName}`);
    };

    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isTv]);

  return children;
}