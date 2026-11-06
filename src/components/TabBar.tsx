import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ClipboardList, MessageCircle, User } from "lucide-react";

const TabBar = () => {
  const { t } = useTranslation();

  const tabs = [
    { to: "/app/profile", label: t("profile"), icon: User },
    { to: "/app/orders", label: t("orders"), icon: ClipboardList },
    { to: "/app/chats", label: t("chats"), icon: MessageCircle },
  ];

  return (
    <nav className="tabbar">
      {tabs.map((tab) => (
        <NavLink key={tab.to} to={tab.to} className={({ isActive }) => (isActive ? "active" : "")}>
          <span className="tab-icon">
            <tab.icon size={22} />
          </span>
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
};

export default TabBar;
