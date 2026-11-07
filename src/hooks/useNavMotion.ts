import { useLayoutEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const tabRoot = (path: string) => {
  if (path.startsWith("/app/chats")) return "chats";
  if (path.startsWith("/app/orders")) return "orders";
  if (path.startsWith("/app/profile") || path.startsWith("/app/about")) return "profile";
  return path;
};

export const useNavMotion = () => {
  const location = useLocation();
  const prev = useRef(location.pathname);
  const [motion, setMotion] = useState("tab");

  useLayoutEffect(() => {
    const from = prev.current;
    const to = location.pathname;
    prev.current = to;
    if (from === to) {
      return;
    }
    const fromTab = tabRoot(from);
    const toTab = tabRoot(to);
    if (fromTab !== toTab) {
      setMotion("tab");
      return;
    }
    if (to.startsWith(from) || to.split("/").length > from.split("/").length) {
      setMotion("forward");
      return;
    }
    setMotion("back");
  }, [location.pathname]);

  return motion;
};
