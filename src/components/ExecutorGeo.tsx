import { useTranslation } from "react-i18next";
import MapView from "./MapView";

type ExecutorGeoProps = {
  latitude: number;
  longitude: number;
  isVisible: boolean;
  onClose: () => void;
};

const ExecutorGeo = ({ latitude, longitude, isVisible, onClose }: ExecutorGeoProps) => {
  const { t } = useTranslation();

  if (!isVisible) {
    return null;
  }

  return (
    <div className="modal-backdrop center" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <button type="button" onClick={onClose} style={{ color: "var(--primary)", fontWeight: 600 }}>
            {t("closeGeo")}
          </button>
        </div>
        <div className="map-wrap" style={{ height: 300, borderRadius: 12 }}>
          <MapView
            latitude={latitude || 0}
            longitude={longitude || 0}
            markers={latitude && longitude ? [{ latitude, longitude }] : undefined}
            interactive
          />
        </div>
      </div>
    </div>
  );
};

export default ExecutorGeo;
