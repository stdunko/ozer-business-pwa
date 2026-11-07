import { useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { getOrders } from "../services/api";
import { useNotifier } from "../components/AppNotifier";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { mergeChatUnread, resetLive, setChats, setChatsLoading, setOrders } from "../store/liveSlice";
import { useChatUnreadSync } from "./useChatUnreadSync";
import { setExecutorPhoto } from "../store/executorSlice";
import type { Chat } from "../types/chat";
import type { Order } from "../types/order";
import { getChatTimestampMs } from "../utils/chat";
import { categoryLabel } from "../utils/categoryI18n";
import { ORDERS_POLL_INTERVAL_MS, reportNewIncomingOrders } from "../utils/orderSync";
import { notifyIfHidden } from "./usePushNotifications";

const mergeChats = (current: Chat[], incoming: Chat[]) => {
  const next = new Map(current.map((chat) => [chat.id, chat]));
  incoming.forEach((chat) => next.set(chat.id, chat));
  return [...next.values()].sort((a, b) => getChatTimestampMs(b) - getChatTimestampMs(a));
};

const unreadFromChats = (chats: Chat[], myId: number) => {
  const map: Record<string, number> = {};
  chats.forEach((chat) => {
    if (chat.unread) {
      const value = Number(chat.unread[myId] ?? chat.unread[String(myId)] ?? 0);
      if (Number.isFinite(value)) {
        map[chat.id] = value;
        return;
      }
    }
    const sender = chat.lastMessageUserId;
    if (
      sender != null &&
      sender !== myId &&
      String(sender) !== String(myId) &&
      chat.lastMessageText
    ) {
      map[chat.id] = 1;
    }
  });
  return map;
};

export const useLiveSync = () => {
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation();
  const { showApiError, showInfo } = useNotifier();
  const token = useAppSelector((state) => state.authorization.token);
  const executorId = useAppSelector((state) => state.executor.id);
  const orders = useAppSelector((state) => state.live.orders);
  const refreshNonce = useAppSelector((state) => state.live.refreshNonce);
  const ordersRef = useRef(orders);
  const chatBucketsRef = useRef<Chat[][]>([[], []]);
  const refreshNonceRef = useRef(refreshNonce);

  ordersRef.current = orders;

  const loadOrders = useCallback(
    async (silent = false) => {
      if (!token) {
        return;
      }
      const { response, error } = await getOrders();
      if (error) {
        if (!silent) {
          showApiError(error, "errorLoadOrders");
          dispatch(setOrders(ordersRef.current));
        }
        return;
      }
      if (!response?.data) {
        if (!silent) {
          dispatch(setOrders(ordersRef.current));
        }
        return;
      }
      const nextOrders = response.data as Order[];
      if (silent) {
        reportNewIncomingOrders(ordersRef.current, nextOrders, (order) => {
          const title = categoryLabel(order.category, i18n.language) || "OzerilBusiness";
          const message = t("newOrder");
          showInfo(message);
          notifyIfHidden(title, message, `/app/orders/${order.id}`);
        });
      }
      dispatch(setOrders(nextOrders));
    },
    [dispatch, i18n.language, showApiError, showInfo, t, token]
  );

  useEffect(() => {
    if (!token) {
      dispatch(resetLive());
      return;
    }

    void loadOrders(false);
    const intervalId = window.setInterval(() => {
      void loadOrders(true);
    }, ORDERS_POLL_INTERVAL_MS);

    const refreshIfVisible = () => {
      if (document.visibilityState === "visible") {
        void loadOrders(true);
      }
    };

    window.addEventListener("focus", refreshIfVisible);
    document.addEventListener("visibilitychange", refreshIfVisible);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshIfVisible);
      document.removeEventListener("visibilitychange", refreshIfVisible);
    };
  }, [dispatch, loadOrders, token]);

  useEffect(() => {
    if (!token || !executorId) {
      dispatch(setChatsLoading(false));
      return;
    }

    dispatch(setChatsLoading(true));
    chatBucketsRef.current = [[], []];
    const collectionRef = collection(db, "chats");
    const queries = [
      query(collectionRef, where("participantsIds", "array-contains", executorId)),
      query(collectionRef, where("participantsIds", "array-contains", String(executorId))),
    ];

    const unsubscribers = queries.map((chatQuery, index) =>
      onSnapshot(
        chatQuery,
        (snapshot) => {
          chatBucketsRef.current[index] = snapshot.docs.map(
            (docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Chat
          );
          const merged = mergeChats(chatBucketsRef.current[0], chatBucketsRef.current[1]);
          dispatch(setChats(merged));
          dispatch(mergeChatUnread(unreadFromChats(merged, executorId)));
        },
        (error) => {
          console.error("Firestore chats:", error);
          showApiError(error, "errorLoadChats");
          dispatch(setChatsLoading(false));
        }
      )
    );

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [dispatch, executorId, showApiError, token]);

  useEffect(() => {
    if (!token || !executorId) {
      return;
    }
    return onSnapshot(doc(db, "executorProfiles", String(executorId)), (snapshot) => {
      const photo = snapshot.data()?.photo;
      if (typeof photo === "string") {
        dispatch(setExecutorPhoto(photo));
      }
    });
  }, [dispatch, executorId, token]);

  useEffect(() => {
    if (!token || refreshNonce === refreshNonceRef.current) {
      return;
    }
    refreshNonceRef.current = refreshNonce;
    void loadOrders(true);
  }, [loadOrders, refreshNonce, token]);

  useChatUnreadSync(executorId || undefined, "OzerilBusiness");
};
