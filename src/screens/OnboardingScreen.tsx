import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ClipboardList, Grid3x3, MessageCircle } from "lucide-react";
import LanguagePicker from "../components/LanguagePicker";
import PrimaryButton from "../components/PrimaryButton";
import { setOnboardingCompleted } from "../utils/onboarding";

const OnboardingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState(0);

  const finish = () => {
    setOnboardingCompleted();
    onComplete();
  };

  if (step === 0) {
    return (
      <div className="screen screen-surface pad-lg status-bar-fill">
        <div className="center-col">
          <img src="/logo.png" alt="OzerilBusiness" className="logo" style={{ width: 120, height: 120 }} />
          <h1 className="title-lg">{t("onboardingWelcomeTitle")}</h1>
          <p className="subtitle">{t("onboardingWelcomeSubtitle")}</p>
          <LanguagePicker selectedCode={i18n.language} />
        </div>
        <PrimaryButton title={t("onboardingNext")} onPress={() => setStep(1)} />
      </div>
    );
  }

  const slides = [
    { icon: Grid3x3, title: t("onboardingSlide1Title"), desc: t("onboardingSlide1Desc") },
    { icon: ClipboardList, title: t("onboardingSlide2Title"), desc: t("onboardingSlide2Desc") },
    { icon: MessageCircle, title: t("onboardingSlide3Title"), desc: t("onboardingSlide3Desc") },
  ];
  const current = slides[step - 1];
  const Icon = current.icon;
  const isLast = step === 3;

  return (
    <div className="screen screen-surface pad-lg status-bar-fill">
      {isLast ? (
        <div style={{ height: 36 }} />
      ) : (
        <button type="button" className="skip" onClick={finish}>
          {t("onboardingSkip")}
        </button>
      )}
      <div className="center-col">
        <Icon size={72} className="onboarding-icon" />
        <h2 className="title-md">{current.title}</h2>
        <p className="subtitle">{current.desc}</p>
      </div>
      <div className="dots">
        {[1, 2, 3].map((n) => (
          <div key={n} className={`dot ${n === step ? "active" : ""}`} />
        ))}
      </div>
      <PrimaryButton
        title={isLast ? t("onboardingStart") : t("onboardingNext")}
        onPress={() => (isLast ? finish() : setStep(step + 1))}
      />
    </div>
  );
};

export default OnboardingScreen;
