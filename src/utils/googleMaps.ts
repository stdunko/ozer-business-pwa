import { appConfig } from "../config";

type LatLng = { latitude: number; longitude: number };

type GoogleMapInstance = {
  setCenter: (latLng: { lat: number; lng: number }) => void;
  getCenter: () => { lat: () => number; lng: () => number } | undefined;
  setOptions: (opts: Record<string, unknown>) => void;
  setZoom?: (zoom: number) => void;
  getDiv?: () => HTMLElement;
};

export const googleMapsSearchUrl = ({ latitude, longitude }: LatLng) =>
  `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

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
let pooledEl: HTMLDivElement | null = null;
let pooledMap: GoogleMapInstance | null = null;

export const loadGoogleMaps = () => {
  if (window.google?.maps) {
    return Promise.resolve();
  }
  if (mapsReady) {
    return mapsReady;
  }
  mapsReady = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(appConfig.googleMapsApiKey)}&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.maps) {
        resolve();
        return;
      }
      mapsReady = null;
      reject(new Error("google maps"));
    };
    script.onerror = () => {
      mapsReady = null;
      reject(new Error("google maps"));
    };
    document.head.appendChild(script);
  });
  return mapsReady;
};

export const attachGoogleMap = (parent: HTMLElement, opts: Record<string, unknown>): GoogleMapInstance => {
  const maps = window.google!.maps;
  const center = opts.center as { lat: number; lng: number };
  if (pooledMap && pooledEl && !pooledEl.isConnected) {
    parent.appendChild(pooledEl);
    pooledMap.setOptions(opts);
    pooledMap.setCenter(center);
    pooledMap.setZoom?.(15);
    maps.event.trigger(pooledMap, "resize");
    return pooledMap;
  }
  const el = document.createElement("div");
  el.style.cssText = "width:100%;height:100%";
  parent.appendChild(el);
  const map = new maps.Map(el, { ...opts, renderingType: "RASTER" });
  if (!pooledMap) {
    pooledEl = el;
    pooledMap = map;
  }
  return map;
};

export const detachGoogleMap = (map: GoogleMapInstance) => {
  if (map === pooledMap && pooledEl) {
    pooledEl.remove();
    return;
  }
  map.getDiv?.()?.remove();
};
