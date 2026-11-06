import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronDown } from "lucide-react";
import { authLogin, authRegister } from "../services/api";
import { useNotifier } from "../components/AppNotifier";
import { useRtl } from "../hooks/useRtl";
import AppHeader from "../components/AppHeader";
import CountryFlag from "../components/CountryFlag";
import CountryPicker from "../components/CountryPicker";
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
  const { isRtl } = useRtl();
  const [phone, setPhone] = useState(`+${DEFAULT_COUNTRY.dial}`);
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="screen">
      <AppHeader title={t("logInNumberText")} back />
      <div className="pad grow">
        <p className="hint">{t("logInNumberUnderText")}</p>
        <div className="phone-row">
          <div className="phone-input">
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
          <button
            type="button"
            className="entry-btn"
            disabled={phone.length < 5 || isLoading}
            onClick={handleContinue}
          >
            {isLoading ? (
              <span className="spinner" style={{ borderTopColor: "#fff", width: 18, height: 18 }} />
            ) : (
              <ArrowRight size={22} style={{ transform: isRtl ? "scaleX(-1)" : undefined }} />
            )}
          </button>
        </div>
        <p className="hint">{t("logInNumberFooterText")}</p>
      </div>
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
