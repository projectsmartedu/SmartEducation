import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to track online/offline status
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return isOnline;
}

/**
 * Hook to manage service worker registration and updates
 */
export function useServiceWorker() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    // Register service worker only in production to avoid dev-time reloads
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          setRegistration(reg);

          reg.onupdatefound = () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.onstatechange = () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                }
              };
            }
          };
        })
        .catch((err) => console.warn('SW registration failed:', err));
    }
  }, []);

  const applyUpdate = useCallback(() => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      // In development, avoid forcing a full reload from code — let the
      // developer decide when to refresh. Log for visibility instead.
      if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
        try {
          // eslint-disable-next-line no-console
          console.debug('[useServiceWorker] requested SKIP_WAITING (dev)');
        } catch (_) {}
      } else {
        // In production, it's OK to reload to activate the new SW
        try {
          window.location.reload();
        } catch (_) {}
      }
    }
  }, [registration]);

  return { updateAvailable, applyUpdate, registration };
}
