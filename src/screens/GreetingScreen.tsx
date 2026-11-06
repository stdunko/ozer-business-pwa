import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import PrimaryButton from "../components/PrimaryButton";
import InstallBanner from "../components/InstallBanner";

const GreetingScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="screen auth-screen">
      <AppHeader
        title="OzerilBusiness"
        avatar={<img src="/logo.png" alt="" className="header-brand-logo" />}
      />
      <div className="auth-body">
        <div className="auth-hero">
          <div className="auth-hero-icon">
            <img src="/logo.png" alt="" className="auth-hero-logo" />
          </div>
          <h2 className="auth-title">OzerilBusiness</h2>
          <p className="auth-subtitle">{t("logInFooterText")}</p>
        </div>
        <div className="auth-card">
          <InstallBanner />
          <PrimaryButton title={t("logInButtonText")} onPress={() => navigate("/login/phone")} />
        </div>
      </div>
    </div>
  );
};

export default GreetingScreen;
