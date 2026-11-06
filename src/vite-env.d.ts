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
        setZoom?: (zoom: number) => void;
        getDiv?: () => HTMLElement;
      };
      Marker: new (opts?: Record<string, unknown>) => {
        setMap: (map: unknown) => void;
      };
      Circle: new (opts?: Record<string, unknown>) => {
        setMap: (map: unknown) => void;
        setCenter: (latLng: { lat: number; lng: number }) => void;
        setRadius: (radius: number) => void;
      };
      Size: new (width: number, height: number) => unknown;
      Point: new (x: number, y: number) => unknown;
      RenderingType?: { RASTER: string; VECTOR: string };
      importLibrary?: (name: string) => Promise<unknown>;
      event: {
        addListener: (instance: unknown, name: string, handler: () => void) => unknown;
        addListenerOnce: (instance: unknown, name: string, handler: () => void) => unknown;
        removeListener: (listener: unknown) => void;
        trigger: (instance: unknown, name: string) => void;
        clearInstanceListeners?: (instance: unknown) => void;
      };
    };
  };
}
