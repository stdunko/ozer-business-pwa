import { useCallback, useMemo, useState } from "react";
import { MessageCircle, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import AppHeader from "../components/AppHeader";
import AppTextInput from "../components/AppTextInput";
import RenderChatUser from "../components/RenderChatUser";
import PullToRefresh from "../components/PullToRefresh";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { requestLiveRefresh } from "../store/liveSlice";
import type { Chat } from "../types/chat";

const chatSearchText = (chat: Chat, preview?: string) =>
  [
    ...(chat.participants || []).map((member) => member.name || ""),
    chat.lastMessageText || "",
    preview || "",
  ]
    .join(" ")
    .toLowerCase();

const ChatListScreen = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const chats = useAppSelector((state) => state.live.chats);
  const isChatLoading = useAppSelector((state) => state.live.chatsLoading);
  const [search, setSearch] = useState("");
  const [previews, setPreviews] = useState<Record<string, string>>({});

  const onPreview = useCallback((chatId: string, text: string) => {
    setPreviews((prev) => (prev[chatId] === text ? prev : { ...prev, [chatId]: text }));
  }, []);

  const onRefresh = async () => {
    dispatch(requestLiveRefresh());
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return chats;
    }
    return chats.filter((chat) => chatSearchText(chat, previews[chat.id]).includes(query));
  }, [chats, previews, search]);
  const visibleIds = useMemo(() => new Set(filtered.map((chat) => chat.id)), [filtered]);

  return (
    <div className="screen">
      <AppHeader title={t("chats")} />
      {isChatLoading && chats.length === 0 ? (
        <div className="loader">
          <span className="spinner" />
        </div>
      ) : chats.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <MessageCircle size={32} />
          </div>
          <p className="empty">{t("yourChatsEmpty")}</p>
        </div>
      ) : (
        <>
          <div className="search-wrap">
            <AppTextInput
              icon={Search}
              placeholder={t("searchChats")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {filtered.length === 0 ? <p className="empty">{t("chatsNotFound")}</p> : null}
          <PullToRefresh onRefresh={onRefresh} className="chat-list">
            {chats.map((item) => (
              <div key={item.id} hidden={!visibleIds.has(item.id)}>
                <RenderChatUser item={item} onPreview={onPreview} />
              </div>
            ))}
          </PullToRefresh>
        </>
      )}
    </div>
  );
};

export default ChatListScreen;
