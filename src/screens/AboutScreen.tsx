import { useTranslation } from "react-i18next";
import AppHeader from "../components/AppHeader";

const AboutScreen = () => {
  const { t } = useTranslation();

  return (
    <div className="screen">
      <AppHeader title={t("aboutTitle")} back />
      <div className="scroll pad">
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
          <a className="about-row" href="https://ozer.co.il" target="_blank" rel="noreferrer">
            <span className="muted">{t("contactWeb")}</span>
            <span>ozer.co.il</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutScreen;
