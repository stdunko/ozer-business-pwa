import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import PrimaryButton from "../components/PrimaryButton";
import InstallBanner from "../components/InstallBanner";

const GreetingScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="screen screen-surface">
      <AppHeader title="Ozer Business" />
      <div className="pad-lg greeting-body">
        <div className="center-col">
          <img src="/logo.png" alt="Ozer Business" className="logo" />
          <p className="tagline">{t("logInFooterText")}</p>
        </div>
        <InstallBanner />
        <PrimaryButton title={t("logInButtonText")} onPress={() => navigate("/login/phone")} />
        <div style={{ textAlign: "center", padding: "24px 0 8px" }}>
          <img src="/favicon.png" alt="" width={36} height={36} style={{ opacity: 0.6, borderRadius: 8 }} />
        </div>
      </div>
    </div>
  );
};

export default GreetingScreen;
