import { Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import TabBar from "../components/TabBar";
import { useLiveSync } from "../hooks/useLiveSync";
import { usePushNotifications } from "../hooks/usePushNotifications";

const AppLayout = () => {
  const location = useLocation();
  const executorId = useAppSelector((state) => state.executor.id);
  useLiveSync();
  usePushNotifications();
  const hideTabBar = location.pathname.includes("/chats/") || location.pathname.includes("/about");

  if (!executorId) {
    return (
      <div className="loader">
        <span className="spinner" />
      </div>
    );
  }

  return (
    <div className={`app-layout ${hideTabBar ? "" : "has-tabbar"}`}>
      <div className="app-layout-body">
        <Outlet />
      </div>
      {hideTabBar ? null : <TabBar />}
    </div>
  );
};

export default AppLayout;
