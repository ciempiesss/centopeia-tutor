import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

export type Platform = 'mobile' | 'tablet' | 'desktop' | 'web';
export type DeviceType = 'native-mobile' | 'native-tablet' | 'web-mobile' | 'web-tablet' | 'web-desktop';

interface PlatformInfo {
  platform: Platform;
  deviceType: DeviceType;
  isNative: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
  screenWidth: number;
  screenHeight: number;
}

// Breakpoints consistentes con Tailwind
const BREAKPOINTS = {
  sm: 640,   // Mobile landscape
  md: 768,   // Tablet
  lg: 1024,  // Desktop
  xl: 1280,  // Large desktop
};

export function usePlatform(): PlatformInfo {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isNative = Capacitor.isNativePlatform();
  const { width, height } = screenSize;

  // Detectar orientación y tamaño
  const isLandscape = width > height;
  const minDimension = Math.min(width, height);
  const maxDimension = Math.max(width, height);

  // Lógica de detección de plataforma
  let platform: Platform;
  let deviceType: DeviceType;
  let isMobile = false;
  let isTablet = false;
  let isDesktop = false;

  if (isNative) {
    // En nativo, usar tamaño de pantalla para detectar
    if (minDimension < 600) {
      platform = 'mobile';
      deviceType = 'native-mobile';
      isMobile = true;
    } else if (minDimension < 900) {
      platform = 'tablet';
      deviceType = 'native-tablet';
      isTablet = true;
    } else {
      platform = 'desktop';
      deviceType = 'native-tablet'; // Tablets grandes
      isTablet = true;
    }
  } else {
    // En web, usar breakpoints estándar
    if (width < BREAKPOINTS.md) {
      platform = 'mobile';
      deviceType = 'web-mobile';
      isMobile = true;
    } else if (width < BREAKPOINTS.lg) {
      platform = 'tablet';
      deviceType = 'web-tablet';
      isTablet = true;
    } else {
      platform = 'desktop';
      deviceType = 'web-desktop';
      isDesktop = true;
    }
  }

  // Detectar si es touch device
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  return {
    platform,
    deviceType,
    isNative,
    isMobile,
    isTablet,
    isDesktop,
    isTouch,
    screenWidth: width,
    screenHeight: height,
  };
}

// Hook para media queries
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

// Atajos de teclado (solo desktop)
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  const { isDesktop } = usePlatform();

  useEffect(() => {
    if (!isDesktop) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const modifiers = [
        e.ctrlKey ? 'ctrl' : '',
        e.altKey ? 'alt' : '',
        e.shiftKey ? 'shift' : '',
        e.metaKey ? 'meta' : '',
      ].filter(Boolean);

      const shortcutKey = [...modifiers, key].join('+');
      
      if (shortcuts[shortcutKey]) {
        e.preventDefault();
        shortcuts[shortcutKey]();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDesktop, shortcuts]);
}
