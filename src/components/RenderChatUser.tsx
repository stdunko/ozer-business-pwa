import { useEffect, useRef, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { db } from "../firebase";
import type { Chat } from "../types/chat";
import { formatChatTime } from "../utils/chat";
import PersonAvatar from "./PersonAvatar";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setChatUnread } from "../store/liveSlice";
import { notifyIfHidden } from "../hooks/usePushNotifications";

const RenderChatUser = ({
  item,
  onPreview,
}: {
  item: Chat;
  onPreview?: (chatId: string, text: string) => void;
}) => {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const executorId = useAppSelector((state) => state.executor.id);
  const unread = useAppSelector((state) => state.live.unreadByChatId[item.id] || 0);
  const [lastMessage, setLastMessage] = useState<string | null>(item.lastMessageText || null);
  const prevUnread = useRef(0);
  const anotherUser = item.participants?.find((member) => member.user_id);
  const name = anotherUser?.name || t("customer");
  const timeLabel = formatChatTime(item, i18n.language);

  useEffect(() => {
    const q = query(collection(db, "chats", item.id, "messages"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((docSnap) => docSnap.data());
      const latest =
        messages.length > 0 ? messages[0].text || (messages[0].image && t("image")) : t("noMessages");
      setLastMessage(String(latest));
      const unreadCount = messages.filter((message) => {
        const fromOther = message.user?._id !== executorId;
        if (!fromOther) {
          return false;
        }
        return message.isRead?.[executorId] === false || message.isRead?.[String(executorId)] === false;
      }).length;
      dispatch(setChatUnread({ chatId: item.id, unread: unreadCount }));
    });
    return unsubscribe;
  }, [dispatch, executorId, item.id, t]);

  useEffect(() => {
    if (lastMessage) {
      onPreview?.(item.id, lastMessage);
    }
  }, [item.id, lastMessage, onPreview]);

  useEffect(() => {
    if (unread > prevUnread.current) {
      notifyIfHidden(name, lastMessage || t("newMessage"), `/app/chats/${item.id}`);
    }
    prevUnread.current = unread;
  }, [item.id, lastMessage, name, t, unread]);

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
        <div className={`chat-preview ${unread > 0 ? "unread" : ""}`}>{lastMessage || t("noMessages")}</div>
      </div>
    </Link>
  );
};

export default RenderChatUser;
