import { createPortal } from "react-dom";
import { X } from "lucide-react";
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

  return createPortal(
    <div className="geo-overlay" onClick={onClose}>
      <div className="geo-popup" onClick={(event) => event.stopPropagation()}>
        <div className="geo-popup-head">
          <h2 className="geo-popup-title">{t("openGeo")}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label={t("close")}>
            <X size={22} />
          </button>
        </div>
        <div className="geo-popup-map">
          <MapView
            latitude={latitude || 0}
            longitude={longitude || 0}
            markers={latitude && longitude ? [{ latitude, longitude }] : undefined}
            interactive
          />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ExecutorGeo;
