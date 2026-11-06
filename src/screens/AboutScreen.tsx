import { useTranslation } from "react-i18next";
import AppHeader from "../components/AppHeader";

const AboutScreen = () => {
  const { t } = useTranslation();

  return (
    <div className="screen">
      <AppHeader title={t("aboutTitle")} back />
      <div className="scroll pad">
        <h2 className="title-md" style={{ textAlign: "start" }}>
          {t("aboutWorksTitle")}
        </h2>
        <ul className="about-list">
          <li>{t("aboutWorks1")}</li>
          <li>{t("aboutWorks2")}</li>
          <li>{t("aboutWorks3")}</li>
          <li>{t("aboutWorks4")}</li>
          <li>{t("aboutWorks5")}</li>
        </ul>

        <h2 className="title-md" style={{ textAlign: "start", marginTop: 24 }}>
          {t("aboutBrokenTitle")}
        </h2>
        <ul className="about-list">
          <li>{t("aboutBroken1")}</li>
          <li>{t("aboutBroken2")}</li>
          <li>{t("aboutBroken3")}</li>
          <li>{t("aboutBroken4")}</li>
        </ul>

        <h2 className="title-md" style={{ textAlign: "start", marginTop: 24 }}>
          {t("aboutFixTitle")}
        </h2>
        <ul className="about-list">
          <li>{t("aboutFix1")}</li>
          <li>{t("aboutFix2")}</li>
          <li>{t("aboutFix3")}</li>
        </ul>
      </div>
    </div>
  );
};

export default AboutScreen;
