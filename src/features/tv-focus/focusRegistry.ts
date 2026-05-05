// src/features/tv-focus/focusRegistry.ts

import { useCallback, type MutableRefObject, type RefCallback } from 'react';

type FocusKey = string;

const mountedTargets = new Map<FocusKey, HTMLElement>();
const knownTargets = new Set<FocusKey>();

function assignRef<T>(
  ref: MutableRefObject<T | null> | RefCallback<T> | undefined,
  value: T | null,
) {
  if (!ref) return;

  if (typeof ref === 'function') {
    ref(value);
    return;
  }

  ref.current = value;
}

export function registerFocusTarget(focusKey: FocusKey, element: HTMLElement) {
  if (!focusKey || !element) return;

  knownTargets.add(focusKey);
  mountedTargets.set(focusKey, element);

  element.setAttribute('data-xf-focus-key', focusKey);
}

export function unregisterFocusTarget(focusKey: FocusKey, element?: HTMLElement | null) {
  if (!focusKey) return;

  const current = mountedTargets.get(focusKey);

  if (!element || current === element) {
    mountedTargets.delete(focusKey);
  }
}

export function wasFocusTargetKnown(focusKey: FocusKey) {
  return knownTargets.has(focusKey);
}

export function isFocusTargetMounted(focusKey: FocusKey) {
  if (typeof document === 'undefined') return false;

  const element = mountedTargets.get(focusKey);

  return Boolean(element && document.contains(element));
}

export function getFirstMountedFocusTarget(fallbacks: string[]) {
  return fallbacks.find((focusKey) => isFocusTargetMounted(focusKey));
}

export function useRegisteredFocusableRef<T extends HTMLElement>(
  focusKey: string,
  spatialRef?: MutableRefObject<T | null> | RefCallback<T>,
) {
  return useCallback(
    (node: T | null) => {
      assignRef(spatialRef, node);

      if (node) {
        registerFocusTarget(focusKey, node);
        return;
      }

      unregisterFocusTarget(focusKey);
    },
    [focusKey, spatialRef],
  );
}