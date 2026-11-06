import { useEffect, useState } from "react";
import { useViewportLock } from "./hooks/useViewportLock";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { setToken } from "./store/authSlice";
import { emptyExecutor, setExecutor } from "./store/executorSlice";
import { resetLive } from "./store/liveSlice";
import { clearAuthSession, getCurrentExecutor, isValidStoredToken } from "./services/api";
import { useNotifier } from "./components/AppNotifier";
import { storage } from "./utils/storage";
import { shouldShowOnboarding } from "./utils/onboarding";
import AppLayout from "./layouts/AppLayout";
import OnboardingScreen from "./screens/OnboardingScreen";
import GreetingScreen from "./screens/GreetingScreen";
import EnterNumberScreen from "./screens/EnterNumberScreen";
import EnterOtpScreen from "./screens/EnterOtpScreen";
import ProfileScreen from "./screens/ProfileScreen";
import OrderScreen from "./screens/OrderScreen";
import ChatListScreen from "./screens/ChatListScreen";
import ChatScreen from "./screens/ChatScreen";
import AboutScreen from "./screens/AboutScreen";
import InstallBanner from "./components/InstallBanner";

const SwNavigation = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === "NAVIGATE" && typeof event.data.url === "string") {
        const path = event.data.url.replace(window.location.origin, "") || "/app/orders";
        navigate(path);
      }
    };
    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, [navigate]);

  return null;
};

const App = () => {
  useViewportLock();
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.authorization.token);
  const { showApiError } = useNotifier();
  const [showOnboarding, setShowOnboarding] = useState(shouldShowOnboarding());
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const saved = storage.get("token");
    if (!isValidStoredToken(saved)) {
      if (saved) {
        clearAuthSession();
      }
      setIsBootstrapping(false);
      return;
    }
    dispatch(setToken(saved));
    setIsBootstrapping(false);
  }, [dispatch]);

  useEffect(() => {
    (async () => {
      if (!token) {
        dispatch(setExecutor(emptyExecutor()));
        dispatch(resetLive());
        return;
      }
      const { response, error } = await getCurrentExecutor();
      if (error) {
        showApiError(error, "errorGeneric");
        if ((error as { response?: { status?: number } })?.response?.status === 401) {
          clearAuthSession();
          dispatch(setExecutor(emptyExecutor()));
          dispatch(resetLive());
        }
        return;
      }
      if (response?.data) {
        const cachedPhoto = storage.get(`executorPhoto:${response.data.id}`);
        dispatch(
          setExecutor({
            ...response.data,
            photo: response.data.photo || cachedPhoto || null,
          })
        );
      }
    })();
  }, [dispatch, token, showApiError]);

  if (isBootstrapping) {
    return (
      <div className="loader">
        <span className="spinner" />
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <>
        <InstallBanner />
        <OnboardingScreen onComplete={() => setShowOnboarding(false)} />
      </>
    );
  }

  return (
    <>
      <InstallBanner />
      <SwNavigation />
      <Routes>
        {!token ? (
          <>
            <Route path="/login" element={<GreetingScreen />} />
            <Route path="/login/phone" element={<EnterNumberScreen />} />
            <Route path="/login/otp" element={<EnterOtpScreen />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <>
            <Route path="/app" element={<AppLayout />}>
              <Route path="profile" element={<ProfileScreen />} />
              <Route path="orders" element={<OrderScreen />} />
              <Route path="chats" element={<ChatListScreen />} />
              <Route path="chats/:chatId" element={<ChatScreen />} />
              <Route path="about" element={<AboutScreen />} />
            </Route>
            <Route path="*" element={<Navigate to="/app/orders" replace />} />
          </>
        )}
      </Routes>
    </>
  );
};

export default App;
