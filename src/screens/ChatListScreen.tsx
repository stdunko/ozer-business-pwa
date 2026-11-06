import { MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import AppHeader from "../components/AppHeader";
import RenderChatUser from "../components/RenderChatUser";
import PullToRefresh from "../components/PullToRefresh";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { requestLiveRefresh } from "../store/liveSlice";

const ChatListScreen = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const chats = useAppSelector((state) => state.live.chats);
  const isChatLoading = useAppSelector((state) => state.live.chatsLoading);

  const onRefresh = async () => {
    dispatch(requestLiveRefresh());
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

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
        <PullToRefresh onRefresh={onRefresh} className="chat-list">
          {chats.map((item) => (
            <RenderChatUser key={item.id} item={item} />
          ))}
        </PullToRefresh>
      )}
    </div>
  );
};

export default ChatListScreen;
