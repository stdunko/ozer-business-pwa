import { useEffect } from "react";
import { Circle, MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

type MapViewProps = {
  latitude: number;
  longitude: number;
  onRegionChange?: (region: { latitude: number; longitude: number }) => void;
  markers?: Array<{ latitude: number; longitude: number }>;
  circleRadius?: number;
  interactive?: boolean;
  syncKey?: string | number;
};

const MoveHandler = ({
  onRegionChange,
}: {
  onRegionChange?: (region: { latitude: number; longitude: number }) => void;
}) => {
  useMapEvents({
    moveend: (event) => {
      const center = event.target.getCenter();
      onRegionChange?.({ latitude: center.lat, longitude: center.lng });
    },
  });
  return null;
};

const Recenter = ({
  latitude,
  longitude,
  syncKey,
}: {
  latitude: number;
  longitude: number;
  syncKey?: string | number;
}) => {
  const map = useMap();
  useEffect(() => {
    map.setView([latitude, longitude]);
  }, [map, syncKey]);
  return null;
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
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={15}
      zoomControl={interactive}
      dragging={interactive}
      scrollWheelZoom={interactive}
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {syncKey != null ? <Recenter latitude={latitude} longitude={longitude} syncKey={syncKey} /> : null}
      {onRegionChange ? <MoveHandler onRegionChange={onRegionChange} /> : null}
      {typeof circleRadius === "number" && circleRadius > 0 ? (
        <Circle
          center={[latitude, longitude]}
          radius={circleRadius}
          pathOptions={{ color: "#2D2D2D", fillColor: "#2D2D2D", fillOpacity: 0.15, weight: 2 }}
        />
      ) : null}
      {markers?.map((marker, index) => (
        <Marker key={`${marker.latitude}-${index}`} position={[marker.latitude, marker.longitude]} />
      ))}
    </MapContainer>
  );
};

export default MapView;
