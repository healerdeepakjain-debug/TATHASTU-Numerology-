import { useState, useEffect, useCallback } from 'react';
import { TATHASTU_OFFICIAL_APP_URL, TATHASTU_APP_NAME } from './tathastuStore';

export type PlatformMode = 'auto' | 'windows' | 'mobile';

const PLATFORM_CHANGE_EVENT = 'tathastu:platform-change';

/**
 * Detects the active platform route mode from URL path or query parameters:
 * - /windows or /desktop or ?platform=windows  -> 'windows' (Full-Page Desktop App & Report)
 * - /mobile or /tablet or /app or ?platform=mobile -> 'mobile' (Mobile/Tablet & Play Store App)
 * - / (default) -> 'auto'
 */
export function detectPlatformMode(): PlatformMode {
  if (typeof window === 'undefined') return 'windows';
  try {
    const pathname = (window.location.pathname || '/').toLowerCase().replace(/\/+$/, '') || '/';
    const params = new URLSearchParams(window.location.search || '');
    const qPlatform = (params.get('platform') || '').toLowerCase();

    if (
      pathname === '/windows' ||
      pathname.startsWith('/windows/') ||
      pathname === '/desktop' ||
      pathname.startsWith('/desktop/') ||
      qPlatform === 'windows' ||
      qPlatform === 'desktop'
    ) {
      return 'windows';
    }

    if (
      pathname === '/mobile' ||
      pathname.startsWith('/mobile/') ||
      pathname === '/tablet' ||
      pathname.startsWith('/tablet/') ||
      pathname === '/app' ||
      pathname.startsWith('/app/') ||
      pathname === '/play' ||
      qPlatform === 'mobile' ||
      qPlatform === 'tablet' ||
      qPlatform === 'android'
    ) {
      return 'mobile';
    }

    // Automatic device/viewport detection: mobile screens or mobile UAs always open in Mobile view;
    // desktop/laptop screens (>= 1024px) automatically open in Desktop/Windows view.
    const ua = navigator.userAgent || '';
    const isMobileUa = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua);
    if (isMobileUa || window.innerWidth < 1024) {
      return 'mobile';
    }
    return 'windows';
  } catch {
    // Ignore URL parse errors
  }
  return 'windows';
}

export interface PlatformLinksInfo {
  currentOrigin: string;
  windowsLiveUrl: string;
  mobileLiveUrl: string;
  windowsOfficialUrl: string;
  mobileOfficialUrl: string;
  assetLinksUrl: string;
}

/**
 * Returns the public shareable URLs for Windows Full-Page (/windows) and Mobile/Tablet Play Store (/mobile).
 * Automatically uses the official published domain (TATHASTU_OFFICIAL_APP_URL) instead of internal
 * ais-dev / ais-pre / localhost / WebViewAssetLoader preview hosts.
 */
export function getPlatformLinks(): PlatformLinksInfo {
  const officialBase = TATHASTU_OFFICIAL_APP_URL.replace(/\/+$/, '');
  let publicBase = officialBase;
  if (typeof window !== 'undefined' && window.location?.origin) {
    const origin = window.location.origin.replace(/\/+$/, '');
    const isInternalHost =
      origin.includes('//ais-dev-') ||
      origin.includes('//ais-pre-') ||
      origin.includes('//localhost') ||
      origin.includes('//127.0.0.1') ||
      origin.includes('appassets.androidplatform.net');
    if ((origin.startsWith('http://') || origin.startsWith('https://')) && !isInternalHost) {
      publicBase = origin;
    }
  }

  return {
    currentOrigin: publicBase,
    windowsLiveUrl: `${publicBase}/windows`,
    mobileLiveUrl: `${publicBase}/mobile`,
    windowsOfficialUrl: `${officialBase}/windows`,
    mobileOfficialUrl: `${officialBase}/mobile`,
    assetLinksUrl: `${publicBase}/.well-known/assetlinks.json`,
  };
}

/**
 * Switches between /windows, /mobile, and / cleanly using History API
 * while preserving query params and active login/profile session state.
 */
export function navigateToPlatformMode(target: PlatformMode): void {
  if (typeof window === 'undefined') return;
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete('platform');

    // When running inside bundled Android WebViewAssetLoader (/assets/index.html), use query param
    if (url.pathname.includes('/assets/index.html')) {
      if (target !== 'auto') {
        url.searchParams.set('platform', target);
      }
      window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`);
    } else {
      const nextPath =
        target === 'windows' ? '/windows' : target === 'mobile' ? '/mobile' : '/';
      window.history.pushState({}, '', `${nextPath}${url.search}${url.hash}`);
    }

    window.dispatchEvent(new CustomEvent(PLATFORM_CHANGE_EVENT, { detail: { mode: target } }));
  } catch {
    // Fallback
  }
}

function syncDocumentPlatformMetadata(mode: PlatformMode): void {
  if (typeof document === 'undefined') return;

  document.documentElement.dataset.platformMode = mode;
  document.body.classList.toggle('tathastu-windows-fullpage', mode === 'windows');
  document.body.classList.toggle('tathastu-mobile-app-mode', mode === 'mobile');

  const manifestHref =
    mode === 'windows'
      ? '/manifest-windows.json?v=4'
      : mode === 'mobile'
        ? '/manifest-mobile.json?v=4'
        : '/manifest.json?v=4';

  const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null;
  if (manifestLink && manifestLink.getAttribute('href') !== manifestHref) {
    manifestLink.setAttribute('href', manifestHref);
  }

  document.title =
    mode === 'windows'
      ? `${TATHASTU_APP_NAME} — Windows Full-Page Edition`
      : mode === 'mobile'
        ? `${TATHASTU_APP_NAME} — Mobile & Tablet App`
        : TATHASTU_APP_NAME;
}

export function usePlatformMode() {
  const [mode, setMode] = useState<PlatformMode>(() => detectPlatformMode());

  useEffect(() => {
    const sync = () => {
      const detected = detectPlatformMode();
      setMode(detected);
      syncDocumentPlatformMetadata(detected);
    };

    sync();

    window.addEventListener('popstate', sync);
    window.addEventListener(PLATFORM_CHANGE_EVENT, sync);
    window.addEventListener('resize', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener(PLATFORM_CHANGE_EVENT, sync);
      window.removeEventListener('resize', sync);
    };
  }, []);

  const switchPlatformMode = useCallback((nextMode: PlatformMode) => {
    navigateToPlatformMode(nextMode);
    setMode(nextMode);
    syncDocumentPlatformMetadata(nextMode);
  }, []);

  const links = getPlatformLinks();

  return {
    mode,
    isWindowsFullPage: mode === 'windows',
    isMobileAppMode: mode === 'mobile',
    switchPlatformMode,
    ...links,
  };
}
