import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Smartphone } from "lucide-react";
import { authLogin, authRegister } from "../services/api";
import AboutAppSheet from "../components/AboutAppSheet";
import { useNotifier } from "../components/AppNotifier";
import AppHeader from "../components/AppHeader";
import CountryFlag from "../components/CountryFlag";
import CountryPicker from "../components/CountryPicker";
import PrimaryButton from "../components/PrimaryButton";
import {
  DEFAULT_COUNTRY,
  normalizePhoneInput,
  replaceDialCode,
  resolveCountryFromPhone,
  type Country,
} from "../utils/countries";

const EnterNumberScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showApiError } = useNotifier();
  const [phone, setPhone] = useState(`+${DEFAULT_COUNTRY.dial}`);
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const handlePhoneChange = (value: string) => {
    const nextPhone = normalizePhoneInput(value);
    setPhone(nextPhone);
    setCountry((current) => resolveCountryFromPhone(nextPhone, current));
  };

  const handleSelectCountry = (next: Country) => {
    setPhone(replaceDialCode(phone, next));
    setCountry(next);
    setIsPickerOpen(false);
  };

  const handleContinue = async () => {
    setIsLoading(true);
    const { error } = await authLogin(phone);
    if (error) {
      const { error: regError } = await authRegister(phone);
      if (regError) {
        showApiError(regError, "errorAuth");
        setIsLoading(false);
        return;
      }
    }
    navigate("/login/otp", { state: { phone } });
    setIsLoading(false);
  };

  return (
    <div className="screen auth-screen">
      <AppHeader title="" back />
      <div className="auth-body">
        <div className="auth-hero">
          <div className="auth-hero-icon">
            <Smartphone size={36} />
          </div>
          <h2 className="auth-title">{t("logInNumberText")}</h2>
          <p className="auth-subtitle">{t("logInNumberUnderText")}</p>
        </div>
        <div className="auth-card">
          <div className="phone-input phone-input-lg">
            <button
              type="button"
              className="phone-flag-btn"
              onClick={() => setIsPickerOpen(true)}
              aria-label={t("selectCountry")}
            >
              <CountryFlag iso={country.iso} className="phone-flag" />
              <ChevronDown size={16} />
            </button>
            <input
              type="tel"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder={t("logInNumberText")}
              dir="ltr"
              autoComplete="tel"
              inputMode="tel"
            />
          </div>
          <PrimaryButton
            title={t("continue")}
            onPress={handleContinue}
            loading={isLoading}
            disabled={phone.length < 8 || isLoading}
          />
        </div>
        <button type="button" className="auth-about-btn" onClick={() => setAboutOpen(true)}>
          {t("aboutTitle")}
        </button>
        <p className="auth-footnote">{t("logInNumberFooterText")}</p>
      </div>
      <AboutAppSheet isVisible={aboutOpen} onClose={() => setAboutOpen(false)} />
      <CountryPicker
        isVisible={isPickerOpen}
        selectedIso={country.iso}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleSelectCountry}
      />
    </div>
  );
};

export default EnterNumberScreen;
