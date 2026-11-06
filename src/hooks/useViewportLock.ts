import { useEffect } from "react";

const applyViewport = () => {
  document.documentElement.style.setProperty("--app-h", `${window.innerHeight}px`);
};

export const useViewportLock = () => {
  useEffect(() => {
    applyViewport();
    window.addEventListener("resize", applyViewport);
    window.addEventListener("orientationchange", applyViewport);
    window.visualViewport?.addEventListener("resize", applyViewport);
    return () => {
      window.removeEventListener("resize", applyViewport);
      window.removeEventListener("orientationchange", applyViewport);
      window.visualViewport?.removeEventListener("resize", applyViewport);
    };
  }, []);
};
