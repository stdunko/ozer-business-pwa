import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import { store } from "./store/store";
import i18n from "./services/i18n";
import { bootstrapAppLanguage } from "./services/i18n/changeLanguage";
import { AppNotifierProvider } from "./components/AppNotifier";
import { initPwaInstallCapture } from "./pwaInstall";
import "./index.css";

initPwaInstallCapture();
registerSW({ immediate: true });

const root = createRoot(document.getElementById("root")!);

bootstrapAppLanguage().then(() => {
  root.render(
    <StrictMode>
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <BrowserRouter>
            <div className="app-frame">
              <div className="app-shell">
                <AppNotifierProvider>
                  <App />
                </AppNotifierProvider>
              </div>
            </div>
          </BrowserRouter>
        </I18nextProvider>
      </Provider>
    </StrictMode>
  );
});
