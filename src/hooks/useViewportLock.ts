import { useEffect } from "react";

const KEYBOARD_GAP = 80;
const FIELD_PAD = 16;

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);

const isIos = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

const isTextField = (el: EventTarget | null): el is HTMLElement => {
  if (!(el instanceof HTMLElement)) {
    return false;
  }
  if (el instanceof HTMLInputElement) {
    if (el.readOnly || el.disabled) {
      return false;
    }
    return !["button", "checkbox", "radio", "file", "submit", "reset", "range", "color", "hidden", "image"].includes(
      el.type
    );
  }
  if (el instanceof HTMLTextAreaElement) {
    return !el.readOnly && !el.disabled;
  }
  return el.isContentEditable;
};

const lockScroll = () => {
  if (window.scrollY || document.documentElement.scrollTop || document.body.scrollTop) {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }
};

const frameHeight = (inner: number, visualHeight: number, visualOffset: number) => {
  const visible = visualHeight + visualOffset;
  if (isStandalone() && isIos()) {
    return Math.max(inner, visible, window.screen.height || 0, window.screen.availHeight || 0);
  }
  return visible > 0 ? visible : inner;
};

const scrollParent = (el: HTMLElement) => {
  let node: HTMLElement | null = el.parentElement;
  while (node && node !== document.body) {
    const style = window.getComputedStyle(node);
    const overflowY = style.overflowY;
    if ((overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") && node.scrollHeight > node.clientHeight + 4) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
};

const ensureFocusedVisible = () => {
  const el = document.activeElement;
  if (!isTextField(el) || el.closest(".input-bar")) {
    return;
  }

  const target = (el.closest(".field, .phone-input, .auth-card") as HTMLElement | null) || el;
  const scroller = scrollParent(el) || scrollParent(target);
  const visual = window.visualViewport;
  const viewTop = visual?.offsetTop ?? 0;
  const viewBottom = viewTop + (visual?.height ?? window.innerHeight);
  const header = document.querySelector("header.header");
  const headerBottom = header ? header.getBoundingClientRect().bottom : viewTop;
  const topLimit = Math.max(viewTop, headerBottom) + FIELD_PAD;
  const bottomLimit = viewBottom - FIELD_PAD;

  const shift = (delta: number) => {
    if (Math.abs(delta) < 1) {
      return;
    }
    if (scroller) {
      scroller.scrollTop += delta;
      return;
    }
    target.scrollIntoView({ block: delta > 0 ? "end" : "center", inline: "nearest" });
  };

  const rect = () => target.getBoundingClientRect();
  let box = rect();
  if (box.bottom > bottomLimit) {
    shift(box.bottom - bottomLimit);
    box = rect();
  }
  if (box.top < topLimit) {
    shift(-(topLimit - box.top));
  }
};

export const useViewportLock = () => {
  useEffect(() => {
    let restingHeight = 0;
    let revealTimer = 0;
    const timers: number[] = [];

    const updateResting = (inner: number, visualHeight: number, visualOffset: number) => {
      const next = frameHeight(inner, visualHeight, visualOffset);
      if (!restingHeight) {
        restingHeight = next;
        return;
      }
      if (Math.abs(next - restingHeight) < 8) {
        return;
      }
      if (next > restingHeight || !isTextField(document.activeElement)) {
        restingHeight = next;
      }
    };

    const revealFocused = () => {
      window.cancelAnimationFrame(revealTimer);
      revealTimer = window.requestAnimationFrame(() => {
        revealTimer = window.requestAnimationFrame(ensureFocusedVisible);
      });
    };

    const root = document.documentElement;

    const setVar = (name: string, value: number) => {
      const current = Number.parseFloat(root.style.getPropertyValue(name));
      if (Number.isFinite(current) && Math.abs(current - value) < 2) {
        return false;
      }
      root.style.setProperty(name, `${Math.round(value)}px`);
      return true;
    };

    const applyViewport = (reveal = false) => {
      const visual = window.visualViewport;
      const inner = window.innerHeight;
      const visualHeight = visual?.height ?? inner;
      const visualOffset = visual?.offsetTop ?? 0;
      const focused = isTextField(document.activeElement);
      const covered = Math.max(restingHeight, inner) - visualHeight;
      const keyboardOpen = focused && (covered > KEYBOARD_GAP || visualOffset > 10 || inner - visualHeight > KEYBOARD_GAP);

      if (!keyboardOpen) {
        updateResting(inner, visualHeight, visualOffset);
        setVar("--app-top", 0);
        setVar("--app-h", restingHeight);
        root.classList.remove("keyboard-open");
        lockScroll();
        if (reveal && focused) {
          revealFocused();
        }
        return;
      }

      lockScroll();
      setVar("--app-top", visualOffset);
      setVar("--app-h", visualHeight);
      root.classList.add("keyboard-open");
      if (reveal) {
        revealFocused();
      }
    };

    const clearTimers = () => {
      while (timers.length) {
        window.clearTimeout(timers.pop());
      }
    };

    const onFocusIn = (event: FocusEvent) => {
      clearTimers();
      const shouldReveal = isTextField(event.target);
      applyViewport(shouldReveal);
      if (!shouldReveal) {
        return;
      }
      [50, 180, 350, 550].forEach((ms) => {
        timers.push(window.setTimeout(() => applyViewport(true), ms));
      });
    };

    const onFocusOut = () => {
      clearTimers();
      timers.push(window.setTimeout(() => applyViewport(false), 80));
    };

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => applyViewport(isTextField(document.activeElement)), 50);
    };
    const onVisualScroll = () => lockScroll();
    const onOrientation = () => {
      restingHeight = 0;
      applyViewport(false);
    };

    applyViewport();
    const visual = window.visualViewport;
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onOrientation);
    visual?.addEventListener("resize", onResize);
    visual?.addEventListener("scroll", onVisualScroll);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);

    return () => {
      window.cancelAnimationFrame(revealTimer);
      window.clearTimeout(resizeTimer);
      clearTimers();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onOrientation);
      visual?.removeEventListener("resize", onResize);
      visual?.removeEventListener("scroll", onVisualScroll);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);
};
