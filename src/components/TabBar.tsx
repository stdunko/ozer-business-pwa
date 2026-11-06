import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ClipboardList, MessageCircle, User } from "lucide-react";
import { useAppSelector } from "../store/hooks";

const TabBar = () => {
  const { t } = useTranslation();
  const unreadByChatId = useAppSelector((state) => state.live.unreadByChatId);
  const unreadTotal = Object.values(unreadByChatId).reduce((sum, count) => sum + count, 0);

  const tabs = [
    { to: "/app/profile", label: t("profile"), icon: User },
    { to: "/app/orders", label: t("orders"), icon: ClipboardList },
    { to: "/app/chats", label: t("chats"), icon: MessageCircle, badge: unreadTotal },
  ];

  return (
    <nav className="tabbar">
      {tabs.map((tab) => (
        <NavLink key={tab.to} to={tab.to} className={({ isActive }) => (isActive ? "active" : "")}>
          <span className="tab-icon">
            <tab.icon size={22} />
            {tab.badge ? <span className="tab-badge">{tab.badge > 99 ? "99+" : tab.badge}</span> : null}
          </span>
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
};

export default TabBar;
