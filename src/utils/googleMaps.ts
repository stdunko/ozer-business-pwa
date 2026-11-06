import { appConfig } from "../config";

type LatLng = { latitude: number; longitude: number };

type GoogleMapInstance = {
  setCenter: (latLng: { lat: number; lng: number }) => void;
  getCenter: () => { lat: () => number; lng: () => number } | undefined;
  setOptions: (opts: Record<string, unknown>) => void;
  setZoom?: (zoom: number) => void;
  getDiv?: () => HTMLElement;
};

type LeafletMap = {
  setView: (latLng: [number, number], zoom?: number) => void;
  getCenter: () => { lat: number; lng: number };
  on: (name: string, handler: () => void) => void;
  off: (name: string, handler?: () => void) => void;
  invalidateSize: () => void;
  remove: () => void;
};

const CALLBACK = "__ozerGoogleMapsReady";
const TILE = 256;

export const googleMapsSearchUrl = ({ latitude, longitude }: LatLng) =>
  `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

export const googleEmbedUrl = ({ latitude, longitude }: LatLng, zoom = 15, marked = false) => {
  const pin = marked ? `q=${latitude},${longitude}&` : "";
  return `https://maps.google.com/maps?${pin}ll=${latitude},${longitude}&z=${zoom}&output=embed`;
};

export const shiftLatLng = (lat: number, lng: number, zoom: number, dx: number, dy: number): LatLng => {
  const scale = TILE * 2 ** zoom;
  const x = ((lng + 180) / 360) * scale - dx;
  const sin = Math.sin((lat * Math.PI) / 180);
  const y = (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale - dy;
  const n = Math.PI - (2 * Math.PI * y) / scale;
  return {
    longitude: (x / scale) * 360 - 180,
    latitude: (180 / Math.PI) * Math.atan(Math.sinh(n)),
  };
};

export const metersToPixels = (meters: number, lat: number, zoom: number) =>
  meters / (156543.03392 * Math.cos((lat * Math.PI) / 180) / 2 ** zoom);

export const accentPinIcon = (maps: NonNullable<Window["google"]>["maps"], color: string) => ({
  path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z",
  fillColor: color || "#2d2d2d",
  fillOpacity: 1,
  strokeColor: "#ffffff",
  strokeWeight: 1.25,
  scale: 1.7,
  anchor: new maps.Point(12, 22),
});

let mapsReady: Promise<void> | null = null;
let leafletReady: Promise<void> | null = null;

const injectMapsScript = () =>
  new Promise<void>((resolve, reject) => {
    const ready = () => {
      if (window.google?.maps?.importLibrary || window.google?.maps?.Map) {
        resolve();
        return;
      }
      mapsReady = null;
      reject(new Error("google maps"));
    };
    (window as Window & { [CALLBACK]?: () => void })[CALLBACK] = ready;
    const existing = document.querySelector<HTMLScriptElement>("script[src*='maps.googleapis.com/maps/api/js']");
    if (existing) {
      if (window.google?.maps?.importLibrary || window.google?.maps?.Map) {
        ready();
      } else {
        existing.addEventListener("load", ready, { once: true });
      }
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(appConfig.googleMapsApiKey)}&v=weekly&loading=async&callback=${CALLBACK}`;
    script.async = true;
    script.defer = true;
    script.referrerPolicy = "origin";
    script.onerror = () => {
      mapsReady = null;
      reject(new Error("google maps"));
    };
    document.head.appendChild(script);
  });

export const loadGoogleMaps = () => {
  if (mapsReady) {
    return mapsReady;
  }
  mapsReady = (async () => {
    try {
      if (!window.google?.maps?.importLibrary && !window.google?.maps?.Map) {
        await injectMapsScript();
      }
      if (window.google?.maps?.importLibrary) {
        await window.google.maps.importLibrary("maps");
      }
      if (!window.google?.maps?.Map) {
        throw new Error("google maps");
      }
    } catch (error) {
      mapsReady = null;
      throw error;
    }
  })();
  return mapsReady;
};

export const googleMapHasError = (root: HTMLElement) => Boolean(root.querySelector(".gm-err-container"));

export const googleMapIsReady = (root: HTMLElement) =>
  Boolean(root.querySelector(".gm-style")) && !googleMapHasError(root);

export const waitForGoogleMap = (root: HTMLElement, timeout = 2800) =>
  new Promise<boolean>((resolve) => {
    if (googleMapIsReady(root)) {
      resolve(true);
      return;
    }
    if (googleMapHasError(root)) {
      resolve(false);
      return;
    }
    const observer = new MutationObserver(() => {
      if (googleMapIsReady(root) || googleMapHasError(root)) {
        observer.disconnect();
        resolve(googleMapIsReady(root));
      }
    });
    observer.observe(root, { childList: true, subtree: true });
    window.setTimeout(() => {
      observer.disconnect();
      resolve(googleMapIsReady(root));
    }, timeout);
  });

export const attachGoogleMap = (parent: HTMLElement, opts: Record<string, unknown>): GoogleMapInstance => {
  const maps = window.google!.maps;
  parent.replaceChildren();
  const el = document.createElement("div");
  el.style.cssText = "width:100%;height:100%;touch-action:none";
  parent.appendChild(el);
  const renderingType = maps.RenderingType?.RASTER ?? "RASTER";
  return new maps.Map(el, { ...opts, renderingType });
};

export const detachGoogleMap = (map: GoogleMapInstance) => {
  try {
    window.google?.maps.event.clearInstanceListeners?.(map);
  } catch {
    /* ignore */
  }
  const host = map.getDiv?.()?.parentElement;
  host?.replaceChildren();
};

export const loadLeaflet = () => {
  const leaflet = (window as Window & { L?: unknown }).L;
  if (leaflet) {
    return Promise.resolve();
  }
  if (leafletReady) {
    return leafletReady;
  }
  leafletReady = new Promise((resolve, reject) => {
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(css);
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      leafletReady = null;
      reject(new Error("leaflet"));
    };
    document.head.appendChild(script);
  });
  return leafletReady;
};

export const attachLeafletMap = (
  parent: HTMLElement,
  center: { lat: number; lng: number },
  opts?: { interactive?: boolean }
): LeafletMap => {
  const L = (
    window as Window & {
      L: {
        map: (el: HTMLElement, opts?: Record<string, unknown>) => LeafletMap;
        tileLayer: (url: string, opts?: Record<string, unknown>) => { addTo: (map: LeafletMap) => void };
      };
    }
  ).L;
  parent.replaceChildren();
  const el = document.createElement("div");
  el.style.cssText = "width:100%;height:100%;touch-action:none";
  parent.appendChild(el);
  const interactive = opts?.interactive !== false;
  const map = L.map(el, {
    zoomControl: interactive,
    attributionControl: false,
    dragging: true,
    scrollWheelZoom: interactive,
    doubleClickZoom: interactive,
    touchZoom: true,
    boxZoom: interactive,
    keyboard: interactive,
  });
  map.setView([center.lat, center.lng], 15);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
  requestAnimationFrame(() => map.invalidateSize());
  window.setTimeout(() => map.invalidateSize(), 250);
  return map;
};
