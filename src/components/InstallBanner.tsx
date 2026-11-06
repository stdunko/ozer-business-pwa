import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  dismissInstall,
  getDeferredPrompt,
  isIos,
  isStandalone,
  subscribeInstallPrompt,
  waitForInstallPrompt,
  wantsInstall,
  wasInstallDismissed,
  type BeforeInstallPromptEvent,
} from "../pwaInstall";

const InstallBanner = () => {
  const { t } = useTranslation();
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [busy, setBusy] = useState(false);
  const [manual, setManual] = useState(false);
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

  const addToHome = async () => {
    if (ios || busy) return;
    setBusy(true);
    try {
      const promptEvent = event ?? getDeferredPrompt() ?? (await waitForInstallPrompt());
      if (!promptEvent) {
        setManual(true);
        return;
      }
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === "accepted") {
        dismissInstall();
        setOpen(false);
        setEvent(null);
      }
    } finally {
      setBusy(false);
    }
  };

  return createPortal(
    <div className="install-overlay" role="dialog" aria-modal="true">
      <div className="install-sheet">
        <h2>{t("installTitle")}</h2>
        <p>{ios ? t("installLeadIos") : t("installLeadAndroid")}</p>
        {ios || manual ? (
          <ol className="install-steps">
            <li>{ios ? t("installIosStep1") : t("installAndroidStep1")}</li>
            <li>{ios ? t("installIosStep2") : t("installAndroidStep2")}</li>
          </ol>
        ) : null}
        <div className="install-sheet-actions">
          {ios ? null : (
            <button type="button" className="btn btn-primary" disabled={busy} onClick={addToHome}>
              {t("installAdd")}
            </button>
          )}
          <button type="button" className="btn btn-secondary" disabled={busy} onClick={close}>
            {t("installLater")}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default InstallBanner;
