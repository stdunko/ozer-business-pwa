import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { getApiErrorMessage } from "../utils/apiError";

type ToastType = "error" | "success" | "info";

type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

type NotifierContextValue = {
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  showInfo: (message: string) => void;
  showApiError: (error: unknown, fallbackKey: string) => void;
};

const NotifierContext = createContext<NotifierContextValue | null>(null);
const TOAST_DURATION_MS = 3200;

export const AppNotifierProvider = ({ children }: { children: ReactNode }) => {
  const { t, i18n } = useTranslation();
  const [toast, setToast] = useState<Toast | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastId = useRef(0);

  const showToast = useCallback((message: string, type: ToastType) => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
    }
    toastId.current += 1;
    setToast({ id: toastId.current, message, type });
    hideTimer.current = setTimeout(() => setToast(null), TOAST_DURATION_MS);
  }, []);

  const resolveMessage = useCallback(
    (messageOrKey: string) => (i18n.exists(messageOrKey) ? t(messageOrKey) : messageOrKey),
    [i18n, t]
  );

  const value = useMemo<NotifierContextValue>(
    () => ({
      showError: (message) => showToast(resolveMessage(message), "error"),
      showSuccess: (message) => showToast(resolveMessage(message), "success"),
      showInfo: (message) => showToast(resolveMessage(message), "info"),
      showApiError: (error, fallbackKey) => {
        showToast(resolveMessage(getApiErrorMessage(error, fallbackKey)), "error");
      },
    }),
    [resolveMessage, showToast]
  );

  const Icon = toast?.type === "error" ? AlertCircle : toast?.type === "success" ? CheckCircle2 : Info;

  return (
    <NotifierContext.Provider value={value}>
      {children}
      {toast ? (
        <div className={`toast ${toast.type}`}>
          <Icon size={20} />
          <span>{toast.message}</span>
        </div>
      ) : null}
    </NotifierContext.Provider>
  );
};

export const useNotifier = () => {
  const context = useContext(NotifierContext);
  if (!context) {
    throw new Error("useNotifier must be used within AppNotifierProvider");
  }
  return context;
};
