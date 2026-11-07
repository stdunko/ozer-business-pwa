import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check, CheckCheck, Image as ImageIcon, MessageCircle, Send, X } from "lucide-react";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  increment,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { notifyChatPush } from "../services/api";
import { db } from "../firebase";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setChatUnread } from "../store/liveSlice";
import { compressImageFile } from "../utils/image";
import type { Chat } from "../types/chat";
import AppHeader from "../components/AppHeader";
import ChatOrderBar from "../components/ChatOrderBar";
import PersonAvatar from "../components/PersonAvatar";

type ChatMessage = {
  _id: string;
  createdAt: Date;
  text?: string;
  image?: string;
  user?: { _id: number };
  isRead?: Record<string | number, boolean>;
};

type DeliveryStatus = "sending" | "sent" | "read";

const linkify = (text: string) => {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return parts.map((part, index) =>
    part.startsWith("http") ? (
      <a key={index} href={part} target="_blank" rel="noreferrer">
        {part}
      </a>
    ) : (
      <span key={index}>{part}</span>
    )
  );
};

const ChatScreen = () => {
  const { t } = useTranslation();
  const { chatId } = useParams();
  const location = useLocation();
  const executor = useAppSelector((state) => state.executor);
  const chats = useAppSelector((state) => state.live.chats);
  const chat =
    (location.state as { chat?: Chat } | null)?.chat || chats.find((item) => item.id === chatId);
  const dispatch = useAppDispatch();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [preview, setPreview] = useState("");
  const [imageData, setImageData] = useState("");
  const [sendingIds, setSendingIds] = useState<string[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const anotherUser = chat?.participants?.find(
    (member) => (member.id ?? member.user_id ?? member.executor_id) !== executor.id
  );
  const recipientId = anotherUser?.user_id ?? anotherUser?.id ?? anotherUser?.executor_id;
  const title = chat?.participants?.find((p) => p.user_id)?.name ?? t("chats");

  const markAsReadForRecipient = useCallback(async () => {
    if (!chatId || !executor.id) return;
    const messagesRef = collection(db, "chats", chatId, "messages");
    const unreadQuery = query(messagesRef, where(`isRead.${executor.id}`, "==", false));
    const snapshot = await getDocs(unreadQuery);
    if (!snapshot.empty) {
      const batch = writeBatch(db);
      snapshot.docs.forEach((docSnap) => {
        batch.update(docSnap.ref, { [`isRead.${executor.id}`]: true });
      });
      await batch.commit();
    }
    await updateDoc(doc(db, "chats", chatId), { [`unread.${String(executor.id)}`]: 0 });
    dispatch(setChatUnread({ chatId, unread: 0 }));
  }, [chatId, dispatch, executor.id]);

  useLayoutEffect(() => {
    if (!chatId) {
      return;
    }
    const q = query(collection(db, "chats", chatId, "messages"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setMessages(
          snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            const createdAt = data.createdAt?.toDate?.() ?? new Date();
            return {
              _id: docSnap.id,
              createdAt,
              image: data.image,
              text: data.text,
              user: data.user,
              isRead: data.isRead,
            };
          })
        );
        void markAsReadForRecipient();
      },
      (error) => console.error("Firestore messages:", error)
    );
    return () => unsubscribe();
  }, [chatId, markAsReadForRecipient]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages.length]);

  const getMessageDeliveryStatus = useCallback(
    (message: ChatMessage): DeliveryStatus | null => {
      if (message.user?._id !== executor.id) return null;
      if (sendingIds.includes(String(message._id))) return "sending";
      if (recipientId != null && message.isRead?.[recipientId] === true) return "read";
      return "sent";
    },
    [executor.id, recipientId, sendingIds]
  );

  const onSend = async () => {
    if (!chatId || (!text.trim() && !imageData)) return;
    const tempId = `tmp-${Date.now()}`;
    const createdAt = new Date();
    const payloadText = text.trim();
    setSendingIds((prev) => [...prev, tempId]);
    setMessages((prev) => [
      {
        _id: tempId,
        createdAt,
        text: payloadText,
        image: imageData,
        user: { _id: executor.id },
      },
      ...prev,
    ]);
    setText("");
    const imageToSend = imageData;
    setPreview("");
    setImageData("");

    try {
      await addDoc(collection(db, "chats", chatId, "messages"), {
        createdAt: Timestamp.fromDate(createdAt),
        text: payloadText,
        user: { _id: executor.id },
        image: imageToSend || "",
        isRead: {
          [executor.id]: true,
          ...(recipientId != null ? { [recipientId]: false } : {}),
        },
      });
      await updateDoc(doc(db, "chats", chatId), {
        lastMessageTimestamp: Timestamp.fromDate(createdAt),
        lastMessageText: payloadText || (imageToSend ? t("image") : ""),
        lastMessageUserId: executor.id,
        [`unread.${String(executor.id)}`]: 0,
        ...(recipientId != null ? { [`unread.${String(recipientId)}`]: increment(1) } : {}),
      });
      if (recipientId != null && Number.isFinite(Number(recipientId))) {
        void notifyChatPush({
          chatId,
          recipientId: Number(recipientId),
          to: "user",
          title: executor.name || executor.phone || "OzerilBusiness",
          preview: payloadText || t("image"),
        });
      }
    } finally {
      setSendingIds((prev) => prev.filter((id) => id !== tempId));
    }
  };

  const onPickFile = async (file: File | undefined) => {
    if (!file?.type.startsWith("image/")) return;
    const dataUrl = await compressImageFile(file);
    setPreview(dataUrl);
    setImageData(dataUrl);
  };

  const chronological = [...messages].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  return (
    <div className="screen">
      <AppHeader
        title={title}
        back
        avatar={
          <PersonAvatar
            className="header-avatar"
            name={title}
            photo={anotherUser?.photo}
            userId={anotherUser?.user_id}
          />
        }
      />
      <ChatOrderBar chat={chat} myId={executor.id} />
      {chronological.length === 0 ? (
        <div className="center-col chat-empty-wrap">
          <div className="empty-icon">
            <MessageCircle size={32} />
          </div>
          <p className="chat-empty-text">{t("chatEmpty")}</p>
        </div>
      ) : (
        <div className="messages" ref={listRef}>
          {chronological.map((message) => {
            const outgoing = message.user?._id === executor.id;
            const status = outgoing ? getMessageDeliveryStatus(message) : null;
            return (
              <div key={message._id} className={`bubble ${outgoing ? "out" : "in"}`}>
                {message.image ? (
                  <img
                    className="bubble-img"
                    src={message.image}
                    alt=""
                    onClick={() => setLightbox(message.image || null)}
                  />
                ) : null}
                {message.text ? <div className="bubble-text">{linkify(message.text)}</div> : null}
                <div className="time-row">
                  <span>
                    {message.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {status === "sending" ? <Check size={15} /> : null}
                  {status === "sent" ? <CheckCheck size={16} /> : null}
                  {status === "read" ? <CheckCheck size={16} color="#7EE0FF" /> : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="input-bar">
        {preview ? (
          <div className="preview-row">
            <img src={preview} alt="" />
            <button type="button" onClick={() => { setPreview(""); setImageData(""); }}>
              <X size={22} color="#9CA3AF" />
            </button>
          </div>
        ) : null}
        <div className="composer-row">
          <button type="button" className="attach-btn" onClick={() => fileRef.current?.click()}>
            <ImageIcon size={24} />
          </button>
          <input
            ref={fileRef}
            className="hidden-file"
            type="file"
            accept="image/*"
            onChange={(e) => onPickFile(e.target.files?.[0])}
          />
          <textarea
            className="composer"
            rows={1}
            placeholder={t("chatPlaceholder")}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void onSend();
              }
            }}
          />
          <button
            type="button"
            className="send-btn"
            disabled={!text.trim() && !imageData}
            onClick={() => void onSend()}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
      {lightbox ? (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" />
        </div>
      ) : null}
    </div>
  );
};

export default ChatScreen;
