import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  dismissInstall,
  isIos,
  isStandalone,
  subscribeInstallPrompt,
  wantsInstall,
  wasInstallDismissed,
  type BeforeInstallPromptEvent,
} from "../pwaInstall";

const InstallBanner = () => {
  const { t } = useTranslation();
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [open, setOpen] = useState(
    () => !isStandalone() && (wantsInstall() || isIos()) && !wasInstallDismissed(),
  );

  useEffect(() => {
    if (isStandalone()) return;
    return subscribeInstallPrompt((next) => {
      setEvent(next);
      if (next && (wantsInstall() || !wasInstallDismissed())) {
        setOpen(true);
      }
    });
  }, []);

  if (isStandalone() || !open) {
    return null;
  }

  const ios = isIos();
  const close = () => {
    dismissInstall();
    setOpen(false);
  };

  return createPortal(
    <div className="install-overlay" role="dialog" aria-modal="true">
      <div className="install-sheet">
        <h2>{t("installTitle")}</h2>
        <p>{ios ? t("installLeadIos") : t("installLeadAndroid")}</p>
        <ol className="install-steps">
          <li>{ios ? t("installIosStep1") : t("installAndroidStep1")}</li>
          <li>{ios ? t("installIosStep2") : t("installAndroidStep2")}</li>
        </ol>
        <div className="install-sheet-actions">
          {event && !ios ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={async () => {
                await event.prompt();
                const choice = await event.userChoice;
                if (choice.outcome === "accepted") {
                  dismissInstall();
                  setOpen(false);
                  setEvent(null);
                }
              }}
            >
              {t("installApp")}
            </button>
          ) : null}
          <button type="button" className="btn btn-secondary" onClick={close}>
            {t("installLater")}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default InstallBanner;
