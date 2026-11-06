import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

type AboutAppSheetProps = {
  isVisible: boolean;
  onClose: () => void;
};

const AboutAppSheet = ({ isVisible, onClose }: AboutAppSheetProps) => {
  const { t } = useTranslation();

  if (!isVisible) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="sheet filters-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="handle" />
        <div className="sheet-header">
          <h2 className="sheet-title">{t("aboutTitle")}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label={t("close")}>
            <X size={22} />
          </button>
        </div>
        <div className="sheet-body">
          <p className="about-lead">{t("aboutLead")}</p>
          <div className="profile-card about-card">
            <a className="about-row" href="mailto:info@ozer.co.il">
              <span className="muted">{t("contactEmail")}</span>
              <span>info@ozer.co.il</span>
            </a>
            <a className="about-row" href="mailto:support@ozer.co.il">
              <span className="muted">{t("contactSupport")}</span>
              <span>support@ozer.co.il</span>
            </a>
            <a className="about-row" href="mailto:privacy@ozer.co.il">
              <span className="muted">{t("contactPrivacy")}</span>
              <span>privacy@ozer.co.il</span>
            </a>
            <a className="about-row" href="https://ozeril.co.il" target="_blank" rel="noreferrer">
              <span className="muted">{t("contactWeb")}</span>
              <span>ozeril.co.il</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutAppSheet;
