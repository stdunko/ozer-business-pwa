import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, Navigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { checkOtp } from "../services/api";
import { useAppDispatch } from "../store/hooks";
import { setToken } from "../store/authSlice";
import { storage } from "../utils/storage";
import AppHeader from "../components/AppHeader";
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

  const submit = async (code: string) => {
    if (!code.trim() || isLoading) {
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

  const handleContinue = () => {
    void submit(otp.trim());
  };

  const handleOtpChange = (value: string) => {
    const next = value.replace(/\s/g, "");
    setOtp(next);
    if (hasOtpError) {
      setHasOtpError(false);
    }
    if (/^\d{6}$/.test(next)) {
      void submit(next);
    }
  };

  return (
    <div className="screen auth-screen">
      <AppHeader title="" back />
      <div className="auth-body">
        <div className="auth-hero">
          <div className="auth-hero-icon">
            <ShieldCheck size={36} />
          </div>
          <h2 className="auth-title">{t("otpHeaderText")}</h2>
          <p className="auth-subtitle">{t("otpSentTo", { phone })}</p>
        </div>
        <div className="auth-card">
          <input
            className={`otp-input ${hasOtpError ? "input-error" : ""}`}
            autoFocus
            value={otp}
            onChange={(e) => handleOtpChange(e.target.value)}
            placeholder="••••••"
            type="text"
            lang="en"
            autoComplete="one-time-code"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            inputMode="text"
            dir="ltr"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleContinue();
              }
            }}
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
    </div>
  );
};

export default EnterOtpScreen;
