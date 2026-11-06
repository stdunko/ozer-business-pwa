import { useEffect, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  accentPinIcon,
  attachGoogleMap,
  detachGoogleMap,
  googleMapsSearchUrl,
  loadGoogleMaps,
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

type GoogleMarker = {
  setMap: (map: GoogleMap | null) => void;
};

type GoogleCircle = {
  setMap: (map: GoogleMap | null) => void;
  setCenter: (latLng: { lat: number; lng: number }) => void;
  setRadius: (radius: number) => void;
};

const pinColor = () =>
  getComputedStyle(document.documentElement).getPropertyValue("--primary").trim() || "#2d2d2d";

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
  const markersRef = useRef<GoogleMarker[]>([]);
  const circleRef = useRef<GoogleCircle | null>(null);
  const onRegionChangeRef = useRef(onRegionChange);
  const coordsRef = useRef({ latitude, longitude });
  const skipIdleRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const openPoint = markers?.[0] ?? { latitude, longitude };
  const showOpen = Boolean(markers?.length);
  const markerKey = (markers || []).map((item) => `${item.latitude},${item.longitude}`).join("|");

  onRegionChangeRef.current = onRegionChange;
  coordsRef.current = { latitude, longitude };

  useEffect(() => {
    let cancelled = false;
    let idleListener: unknown;
    let resizeObserver: ResizeObserver | null = null;
    let visibilityObserver: IntersectionObserver | null = null;
    const mapsApi = () => window.google?.maps;
    setReady(false);

    void (async () => {
      window.gm_authFailure = () => {
        if (!cancelled) {
          setFailed(true);
        }
      };
      try {
        await loadGoogleMaps();
      } catch {
        if (!cancelled) {
          setFailed(true);
        }
        return;
      }
      const el = elRef.current;
      if (cancelled || !el || !window.google?.maps) {
        return;
      }
      await waitForSize(el, () => cancelled);
      if (cancelled || !el.isConnected || !window.google?.maps) {
        return;
      }

      const maps = window.google.maps;
      const { latitude: lat, longitude: lng } = coordsRef.current;
      const map = attachGoogleMap(el, {
        center: { lat, lng },
        zoom: 15,
        disableDefaultUI: true,
        zoomControl: interactive,
        gestureHandling: interactive ? "greedy" : "none",
        draggable: interactive,
        clickableIcons: false,
        keyboardShortcuts: false,
      });
      mapRef.current = map;

      const refresh = () => {
        maps.event.trigger(map, "resize");
        const current = coordsRef.current;
        skipIdleRef.current = true;
        map.setCenter({ lat: current.latitude, lng: current.longitude });
      };
      maps.event.addListenerOnce(map, "idle", refresh);
      requestAnimationFrame(refresh);

      idleListener = maps.event.addListener(map, "idle", () => {
        if (skipIdleRef.current) {
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
        maps.event.trigger(map, "resize");
      });
      resizeObserver.observe(el);
      visibilityObserver = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio > 0)) {
          refresh();
        }
      });
      visibilityObserver.observe(el);
      if (!cancelled) {
        setReady(true);
      }
    })();

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      visibilityObserver?.disconnect();
      if (idleListener) {
        mapsApi()?.event.removeListener(idleListener);
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
    const map = mapRef.current;
    if (!map || !ready) {
      return;
    }
    skipIdleRef.current = true;
    map.setCenter({ lat: latitude, lng: longitude });
  }, [syncKey, ready]);

  useEffect(() => {
    const map = mapRef.current;
    const maps = window.google?.maps;
    if (!map || !maps || !ready) {
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
  }, [markerKey, ready]);

  useEffect(() => {
    const map = mapRef.current;
    const maps = window.google?.maps;
    if (!map || !maps || !ready) {
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
  }, [circleRadius, latitude, longitude, ready]);

  if (failed) {
    return (
      <div className="google-map-wrap">
        <iframe
          className="google-map"
          title="Google Maps"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://maps.google.com/maps?q=${openPoint.latitude},${openPoint.longitude}&z=15&output=embed`}
        />
        <a
          className="open-in-maps"
          href={googleMapsSearchUrl(openPoint)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink size={16} />
          {t("openInGoogleMaps")}
        </a>
      </div>
    );
  }

  return (
    <div className="google-map-wrap">
      <div ref={elRef} className="google-map" />
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
