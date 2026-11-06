import { useState } from "react";
import { LANGUAGES, getLanguageByCode, type LanguageCode } from "../utils/languages";
import { changeAppLanguage } from "../services/i18n/changeLanguage";
import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { i18n } = useTranslation();
  const currentLanguage = getLanguageByCode(i18n.language);

  const handleLanguageChange = async (lang: LanguageCode) => {
    setIsVisible(false);
    await changeAppLanguage(lang);
  };

  return (
    <>
      <button type="button" className="flag-btn" onClick={() => setIsVisible(true)} aria-label="Language">
        {currentLanguage.flag}
      </button>
      {isVisible ? (
        <div className="modal-backdrop center" onClick={() => setIsVisible(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <p className="sheet-title" style={{ textAlign: "center", marginBottom: 16 }}>
              Язык / Language
            </p>
            <div className="lang-grid">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  className={`lang-item ${lang.code === currentLanguage.code ? "selected" : ""}`}
                  onClick={() => handleLanguageChange(lang.code)}
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

export default LanguageSwitcher;
