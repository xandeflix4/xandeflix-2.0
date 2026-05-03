import { FOCUS_KEYS, type FocusKey } from './focusKeys';

export interface RouteInitialFocusConfig {
  routeName: string;
  initialFocusKey: FocusKey;
  fallbackFocusKeys: FocusKey[];
}

const LOGIN_INITIAL_FOCUS: RouteInitialFocusConfig = {
  routeName: 'login',
  initialFocusKey: FOCUS_KEYS.LOGIN_TEST_BUTTON,
  fallbackFocusKeys: [
    FOCUS_KEYS.LOGIN_SUBMIT_BUTTON,
    FOCUS_KEYS.LOGIN_EMAIL_INPUT,
    FOCUS_KEYS.LOGIN_PASSWORD_INPUT,
  ],
};

const CATALOG_INITIAL_FOCUS: RouteInitialFocusConfig = {
  routeName: 'catalog',
  initialFocusKey: FOCUS_KEYS.HERO_PLAY_BUTTON,
  fallbackFocusKeys: [
    FOCUS_KEYS.HERO_INFO_BUTTON,
    FOCUS_KEYS.CONTINUE_SEE_ALL,
    FOCUS_KEYS.SIDEBAR_HOME,
    FOCUS_KEYS.MOBILE_HOME,
  ],
};

export function getRouteInitialFocus(
  pathname: string,
): RouteInitialFocusConfig {
  if (pathname === '/login') {
    return LOGIN_INITIAL_FOCUS;
  }

  if (pathname === '/') {
    return CATALOG_INITIAL_FOCUS;
  }

  return CATALOG_INITIAL_FOCUS;
}