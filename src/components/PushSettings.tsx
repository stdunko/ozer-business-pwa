import { useState } from "react";
import { useTranslation } from "react-i18next";
import { readPushPrefs, savePushPrefs, type PushPrefs } from "../utils/pushI18n";

const PushSettings = () => {
  const { t } = useTranslation();
  const [prefs, setPrefs] = useState(readPushPrefs);

  const toggle = (key: keyof PushPrefs) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    savePushPrefs(next);
  };

  return (
    <div className="profile-card">
      <h2 className="section-heading">{t("pushSettings")}</h2>
      <label className="push-toggle">
        <span>{t("pushNotifyOrders")}</span>
        <input type="checkbox" checked={prefs.orders} onChange={() => toggle("orders")} />
      </label>
      <label className="push-toggle">
        <span>{t("pushNotifyChats")}</span>
        <input type="checkbox" checked={prefs.chats} onChange={() => toggle("chats")} />
      </label>
    </div>
  );
};

export default PushSettings;
