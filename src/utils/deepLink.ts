const PENDING_PATH_KEY = "ozer-pending-path";

export const appPathFromUrl = (raw?: string | null) => {
  if (!raw) {
    return "";
  }
  try {
    const url = raw.startsWith("http") ? new URL(raw) : new URL(raw, window.location.origin);
    return `${url.pathname}${url.search}${url.hash}` || "/app/orders";
  } catch {
    return raw.startsWith("/") ? raw : "";
  }
};

export const rememberPendingPath = (path: string) => {
  if (path.startsWith("/app")) {
    sessionStorage.setItem(PENDING_PATH_KEY, path);
  }
};

export const peekPendingPath = () => {
  const path = sessionStorage.getItem(PENDING_PATH_KEY);
  return path && path.startsWith("/app") ? path : "";
};

export const takePendingPath = () => {
  const path = peekPendingPath();
  sessionStorage.removeItem(PENDING_PATH_KEY);
  return path;
};

export const NAVIGATE_EVENT = "ozer-navigate";
