import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, Navigate } from "react-router-dom";
import { checkOtp } from "../services/api";
import { useAppDispatch } from "../store/hooks";
import { setToken } from "../store/authSlice";
import { storage } from "../utils/storage";
import AppHeader from "../components/AppHeader";
import AppTextInput from "../components/AppTextInput";
import PrimaryButton from "../components/PrimaryButton";

const EnterOtpScreen = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const phone = (location.state as { phone?: string } | null)?.phone;
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasOtpError, setHasOtpError] = useState(false);

  if (!phone) {
    return <Navigate to="/login/phone" replace />;
  }

  const handleContinue = async () => {
    const code = otp.trim();
    if (!code) {
      return;
    }
    setIsLoading(true);
    setHasOtpError(false);
    const { response, error } = await checkOtp(code, phone);
    if (error) {
      setHasOtpError(true);
      setIsLoading(false);
      return;
    }
    const token = (response?.data?.access_token ?? response?.data?.accessToken) as string | undefined;
    if (!token) {
      setHasOtpError(true);
      setIsLoading(false);
      return;
    }
    storage.set("token", token);
    dispatch(setToken(token));
    setIsLoading(false);
  };

  return (
    <div className="screen">
      <AppHeader title={t("otpHeaderText")} back />
      <div className="pad grow">
        <p className="hint">{t("logInNumberUnderText")}</p>
        <AppTextInput
          forceLtr
          autoFocus
          placeholder={t("otpHeaderText")}
          value={otp}
          onChange={(e) => {
            setOtp(e.target.value);
            if (hasOtpError) setHasOtpError(false);
          }}
          type="text"
          lang="en"
          autoComplete="one-time-code"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          inputMode="text"
          error={hasOtpError}
          style={{ textAlign: "center" }}
        />
        {hasOtpError ? <p className="error-text">{t("otpInvalid")}</p> : null}
        <PrimaryButton
          title={t("logIn")}
          onPress={handleContinue}
          loading={isLoading}
          disabled={isLoading || !otp.trim()}
        />
      </div>
    </div>
  );
};

export default EnterOtpScreen;
