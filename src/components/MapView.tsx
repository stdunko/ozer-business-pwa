import { useEffect, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  accentPinIcon,
  attachGoogleMap,
  attachLeafletMap,
  detachGoogleMap,
  googleEmbedUrl,
  googleMapHasError,
  googleMapsSearchUrl,
  loadGoogleMaps,
  loadLeaflet,
  metersToPixels,
  shiftLatLng,
  waitForGoogleMap,
} from "../utils/googleMaps";

type MapViewProps = {
  latitude: number;
  longitude: number;
  onRegionChange?: (region: { latitude: number; longitude: number }) => void;
  markers?: Array<{ latitude: number; longitude: number }>;
  circleRadius?: number;
  interactive?: boolean;
  syncKey?: string | number;
  centerPin?: boolean;
};

type GoogleMap = {
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

type LeafletLayer = {
  remove: () => void;
  setLatLng?: (latLng: [number, number]) => void;
  setRadius?: (radius: number) => void;
  addTo: (map: LeafletMap) => LeafletLayer;
};

type GoogleMarker = { setMap: (map: GoogleMap | null) => void };
type GoogleCircle = {
  setMap: (map: GoogleMap | null) => void;
  setCenter: (latLng: { lat: number; lng: number }) => void;
  setRadius: (radius: number) => void;
};

const pinColor = () =>
  getComputedStyle(document.documentElement).getPropertyValue("--primary").trim() || "#2d2d2d";

const leafletApi = () =>
  (
    window as Window & {
      L?: {
        circleMarker: (latLng: [number, number], opts: Record<string, unknown>) => LeafletLayer;
        circle: (latLng: [number, number], opts: Record<string, unknown>) => LeafletLayer;
      };
    }
  ).L;

const waitForSize = (el: HTMLElement, isCancelled: () => boolean) =>
  new Promise<void>((resolve) => {
    if (el.clientWidth > 0 && el.clientHeight > 0) {
      resolve();
      return;
    }
    const observer = new ResizeObserver(() => {
      if (el.clientWidth > 0 && el.clientHeight > 0) {
        observer.disconnect();
        resolve();
      }
    });
    observer.observe(el);
    window.setTimeout(() => {
      observer.disconnect();
      if (!isCancelled()) {
        resolve();
      }
    }, 1500);
  });

const MapView = ({
  latitude,
  longitude,
  onRegionChange,
  markers,
  circleRadius,
  interactive = true,
  syncKey,
  centerPin = false,
}: MapViewProps) => {
  const { t } = useTranslation();
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GoogleMap | null>(null);
  const leafletRef = useRef<LeafletMap | null>(null);
  const leafletMarkersRef = useRef<LeafletLayer[]>([]);
  const leafletCircleRef = useRef<LeafletLayer | null>(null);
  const markersRef = useRef<GoogleMarker[]>([]);
  const circleRef = useRef<GoogleCircle | null>(null);
  const onRegionChangeRef = useRef(onRegionChange);
  const coordsRef = useRef({ latitude, longitude });
  const skipIdleRef = useRef(false);
  const dragRef = useRef<{ x: number; y: number; lat: number; lng: number } | null>(null);
  const [ready, setReady] = useState(false);
  const [engine, setEngine] = useState<"google" | "embed" | "osm">("google");
  const [embed, setEmbed] = useState({ latitude, longitude, zoom: 15, shiftX: 0, shiftY: 0 });
  const openPoint = markers?.[0] ?? { latitude, longitude };
  const showOpen = Boolean(markers?.length);
  const markerKey = (markers || []).map((item) => `${item.latitude},${item.longitude}`).join("|");
  const picking = Boolean(onRegionChange);

  onRegionChangeRef.current = onRegionChange;
  coordsRef.current = { latitude, longitude };

  useEffect(() => {
    let cancelled = false;
    let switching = false;
    let idleListener: unknown;
    let moveHandler: (() => void) | null = null;
    let resizeObserver: ResizeObserver | null = null;
    const mapsApi = () => window.google?.maps;
    setReady(false);
    setEngine("google");
    setEmbed({ latitude, longitude, zoom: 15, shiftX: 0, shiftY: 0 });

    const startEmbed = (el: HTMLElement) => {
      if (switching) {
        return;
      }
      switching = true;
      if (mapRef.current) {
        detachGoogleMap(mapRef.current);
        mapRef.current = null;
      }
      el.replaceChildren();
      const current = coordsRef.current;
      setEmbed({ latitude: current.latitude, longitude: current.longitude, zoom: 15, shiftX: 0, shiftY: 0 });
      setEngine("embed");
      setReady(true);
    };

    void (async () => {
      window.gm_authFailure = () => undefined;
      const el = elRef.current;
      if (!el) {
        return;
      }
      await waitForSize(el, () => cancelled);
      if (cancelled || !el.isConnected) {
        return;
      }

      try {
        await loadGoogleMaps();
      } catch {
        if (!cancelled) {
          startEmbed(el);
        }
        return;
      }
      if (cancelled || !el.isConnected || !window.google?.maps?.Map) {
        startEmbed(el);
        return;
      }

      const maps = window.google.maps;
      const { latitude: lat, longitude: lng } = coordsRef.current;
      let map: GoogleMap;
      try {
        map = attachGoogleMap(el, {
          center: { lat, lng },
          zoom: 15,
          disableDefaultUI: true,
          zoomControl: interactive,
          gestureHandling: "greedy",
          draggable: true,
          scrollwheel: true,
          clickableIcons: false,
          keyboardShortcuts: false,
        });
      } catch {
        if (!cancelled) {
          startEmbed(el);
        }
        return;
      }
      mapRef.current = map;

      const refreshSize = () => {
        maps.event.trigger(map, "resize");
      };
      maps.event.addListenerOnce(map, "idle", () => {
        refreshSize();
        skipIdleRef.current = true;
        const current = coordsRef.current;
        map.setCenter({ lat: current.latitude, lng: current.longitude });
      });
      requestAnimationFrame(refreshSize);

      const healthy = await waitForGoogleMap(el);
      if (cancelled) {
        return;
      }
      if (!healthy || googleMapHasError(el)) {
        startEmbed(el);
        return;
      }

      idleListener = maps.event.addListener(map, "idle", () => {
        if (leafletRef.current || skipIdleRef.current) {
          skipIdleRef.current = false;
          return;
        }
        const center = map.getCenter();
        if (!center) {
          return;
        }
        const next = { lat: center.lat(), lng: center.lng() };
        circleRef.current?.setCenter(next);
        onRegionChangeRef.current?.({ latitude: next.lat, longitude: next.lng });
      });

      resizeObserver = new ResizeObserver(() => {
        if (leafletRef.current) {
          leafletRef.current.invalidateSize();
          return;
        }
        refreshSize();
      });
      resizeObserver.observe(el);
      setReady(true);
    })();

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      if (idleListener) {
        mapsApi()?.event.removeListener(idleListener);
      }
      leafletMarkersRef.current.forEach((marker) => marker.remove());
      leafletMarkersRef.current = [];
      leafletCircleRef.current?.remove();
      leafletCircleRef.current = null;
      if (leafletRef.current) {
        if (moveHandler) {
          leafletRef.current.off("moveend", moveHandler);
        }
        leafletRef.current.remove();
        leafletRef.current = null;
      }
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
      circleRef.current?.setMap(null);
      circleRef.current = null;
      if (mapRef.current) {
        detachGoogleMap(mapRef.current);
      }
      mapRef.current = null;
    };
  }, [interactive]);

  useEffect(() => {
    skipIdleRef.current = true;
    const current = coordsRef.current;
    if (engine === "embed") {
      setEmbed((prev) => ({ ...prev, latitude: current.latitude, longitude: current.longitude, shiftX: 0, shiftY: 0 }));
      return;
    }
    if (leafletRef.current && ready) {
      leafletRef.current.setView([current.latitude, current.longitude]);
      return;
    }
    const map = mapRef.current;
    if (!map || !ready) {
      return;
    }
    map.setCenter({ lat: current.latitude, lng: current.longitude });
  }, [syncKey, ready, engine]);

  useEffect(() => {
    const map = mapRef.current;
    const maps = window.google?.maps;
    if (!map || !maps || !ready || engine !== "google") {
      return;
    }
    markersRef.current.forEach((marker) => marker.setMap(null));
    const icon = accentPinIcon(maps, pinColor());
    markersRef.current = (markers || []).map(
      (marker) =>
        new maps.Marker({
          map,
          position: { lat: marker.latitude, lng: marker.longitude },
          icon,
        })
    );
  }, [markerKey, ready, engine]);

  useEffect(() => {
    const map = leafletRef.current;
    const L = leafletApi();
    if (!map || !L || !ready || engine !== "osm") {
      return;
    }
    leafletMarkersRef.current.forEach((marker) => marker.remove());
    const color = pinColor();
    leafletMarkersRef.current = (markers || []).map((marker) =>
      L.circleMarker([marker.latitude, marker.longitude], {
        radius: 9,
        color: "#fff",
        weight: 2,
        fillColor: color,
        fillOpacity: 1,
      }).addTo(map)
    );
  }, [markerKey, ready, engine]);

  useEffect(() => {
    const map = mapRef.current;
    const maps = window.google?.maps;
    if (!map || !maps || !ready || engine !== "google") {
      return;
    }
    if (typeof circleRadius !== "number" || circleRadius <= 0) {
      circleRef.current?.setMap(null);
      circleRef.current = null;
      return;
    }
    const color = pinColor();
    if (!circleRef.current) {
      circleRef.current = new maps.Circle({
        map,
        center: { lat: latitude, lng: longitude },
        radius: circleRadius,
        strokeColor: color,
        fillColor: color,
        fillOpacity: 0.15,
        strokeWeight: 2,
        clickable: false,
      });
      return;
    }
    circleRef.current.setCenter({ lat: latitude, lng: longitude });
    circleRef.current.setRadius(circleRadius);
  }, [circleRadius, latitude, longitude, ready, engine]);

  useEffect(() => {
    const map = leafletRef.current;
    const L = leafletApi();
    if (!map || !L || !ready || engine !== "osm") {
      return;
    }
    if (typeof circleRadius !== "number" || circleRadius <= 0) {
      leafletCircleRef.current?.remove();
      leafletCircleRef.current = null;
      return;
    }
    const color = pinColor();
    if (!leafletCircleRef.current) {
      leafletCircleRef.current = L.circle([latitude, longitude], {
        radius: circleRadius,
        color,
        fillColor: color,
        fillOpacity: 0.15,
        weight: 2,
        interactive: false,
      }).addTo(map);
      return;
    }
    leafletCircleRef.current.setLatLng?.([latitude, longitude]);
    leafletCircleRef.current.setRadius?.(circleRadius);
  }, [circleRadius, latitude, longitude, ready, engine]);

  const onEmbedPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!picking) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY, lat: embed.latitude, lng: embed.longitude };
  };

  const onEmbedPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) {
      return;
    }
    setEmbed((prev) => ({ ...prev, shiftX: event.clientX - drag.x, shiftY: event.clientY - drag.y }));
  };

  const onEmbedPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) {
      return;
    }
    dragRef.current = null;
    const next = shiftLatLng(drag.lat, drag.lng, embed.zoom, event.clientX - drag.x, event.clientY - drag.y);
    setEmbed((prev) => ({ ...prev, ...next, shiftX: 0, shiftY: 0 }));
    onRegionChangeRef.current?.(next);
  };

  const changeEmbedZoom = (delta: number) => {
    setEmbed((prev) => ({ ...prev, zoom: Math.min(20, Math.max(3, prev.zoom + delta)) }));
  };

  const radiusPx =
    engine === "embed" && typeof circleRadius === "number" && circleRadius > 0
      ? metersToPixels(circleRadius, embed.latitude, embed.zoom)
      : 0;
  const fallbackOsm = async () => {
    const el = elRef.current;
    if (!el || leafletRef.current) {
      return;
    }
    try {
      await loadLeaflet();
      if (!el.isConnected) {
        return;
      }
      const map = attachLeafletMap(el, { lat: embed.latitude, lng: embed.longitude }, { interactive });
      leafletRef.current = map;
      map.on("moveend", () => {
        const center = map.getCenter();
        onRegionChangeRef.current?.({ latitude: center.lat, longitude: center.lng });
      });
      setEngine("osm");
    } catch {
      /* keep embed */
    }
  };

  return (
    <div className="google-map-wrap">
      <div ref={elRef} className="google-map" hidden={engine === "embed"} />
      {engine === "embed" ? (
        <>
          <iframe
            className={`google-map map-embed ${picking ? "is-picked" : "is-live"}`}
            title="Google Maps"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={googleEmbedUrl(embed, embed.zoom, Boolean(markers?.length) && !centerPin)}
            style={{ transform: `translate(${embed.shiftX}px, ${embed.shiftY}px)` }}
            onError={() => void fallbackOsm()}
          />
          {picking ? (
            <div
              className="map-drag-layer"
              onPointerDown={onEmbedPointerDown}
              onPointerMove={onEmbedPointerMove}
              onPointerUp={onEmbedPointerUp}
              onPointerCancel={onEmbedPointerUp}
            />
          ) : null}
          {picking ? (
            <div className="map-embed-zoom">
              <button type="button" onClick={() => changeEmbedZoom(1)} aria-label="Zoom in">
                +
              </button>
              <button type="button" onClick={() => changeEmbedZoom(-1)} aria-label="Zoom out">
                −
              </button>
            </div>
          ) : null}
          {radiusPx > 8 ? (
            <span className="map-radius-circle" style={{ width: radiusPx * 2, height: radiusPx * 2 }} />
          ) : null}
        </>
      ) : null}
      {centerPin ? <span className="map-pin" aria-hidden /> : null}
      {showOpen ? (
        <a
          className="open-in-maps"
          href={googleMapsSearchUrl(openPoint)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink size={16} />
          {t("openInGoogleMaps")}
        </a>
      ) : null}
    </div>
  );
};

export default MapView;
