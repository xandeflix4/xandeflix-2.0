import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  getCurrentFocusKey,
  setFocus,
} from '@noriginmedia/norigin-spatial-navigation';

import { ROUTE_FOCUS_RETRY_DELAYS_MS } from '../lib/spatial/focusKeys';
import { getRouteInitialFocus } from '../lib/spatial/routeInitialFocus';

const ENABLE_FOCUS_LOGS = true;

function getFocusableElement(focusKey: string): HTMLElement | null {
  if (typeof document === 'undefined') {
    return null;
  }

  return document.querySelector<HTMLElement>(`[data-nav-id="${focusKey}"]`);
}

function focusKeyExistsInDom(focusKey: string): boolean {
  return Boolean(getFocusableElement(focusKey));
}

function scrollFocusedElementIntoView(focusKey: string) {
  const element = getFocusableElement(focusKey);

  element?.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
    inline: 'nearest',
  });
}

function logFocus(message: string, payload?: unknown) {
  if (!ENABLE_FOCUS_LOGS) {
    return;
  }

  console.log(`[Xandeflix RouteFocus] ${message}`, payload ?? '');
}

export function useRouteInitialFocus() {
  const { pathname } = useLocation();

  useEffect(() => {
    const routeFocus = getRouteInitialFocus(pathname);

    const candidates = [
      routeFocus.initialFocusKey,
      ...routeFocus.fallbackFocusKeys,
    ];

    let cancelled = false;
    const timers: number[] = [];

    function trySetRouteFocus(attempt: number) {
      if (cancelled) {
        return;
      }

      const currentFocusKey = getCurrentFocusKey();
      const currentFocusStillExists = currentFocusKey
        ? focusKeyExistsInDom(currentFocusKey)
        : false;

      const targetFocusKey = candidates.find((candidate) =>
        focusKeyExistsInDom(candidate),
      );

      logFocus(`Attempt ${attempt}`, {
        pathname,
        routeName: routeFocus.routeName,
        currentFocusKey: currentFocusKey || 'NONE',
        currentFocusStillExists,
        targetFocusKey: targetFocusKey || 'NOT_FOUND',
        candidates,
      });

      if (!targetFocusKey) {
        return;
      }

      setFocus(targetFocusKey);
      scrollFocusedElementIntoView(targetFocusKey);

      logFocus('Focus applied', {
        pathname,
        targetFocusKey,
      });
    }

    const animationFrameId = window.requestAnimationFrame(() => {
      trySetRouteFocus(0);

      ROUTE_FOCUS_RETRY_DELAYS_MS.forEach((delay, index) => {
        const timer = window.setTimeout(() => {
          trySetRouteFocus(index + 1);
        }, delay);

        timers.push(timer);
      });
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(animationFrameId);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [pathname]);
}