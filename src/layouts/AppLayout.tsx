import { Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import TabBar from "../components/TabBar";

const AppLayout = () => {
  const location = useLocation();
  const executorId = useAppSelector((state) => state.executor.id);
  const hideTabBar = location.pathname.includes("/chats/") || location.pathname.includes("/about");

  if (!executorId) {
    return (
      <div className="loader">
        <span className="spinner" />
      </div>
    );
  }

  return (
    <>
      <Outlet />
      {hideTabBar ? null : <TabBar />}
    </>
  );
};

export default AppLayout;
