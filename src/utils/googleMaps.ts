import { appConfig } from "../config";

type LatLng = { latitude: number; longitude: number };

export const googleMapsSearchUrl = ({ latitude, longitude }: LatLng) =>
  `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

let mapsReady: Promise<void> | null = null;

export const loadGoogleMaps = () => {
  if (window.google?.maps) {
    return Promise.resolve();
  }
  if (mapsReady) {
    return mapsReady;
  }
  mapsReady = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(appConfig.googleMapsApiKey)}`;
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
