import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LANGUAGES, getLanguageByCode, type LanguageCode } from "../utils/languages";
import { changeAppLanguage } from "../services/i18n/changeLanguage";

const SelectLanguage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { t, i18n } = useTranslation();
  const current = getLanguageByCode(i18n.language);

  return (
    <>
      <button type="button" className="btn btn-primary" onClick={() => setIsVisible(true)}>
        {current.label}
      </button>
      {isVisible ? (
        <div className="modal-backdrop center" onClick={() => setIsVisible(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <p className="sheet-title" style={{ textAlign: "center", marginBottom: 16 }}>
              {t("onboardingSelectLanguage")}
            </p>
            <div className="lang-grid">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  className={`lang-item ${lang.code === current.code ? "selected" : ""}`}
                  onClick={async () => {
                    setIsVisible(false);
                    await changeAppLanguage(lang.code as LanguageCode);
                  }}
                >
                  <span className="lang-flag">{lang.flag}</span>
                  <span className="lang-label">{lang.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default SelectLanguage;
