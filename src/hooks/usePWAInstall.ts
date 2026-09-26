import { useEffect, useState } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const INSTALLED_STORAGE_KEY = 'apex_bankroll_pwa_installed';

let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

function isRunningStandalone(): boolean {
  if (typeof window === 'undefined') return false;

  const isStandaloneMedia =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    window.matchMedia('(display-mode: window-controls-overlay)').matches;

  const isIOSStandalone =
    (window.navigator as unknown as { standalone?: boolean }).standalone === true;

  const isAndroidAppReferrer =
    typeof document !== 'undefined' && document.referrer.includes('android-app://');

  const isPwaLaunchParam =
    typeof window.location !== 'undefined' &&
    new URLSearchParams(window.location.search).get('source') === 'pwa';

  return isStandaloneMedia || isIOSStandalone || isAndroidAppReferrer || isPwaLaunchParam;
}

function detectInstalledState(): boolean {
  if (typeof window === 'undefined') return false;

  if (isRunningStandalone()) {
    try {
      localStorage.setItem(INSTALLED_STORAGE_KEY, 'true');
    } catch {
      // ignore storage errors
    }
    return true;
  }

  try {
    if (localStorage.getItem(INSTALLED_STORAGE_KEY) === 'true') {
      return true;
    }
  } catch {
    // ignore
  }

  return false;
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    // Only store prompt if not already running in standalone mode
    if (isRunningStandalone()) {
      globalDeferredPrompt = null;
      return;
    }
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    try {
      localStorage.removeItem(INSTALLED_STORAGE_KEY);
    } catch {
      // ignore
    }
    listeners.forEach((fn) => fn());
  });

  window.addEventListener('appinstalled', () => {
    globalDeferredPrompt = null;
    try {
      localStorage.setItem(INSTALLED_STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
    listeners.forEach((fn) => fn());
  });
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    globalDeferredPrompt
  );
  const [isInstalled, setIsInstalled] = useState<boolean>(() => detectInstalledState());
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const syncState = () => {
      setDeferredPrompt(globalDeferredPrompt);
      setIsInstalled(detectInstalledState());
    };

    syncState();

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice =
      /iphone|ipad|ipod/.test(userAgent) ||
      (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);

    const nav = window.navigator as any;
    if (typeof nav.getInstalledRelatedApps === 'function') {
      nav
        .getInstalledRelatedApps()
        .then((apps: any[]) => {
          if (Array.isArray(apps) && apps.length > 0) {
            try {
              localStorage.setItem(INSTALLED_STORAGE_KEY, 'true');
            } catch {
              // ignore
            }
            setIsInstalled(true);
          }
        })
        .catch(() => {});
    }

    listeners.add(syncState);
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener?.('change', syncState);

    return () => {
      listeners.delete(syncState);
      mediaQuery.removeEventListener?.('change', syncState);
    };
  }, []);

  const install = async () => {
    const promptEvent = deferredPrompt || globalDeferredPrompt;
    if (!promptEvent) return false;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'accepted') {
      globalDeferredPrompt = null;
      setDeferredPrompt(null);
      setIsInstalled(true);
      try {
        localStorage.setItem(INSTALLED_STORAGE_KEY, 'true');
      } catch {
        // ignore
      }
      listeners.forEach((fn) => fn());
      return true;
    }
    return false;
  };

  const markAsInstalled = () => {
    globalDeferredPrompt = null;
    setDeferredPrompt(null);
    setIsInstalled(true);
    try {
      localStorage.setItem(INSTALLED_STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
    listeners.forEach((fn) => fn());
  };

  const isInstallable = Boolean(deferredPrompt || globalDeferredPrompt);
  const canShowInstallUI = !isInstalled && (isInstallable || isIOS);

  return {
    isInstallable,
    isInstalled,
    isIOS,
    canShowInstallUI,
    install,
    markAsInstalled
  };
}
