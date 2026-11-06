import { useEffect } from "react";

const KEYBOARD_GAP = 80;

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);

const lockScroll = () => {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};

const frameHeight = (inner: number, visualHeight: number, visualOffset: number) => {
  const candidates = [inner, visualHeight + visualOffset];
  if (isStandalone()) {
    candidates.push(window.screen.height || 0, window.screen.availHeight || 0);
  }
  return Math.max(...candidates);
};

const applyViewport = () => {
  const root = document.documentElement;
  const visual = window.visualViewport;
  const inner = window.innerHeight;
  const visualHeight = visual?.height ?? inner;
  const visualOffset = visual?.offsetTop ?? 0;
  const keyboardOpen = Boolean(visual && (inner - visualHeight > KEYBOARD_GAP || visualOffset > 10));

  if (keyboardOpen && visual) {
    lockScroll();
    root.style.setProperty("--app-top", `${Math.round(visualOffset)}px`);
    root.style.setProperty("--app-h", `${Math.round(visualHeight)}px`);
    root.classList.add("keyboard-open");
    return;
  }

  root.style.setProperty("--app-top", "0px");
  root.style.setProperty("--app-h", `${Math.round(frameHeight(inner, visualHeight, visualOffset))}px`);
  root.classList.remove("keyboard-open");
  lockScroll();
};

export const useViewportLock = () => {
  useEffect(() => {
    applyViewport();
    const visual = window.visualViewport;
    const onFocus = () => {
      applyViewport();
      [50, 180, 350, 550].forEach((ms) => window.setTimeout(applyViewport, ms));
    };

    window.addEventListener("resize", applyViewport);
    window.addEventListener("orientationchange", applyViewport);
    visual?.addEventListener("resize", applyViewport);
    visual?.addEventListener("scroll", applyViewport);
    document.addEventListener("focusin", onFocus);
    document.addEventListener("focusout", onFocus);

    return () => {
      window.removeEventListener("resize", applyViewport);
      window.removeEventListener("orientationchange", applyViewport);
      visual?.removeEventListener("resize", applyViewport);
      visual?.removeEventListener("scroll", applyViewport);
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("focusout", onFocus);
    };
  }, []);
};
