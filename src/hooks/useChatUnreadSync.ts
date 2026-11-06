import { useEffect, useRef } from "react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import type { Chat } from "../types/chat";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setChatUnread } from "../store/liveSlice";
import { notifyIfHidden } from "./usePushNotifications";

const otherName = (chat: Chat, myId: number, fallback: string) => {
  const other = chat.participants?.find(
    (member) => (member.id ?? member.user_id ?? member.executor_id) !== myId
  );
  return other?.name || fallback;
};

export const useChatUnreadSync = (myId?: number, fallbackName = "OzerilBusiness") => {
  const dispatch = useAppDispatch();
  const chats = useAppSelector((state) => state.live.chats);
  const chatIds = chats.map((chat) => chat.id).join(",");
  const chatsRef = useRef(chats);
  const prevUnread = useRef<Record<string, number>>({});
  chatsRef.current = chats;

  useEffect(() => {
    if (!myId || !chatIds) {
      return;
    }

    const unsubscribers = chatIds.split(",").map((chatId) => {
      const messagesQuery = query(
        collection(db, "chats", chatId, "messages"),
        orderBy("createdAt", "desc"),
        limit(80)
      );
      return onSnapshot(messagesQuery, (snapshot) => {
        const messages = snapshot.docs.map((docSnap) => docSnap.data());
        const unreadCount = messages.filter((message) => {
          const senderId = message.user?._id;
          const fromOther = senderId !== myId && String(senderId) !== String(myId);
          if (!fromOther) {
            return false;
          }
          return message.isRead?.[myId] === false || message.isRead?.[String(myId)] === false;
        }).length;
        dispatch(setChatUnread({ chatId, unread: unreadCount }));
        if (unreadCount > (prevUnread.current[chatId] || 0)) {
          const chat = chatsRef.current.find((item) => item.id === chatId);
          const title = chat ? otherName(chat, myId, fallbackName) : fallbackName;
          const body = String(messages[0]?.text || messages[0]?.image || title);
          notifyIfHidden(title, body, `/app/chats/${chatId}`);
        }
        prevUnread.current[chatId] = unreadCount;
      });
    });

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [chatIds, dispatch, fallbackName, myId]);
};
