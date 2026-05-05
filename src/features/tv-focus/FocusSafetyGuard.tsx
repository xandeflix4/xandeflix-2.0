// src/features/tv-focus/FocusSafetyGuard.tsx

import { useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react';
import {
  getCurrentFocusKey,
  setFocus,
} from '@noriginmedia/norigin-spatial-navigation';

import { CATALOG_FOCUS_FALLBACKS } from './focusKeys';
import {
  getFirstMountedFocusTarget,
  isFocusTargetMounted,
  wasFocusTargetKnown,
} from './focusRegistry';

type FocusSafetyGuardProps = {
  children: ReactNode;
  enabled?: boolean;
  fallbacks?: string[];
};

const RESTORE_DELAY_MS = 80;
const VERIFY_DELAY_MS = 90;
const RESTORE_COOLDOWN_MS = 450;
const MAX_ATTEMPTS = 4;

function isSpatialDebugEnabled() {
  return import.meta.env.VITE_SPATIAL_DEBUG === 'true';
}

function spatialDebug(message: string, payload?: unknown) {
  if (!isSpatialDebugEnabled()) return;

  if (payload === undefined) {
    console.log(`[XANDEFLIX:FOCUS_SAFETY] ${message}`);
    return;
  }

  console.log(`[XANDEFLIX:FOCUS_SAFETY] ${message}`, payload);
}

function safeGetCurrentFocusKey() {
  try {
    return getCurrentFocusKey();
  } catch (error) {
    spatialDebug('Falha ao ler getCurrentFocusKey()', error);
    return undefined;
  }
}

function isPossiblyLostFocus() {
  const currentFocusKey = safeGetCurrentFocusKey();

  if (!currentFocusKey) {
    return true;
  }

  const wasKnown = wasFocusTargetKnown(currentFocusKey);

  if (wasKnown && !isFocusTargetMounted(currentFocusKey)) {
    return true;
  }

  return false;
}

export function FocusSafetyGuard({
  children,
  enabled = true,
  fallbacks,
}: FocusSafetyGuardProps) {
  const fallbackList = useMemo(
    () => fallbacks?.filter(Boolean) ?? CATALOG_FOCUS_FALLBACKS,
    [fallbacks],
  );

  const pendingTimerRef = useRef<number | null>(null);
  const restoringRef = useRef(false);
  const lastRestoreAtRef = useRef(0);

  const clearPendingTimer = useCallback(() => {
    if (pendingTimerRef.current === null) return;

    window.clearTimeout(pendingTimerRef.current);
    pendingTimerRef.current = null;
  }, []);

  const restoreFocus = useCallback(
    (reason: string) => {
      if (!enabled) return;
      if (restoringRef.current) return;

      const now = Date.now();

      if (now - lastRestoreAtRef.current < RESTORE_COOLDOWN_MS) {
        return;
      }

      if (!isPossiblyLostFocus()) {
        return;
      }

      restoringRef.current = true;
      lastRestoreAtRef.current = now;

      const firstMountedFallback = getFirstMountedFocusTarget(fallbackList);

      const candidates = [
        ...(firstMountedFallback ? [firstMountedFallback] : []),
        ...fallbackList.filter((focusKey) => focusKey !== firstMountedFallback),
      ];

      let attempt = 0;

      spatialDebug('Iniciando recuperação de foco', {
        reason,
        current: safeGetCurrentFocusKey(),
        candidates,
      });

      const tryNextCandidate = () => {
        if (attempt >= MAX_ATTEMPTS || attempt >= candidates.length) {
          restoringRef.current = false;

          spatialDebug('Recuperação encerrada sem foco confirmado', {
            reason,
            current: safeGetCurrentFocusKey(),
          });

          return;
        }

        const targetFocusKey = candidates[attempt];
        attempt += 1;

        if (!targetFocusKey) {
          tryNextCandidate();
          return;
        }

        spatialDebug('Tentando restaurar foco', {
          reason,
          targetFocusKey,
          attempt,
        });

        try {
          setFocus(targetFocusKey);
        } catch (error) {
          spatialDebug('setFocus falhou', {
            targetFocusKey,
            error,
          });
        }

        window.setTimeout(() => {
          const currentFocusKey = safeGetCurrentFocusKey();

          if (currentFocusKey && !isPossiblyLostFocus()) {
            restoringRef.current = false;

            spatialDebug('Foco restaurado com sucesso', {
              reason,
              currentFocusKey,
            });

            return;
          }

          tryNextCandidate();
        }, VERIFY_DELAY_MS);
      };

      tryNextCandidate();
    },
    [enabled, fallbackList],
  );

  const scheduleRestore = useCallback(
    (reason: string) => {
      if (!enabled) return;
      if (typeof window === 'undefined') return;

      clearPendingTimer();

      pendingTimerRef.current = window.setTimeout(() => {
        pendingTimerRef.current = null;
        restoreFocus(reason);
      }, RESTORE_DELAY_MS);
    },
    [clearPendingTimer, enabled, restoreFocus],
  );

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === 'undefined') return;

    const keysThatMayChangeFocus = new Set([
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'Enter',
      'Backspace',
      'Escape',
    ]);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!keysThatMayChangeFocus.has(event.key)) return;

      scheduleRestore(`keydown:${event.key}`);
    };

    const handleWindowFocus = () => {
      scheduleRestore('window-focus');
    };

    const handlePageShow = () => {
      scheduleRestore('page-show');
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        scheduleRestore('visibility-visible');
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('pageshow', handlePageShow);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    scheduleRestore('mount');

    return () => {
      clearPendingTimer();

      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('pageshow', handlePageShow);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [clearPendingTimer, enabled, scheduleRestore]);

  return <>{children}</>;
}