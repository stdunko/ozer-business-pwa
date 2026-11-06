import { useTranslation } from "react-i18next";

const NameModal = ({ isVisible, onClose }: { isVisible: boolean; onClose: () => void }) => {
  const { t } = useTranslation();

  if (!isVisible) {
    return null;
  }

  return (
    <div className="modal-backdrop center" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="button" onClick={onClose} style={{ color: "var(--primary)", fontWeight: 700 }}>
            {t("closeGeo")}
          </button>
        </div>
        <p style={{ minHeight: 120, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          {t("nameModalText")}
        </p>
      </div>
    </div>
  );
};

export default NameModal;
