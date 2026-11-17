export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  type: 'lucky' | 'transit' | 'rahu' | 'moon' | 'muhurat';
  read: boolean;
}

export interface AutoDailyPushConfig {
  enabled: boolean;
  preferredTime: string; // e.g. '07:00'
  lastDispatchedDate: string; // YYYY-MM-DD
  platforms: {
    android: boolean;
    ios: boolean;
    windows: boolean;
    desktop: boolean;
    tablet: boolean;
  };
}

const PUSH_CONFIG_STORAGE_KEY = 'vedic_daily_auto_push_config_v1';

export function getAutoPushConfig(): AutoDailyPushConfig {
  try {
    const raw = localStorage.getItem(PUSH_CONFIG_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore storage errors
  }
  return {
    enabled: true,
    preferredTime: '07:00',
    lastDispatchedDate: '',
    platforms: {
      android: true,
      ios: true,
      windows: true,
      desktop: true,
      tablet: true,
    },
  };
}

export function saveAutoPushConfig(config: AutoDailyPushConfig): void {
  try {
    localStorage.setItem(PUSH_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // ignore storage errors
  }
}

export function detectDevicePlatform(): string {
  if (typeof navigator === 'undefined') return 'Desktop / Web';
  const ua = navigator.userAgent || '';
  if (/android/i.test(ua)) return 'Android Mobile / Tablet';
  if (/iPad|iPhone|iPod/.test(ua)) return 'iOS (iPhone / iPad)';
  if (/Win/i.test(ua)) return 'Windows Desktop / Tablet';
  if (/Mac/i.test(ua)) return 'macOS Desktop';
  return 'Cross-Platform Device';
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
}

export function sendBrowserNotification(title: string, options?: NotificationOptions): boolean {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }
  try {
    // Use ServiceWorker showNotification when available (required on Android Chrome & iOS Web Push)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg && 'showNotification' in reg) {
          reg.showNotification(title, {
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            ...options,
          });
        }
      }).catch(() => {
        // Fallback handled below
      });
    }

    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });
    return true;
  } catch (e) {
    console.error('Notification dispatch error:', e);
    return false;
  }
}

export function checkAndDispatchDailyAutoForecast(
  userName: string,
  personalDayNumber: number,
  dayPlanet: string,
  decisionIndex: number,
  luckyHours: string,
  luckyColor: string,
  mantra: string
): boolean {
  const config = getAutoPushConfig();
  if (!config.enabled) return false;

  const todayIso = new Date().toISOString().slice(0, 10);
  if (config.lastDispatchedDate === todayIso) {
    return false;
  }

  const dispatched = sendBrowserNotification(
    `🕉️ Daily Vedic & Numerology Forecast (${todayIso})`,
    {
      body: `Namaste ${userName}! Today's Personal Vibration: ${personalDayNumber} (${dayPlanet}) • Success Index: ${decisionIndex}%. Best Muhurat: ${luckyHours} • Lucky Colour: ${luckyColor} • Mantra: ${mantra}`,
      tag: `vedic-daily-forecast-${todayIso}`,
    }
  );

  if (dispatched) {
    saveAutoPushConfig({
      ...config,
      lastDispatchedDate: todayIso,
    });
  }
  return dispatched;
}

