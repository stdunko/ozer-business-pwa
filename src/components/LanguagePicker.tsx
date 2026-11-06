import { useTranslation } from "react-i18next";
import { LANGUAGES } from "../utils/languages";
import { changeAppLanguage } from "../services/i18n/changeLanguage";

const LanguagePicker = ({ selectedCode }: { selectedCode: string }) => {
  const { t } = useTranslation();

  return (
    <div style={{ width: "100%" }}>
      <p className="subtitle" style={{ marginBottom: 16, fontWeight: 600, color: "var(--text)" }}>
        {t("onboardingSelectLanguage")}
      </p>
      <div className="lang-grid">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            className={`lang-item ${lang.code === selectedCode ? "selected" : ""}`}
            onClick={() => changeAppLanguage(lang.code)}
          >
            <span className="lang-flag">{lang.flag}</span>
            <span className="lang-label">{lang.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguagePicker;
