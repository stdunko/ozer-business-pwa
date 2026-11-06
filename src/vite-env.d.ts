/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module "*.svg" {
  const src: string;
  export default src;
}

interface Window {
  gm_authFailure?: () => void;
  google?: {
    maps: {
      Map: new (el: HTMLElement, opts?: Record<string, unknown>) => {
        setCenter: (latLng: { lat: number; lng: number }) => void;
        getCenter: () => { lat: () => number; lng: () => number } | undefined;
        setOptions: (opts: Record<string, unknown>) => void;
      };
      Marker: new (opts?: Record<string, unknown>) => {
        setMap: (map: unknown) => void;
      };
      Circle: new (opts?: Record<string, unknown>) => {
        setMap: (map: unknown) => void;
        setCenter: (latLng: { lat: number; lng: number }) => void;
        setRadius: (radius: number) => void;
      };
      event: {
        addListener: (instance: unknown, name: string, handler: () => void) => unknown;
        removeListener: (listener: unknown) => void;
      };
    };
  };
}
