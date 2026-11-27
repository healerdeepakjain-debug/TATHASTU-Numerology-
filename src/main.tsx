import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress benign Vite HMR WebSocket rejection in AI Studio preview where HMR is disabled
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const msg = event?.reason?.message || String(event?.reason || '');
    if (msg.includes('WebSocket closed without opened') || msg.includes('vite')) {
      event.preventDefault();
    }
  });

  // Automatic silent OTA version sync on open & resume (no Play Store update needed)
  if (
    'serviceWorker' in navigator &&
    window.location.hostname.indexOf('ais-dev-') === -1 &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    const hadControllerAtBoot = Boolean(navigator.serviceWorker.controller);
    let hasRefreshedForNewSw = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // Never reload on first-ever SW claim (which replays the intro splash & music twice)
      if (!hadControllerAtBoot || hasRefreshedForNewSw) return;
      hasRefreshedForNewSw = true;
      try {
        // Ensure a silent OTA update reload never replays the intro splash graphics & music a second time
        window.sessionStorage.setItem('tathastu_skip_intro_once', '1');
      } catch {
        // Ignore storage errors
      }
      window.location.reload();
    });

    const triggerSilentUpdateCheck = () => {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => {
          regs.forEach((reg) => {
            reg.update().catch(() => {});
          });
        })
        .catch(() => {});
    };

    window.addEventListener('load', () => {
      // Wait until after intro splash finishes before checking for OTA SW updates
      setTimeout(triggerSilentUpdateCheck, 6500);
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        triggerSilentUpdateCheck();
      }
    });
    window.addEventListener('focus', triggerSilentUpdateCheck);
  }
}

createRoot(document.getElementById('root')!).render(<App />);
