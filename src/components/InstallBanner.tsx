import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const InstallBanner = () => {
  const { t } = useTranslation();
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!event) {
    return null;
  }

  return (
    <div className="install-banner">
      <span>{t("installApp")}</span>
      <button
        type="button"
        className="btn btn-primary"
        style={{ width: "auto", minHeight: 40, padding: "8px 16px" }}
        onClick={async () => {
          await event.prompt();
          setEvent(null);
        }}
      >
        {t("installApp")}
      </button>
    </div>
  );
};

export default InstallBanner;
