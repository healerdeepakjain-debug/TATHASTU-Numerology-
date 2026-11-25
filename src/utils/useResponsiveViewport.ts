import { useState, useEffect } from 'react';
import { detectPlatformMode, PlatformMode } from './platformMode';

export interface ResponsiveViewportState {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  orientation: 'portrait' | 'landscape';
  isStandalonePwa: boolean;
  platformMode: PlatformMode;
  isWindowsFullPage: boolean;
  isMobileAppMode: boolean;
}

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

export function isMobileDeviceDetected(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const platformMode = detectPlatformMode();
  if (platformMode === 'windows') return false;
  if (platformMode === 'mobile') return true;

  const width = window.innerWidth || document.documentElement.clientWidth || 1024;
  const ua = navigator.userAgent || '';
  const isMobileUa = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua);
  const isTabletTouchUa =
    (/ipad|tablet/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) &&
    width <= TABLET_BREAKPOINT;
  const hasCoarseTouchPointer =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: coarse) and (hover: none)').matches &&
    width <= TABLET_BREAKPOINT;

  return width < MOBILE_BREAKPOINT || isMobileUa || isTabletTouchUa || hasCoarseTouchPointer;
}

function detectTouchOrMobileUa(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const hasCoarsePointer =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: coarse)').matches;
  const mobileUa = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    navigator.userAgent || ''
  );
  return hasCoarsePointer || mobileUa;
}

function readViewportState(): ResponsiveViewportState {
  if (typeof window === 'undefined') {
    return {
      width: 1280,
      height: 800,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isTouchDevice: false,
      orientation: 'landscape',
      isStandalonePwa: false,
      platformMode: 'auto',
      isWindowsFullPage: false,
      isMobileAppMode: false,
    };
  }

  const platformMode = detectPlatformMode();
  const isWindowsFullPage = platformMode === 'windows';
  const isMobileAppMode = platformMode === 'mobile';

  const width = window.innerWidth || document.documentElement.clientWidth || 1024;
  const height = window.innerHeight || document.documentElement.clientHeight || 768;
  const isTouchDevice = detectTouchOrMobileUa();
  const isMobile = isWindowsFullPage
    ? false
    : isMobileAppMode
      ? width < TABLET_BREAKPOINT || isTouchDevice
      : isMobileDeviceDetected();
  const isTablet = !isWindowsFullPage && width >= MOBILE_BREAKPOINT && width <= TABLET_BREAKPOINT;
  const isDesktop = isWindowsFullPage || (!isMobile && width > TABLET_BREAKPOINT);
  const orientation = height >= width ? 'portrait' : 'landscape';
  const isStandalonePwa =
    (typeof window.matchMedia === 'function' &&
      window.matchMedia('(display-mode: standalone)').matches) ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true;

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    orientation,
    isStandalonePwa,
    platformMode,
    isWindowsFullPage,
    isMobileAppMode,
  };
}

export function useResponsiveViewport(): ResponsiveViewportState {
  const [viewport, setViewport] = useState<ResponsiveViewportState>(readViewportState);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncViewport = () => {
      const next = readViewportState();
      setViewport(next);
      document.documentElement.dataset.viewMode = next.isWindowsFullPage
        ? 'windows-fullpage'
        : next.isMobileAppMode
          ? 'mobile-app'
          : next.isMobile
            ? 'mobile'
            : 'desktop';
      document.documentElement.dataset.orientation = next.orientation;
      document.body.classList.toggle('tathastu-mobile-view', next.isMobile && !next.isWindowsFullPage);
      document.body.classList.toggle('tathastu-desktop-view', !next.isMobile || next.isWindowsFullPage);
      document.body.classList.toggle('tathastu-windows-fullpage', next.isWindowsFullPage);
      document.body.classList.toggle('tathastu-mobile-app-mode', next.isMobileAppMode);
    };

    syncViewport();

    window.addEventListener('resize', syncViewport, { passive: true });
    window.addEventListener('orientationchange', syncViewport, { passive: true });
    window.addEventListener('popstate', syncViewport);
    window.addEventListener('tathastu:platform-change', syncViewport);
    return () => {
      window.removeEventListener('resize', syncViewport);
      window.removeEventListener('orientationchange', syncViewport);
      window.removeEventListener('popstate', syncViewport);
      window.removeEventListener('tathastu:platform-change', syncViewport);
    };
  }, []);

  return viewport;
}
