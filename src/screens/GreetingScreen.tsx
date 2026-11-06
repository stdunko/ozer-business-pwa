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
      <AppHeader
        title="OzerilBusiness"
        avatar={<img src="/logo.png" alt="" className="header-brand-logo" />}
      />
      <div className="pad-lg greeting-body">
        <div className="center-col">
          <img src="/logo.png" alt="OzerilBusiness" className="logo" />
          <p className="tagline">{t("logInFooterText")}</p>
        </div>
        <InstallBanner />
        <PrimaryButton title={t("logInButtonText")} onPress={() => navigate("/login/phone")} />
      </div>
    </div>
  );
};

export default GreetingScreen;
