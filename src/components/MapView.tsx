import { useEffect, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { googleMapsSearchUrl, loadGoogleMaps } from "../utils/googleMaps";

type MapViewProps = {
  latitude: number;
  longitude: number;
  onRegionChange?: (region: { latitude: number; longitude: number }) => void;
  markers?: Array<{ latitude: number; longitude: number }>;
  circleRadius?: number;
  interactive?: boolean;
  syncKey?: string | number;
};

type GoogleMap = {
  setCenter: (latLng: { lat: number; lng: number }) => void;
  getCenter: () => { lat: () => number; lng: () => number } | undefined;
  setOptions: (opts: Record<string, unknown>) => void;
};

type GoogleMarker = {
  setMap: (map: GoogleMap | null) => void;
};

type GoogleCircle = {
  setMap: (map: GoogleMap | null) => void;
  setCenter: (latLng: { lat: number; lng: number }) => void;
  setRadius: (radius: number) => void;
};

const MapView = ({
  latitude,
  longitude,
  onRegionChange,
  markers,
  circleRadius,
  interactive = true,
  syncKey,
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
      if (cancelled || !elRef.current || !window.google?.maps) {
        return;
      }

      const maps = window.google.maps;
      const { latitude: lat, longitude: lng } = coordsRef.current;
      const map =
        mapRef.current ??
        new maps.Map(elRef.current, {
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
      map.setOptions({
        zoomControl: interactive,
        gestureHandling: interactive ? "greedy" : "none",
        draggable: interactive,
      });

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
      setReady(true);
    })();

    return () => {
      cancelled = true;
      if (idleListener) {
        window.google?.maps.event.removeListener(idleListener);
      }
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
    markersRef.current = (markers || []).map(
      (marker) =>
        new maps.Marker({
          map,
          position: { lat: marker.latitude, lng: marker.longitude },
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
    const color =
      getComputedStyle(document.documentElement).getPropertyValue("--primary").trim() || "#2d2d2d";
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
