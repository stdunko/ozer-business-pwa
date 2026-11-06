export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const WANT_KEY = "pwa-want-install";
const DISMISS_KEY = "pwa-install-dismissed";

let deferred: BeforeInstallPromptEvent | null = null;
const listeners = new Set<(event: BeforeInstallPromptEvent | null) => void>();

export function initPwaInstallCapture() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferred = event as BeforeInstallPromptEvent;
    listeners.forEach((listener) => listener(deferred));
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    sessionStorage.removeItem(WANT_KEY);
    listeners.forEach((listener) => listener(null));
  });
}

export function subscribeInstallPrompt(listener: (event: BeforeInstallPromptEvent | null) => void) {
  listeners.add(listener);
  if (deferred) listener(deferred);
  return () => {
    listeners.delete(listener);
  };
}

export function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

export function isIos() {
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export function wantsInstall() {
  if (new URLSearchParams(window.location.search).has("install")) {
    sessionStorage.setItem(WANT_KEY, "1");
    localStorage.removeItem(DISMISS_KEY);
    return true;
  }
  return sessionStorage.getItem(WANT_KEY) === "1";
}

export function wasInstallDismissed() {
  return localStorage.getItem(DISMISS_KEY) === "1";
}

export function dismissInstall() {
  localStorage.setItem(DISMISS_KEY, "1");
  sessionStorage.removeItem(WANT_KEY);
}
