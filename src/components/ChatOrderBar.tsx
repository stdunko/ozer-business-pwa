import { ChevronRight, ClipboardList } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import type { Chat } from "../types/chat";
import { chatOrderMeta, resolveChatOrder } from "../utils/chatOrder";

const ChatOrderBar = ({ chat, myId }: { chat?: Chat | null; myId?: number | null }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const orders = useAppSelector((state) => state.live.orders);

  if (!chat) {
    return null;
  }

  const order = resolveChatOrder(chat, orders, myId);
  const meta = chatOrderMeta(chat, order);
  if (!meta.id && !meta.category) {
    return null;
  }

  return (
    <button
      type="button"
      className="chat-order-bar"
      disabled={!meta.id}
      onClick={() => meta.id && navigate(`/app/orders/${meta.id}`)}
      aria-label={t("openOrder")}
    >
      <span className="chat-order-bar-icon">
        <ClipboardList size={18} />
      </span>
      <span className="chat-order-bar-text">
        <span className="chat-order-bar-title">
          {meta.id ? t("orderNumber", { n: meta.id }) : t("orders")}
          {meta.category ? ` · ${meta.category}` : ""}
        </span>
        {meta.description ? <span className="chat-order-bar-desc">{meta.description}</span> : null}
      </span>
      {meta.id ? <ChevronRight size={18} className="chat-order-bar-chevron" /> : null}
    </button>
  );
};

export default ChatOrderBar;
