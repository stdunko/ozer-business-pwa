import { Outlet, matchPath, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import TabBar from "../components/TabBar";
import { useLiveSync } from "../hooks/useLiveSync";
import { useNavMotion } from "../hooks/useNavMotion";
import { usePushNotifications } from "../hooks/usePushNotifications";

const hideTabBarOn = (pathname: string) =>
  Boolean(
    matchPath({ path: "/app/chats/:chatId", end: true }, pathname) ||
      matchPath({ path: "/app/orders/:orderId", end: true }, pathname) ||
      matchPath({ path: "/app/about", end: true }, pathname)
  );

const AppLayout = () => {
  const location = useLocation();
  const executorId = useAppSelector((state) => state.executor.id);
  useLiveSync();
  usePushNotifications();
  const hideTabBar = hideTabBarOn(location.pathname);
  const motion = useNavMotion();

  if (!executorId) {
    return (
      <div className="loader">
        <span className="spinner" />
      </div>
    );
  }

  return (
    <div className="app-layout">
      <div className={`app-layout-body nav-${motion}`}>
        <Outlet />
      </div>
      {hideTabBar ? null : <TabBar />}
    </div>
  );
};

export default AppLayout;
