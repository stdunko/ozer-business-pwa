import { useEffect, useState } from "react";
import { ChevronRight, User } from "lucide-react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { db } from "../firebase";
import type { Chat } from "../types/chat";

const RenderChatUser = ({ item }: { item: Chat }) => {
  const { t } = useTranslation();
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const anotherUser = item.participants?.find((member) => member.user_id);

  useEffect(() => {
    const q = query(collection(db, "chats", item.id, "messages"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((docSnap) => docSnap.data());
      const latest =
        messages.length > 0 ? messages[0].text || (messages[0].image && t("image")) : t("noMessages");
      setLastMessage(String(latest));
    });
    return unsubscribe;
  }, [item.id, t]);

  return (
    <Link className="chat-item" to={`/app/chats/${item.id}`} state={{ chat: item }}>
      <div className="avatar">
        <User size={24} />
      </div>
      <div className="grow">
        <div className="chat-name">{anotherUser?.name}</div>
        <div className="chat-preview">{lastMessage || t("noMessages")}</div>
      </div>
      <ChevronRight size={20} color="#9CA3AF" />
    </Link>
  );
};

export default RenderChatUser;
