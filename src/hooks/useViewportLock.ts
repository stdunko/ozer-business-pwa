import { useEffect } from "react";

const applyViewport = () => {
  const viewport = window.visualViewport;
  const height = Math.round(viewport?.height ?? window.innerHeight);
  const offsetTop = Math.round(viewport?.offsetTop ?? 0);
  const root = document.documentElement;
  root.style.setProperty("--app-h", `${height}px`);
  root.style.setProperty("--app-offset-top", `${offsetTop}px`);
};

export const useViewportLock = () => {
  useEffect(() => {
    applyViewport();
    const viewport = window.visualViewport;
    viewport?.addEventListener("resize", applyViewport);
    viewport?.addEventListener("scroll", applyViewport);
    window.addEventListener("orientationchange", applyViewport);
    window.addEventListener("resize", applyViewport);
    return () => {
      viewport?.removeEventListener("resize", applyViewport);
      viewport?.removeEventListener("scroll", applyViewport);
      window.removeEventListener("orientationchange", applyViewport);
      window.removeEventListener("resize", applyViewport);
    };
  }, []);
};
