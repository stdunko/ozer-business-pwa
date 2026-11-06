import { useEffect } from "react";

const KEYBOARD_GAP = 80;

const applyViewport = () => {
  const root = document.documentElement;
  const visual = window.visualViewport;
  const inner = window.innerHeight;
  const visualHeight = visual?.height ?? inner;
  const keyboardOpen = Boolean(visual && inner - visualHeight > KEYBOARD_GAP);

  if (keyboardOpen) {
    root.style.setProperty("--app-h", `${Math.round(visualHeight)}px`);
    root.classList.add("keyboard-open");
    return;
  }

  root.style.removeProperty("--app-h");
  root.classList.remove("keyboard-open");
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
