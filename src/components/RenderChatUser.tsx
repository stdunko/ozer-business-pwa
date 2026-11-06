import { useEffect, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { db } from "../firebase";
import type { Chat } from "../types/chat";
import { formatChatTime } from "../utils/chat";
import PersonAvatar from "./PersonAvatar";
import { useAppSelector } from "../store/hooks";

const RenderChatUser = ({
  item,
  onPreview,
}: {
  item: Chat;
  onPreview?: (chatId: string, text: string) => void;
}) => {
  const { t, i18n } = useTranslation();
  const unread = useAppSelector((state) => state.live.unreadByChatId[item.id] || 0);
  const [lastMessage, setLastMessage] = useState<string | null>(item.lastMessageText || null);
  const anotherUser = item.participants?.find((member) => member.user_id);
  const name = anotherUser?.name || t("customer");
  const timeLabel = formatChatTime(item, i18n.language);

  useEffect(() => {
    setLastMessage(item.lastMessageText || null);
  }, [item.lastMessageText]);

  useEffect(() => {
    const messagesQuery = query(
      collection(db, "chats", item.id, "messages"),
      orderBy("createdAt", "desc"),
      limit(1)
    );
    return onSnapshot(messagesQuery, (snapshot) => {
      const latest = snapshot.docs[0]?.data();
      if (!latest) {
        return;
      }
      setLastMessage(String(latest.text || (latest.image && t("image")) || t("noMessages")));
    });
  }, [item.id, t]);

  useEffect(() => {
    if (lastMessage) {
      onPreview?.(item.id, lastMessage);
    }
  }, [item.id, lastMessage, onPreview]);

  return (
    <Link className="chat-item" to={`/app/chats/${item.id}`} state={{ chat: item }}>
      <div className="chat-avatar-wrap">
        <PersonAvatar name={name} photo={anotherUser?.photo} userId={anotherUser?.user_id} />
        {unread > 0 ? <span className="chat-unread-dot">{unread > 99 ? "99+" : unread}</span> : null}
      </div>
      <div className="chat-item-body">
        <div className="chat-item-top">
          <div className="chat-name">{name}</div>
          {timeLabel ? <div className="chat-time">{timeLabel}</div> : null}
        </div>
        {item.orderId || item.orderCategory ? (
          <div className="chat-order">
            {item.orderId ? t("orderNumber", { n: item.orderId }) : null}
            {item.orderId && item.orderCategory ? " · " : null}
            {item.orderCategory}
          </div>
        ) : null}
        <div className={`chat-preview ${unread > 0 ? "unread" : ""}`}>{lastMessage || t("noMessages")}</div>
      </div>
    </Link>
  );
};

export default RenderChatUser;
