import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Chat } from "../types/chat";
import type { Order } from "../types/order";

type LiveState = {
  orders: Order[];
  chats: Chat[];
  ordersLoading: boolean;
  chatsLoading: boolean;
  unreadByChatId: Record<string, number>;
  refreshNonce: number;
};

const initialState: LiveState = {
  orders: [],
  chats: [],
  ordersLoading: true,
  chatsLoading: true,
  unreadByChatId: {},
  refreshNonce: 0,
};

const liveSlice = createSlice({
  name: "live",
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
      state.ordersLoading = false;
    },
    setChats: (state, action: PayloadAction<Chat[]>) => {
      state.chats = action.payload;
      state.chatsLoading = false;
    },
    setOrdersLoading: (state, action: PayloadAction<boolean>) => {
      state.ordersLoading = action.payload;
    },
    setChatsLoading: (state, action: PayloadAction<boolean>) => {
      state.chatsLoading = action.payload;
    },
    setChatUnread: (state, action: PayloadAction<{ chatId: string; unread: number }>) => {
      state.unreadByChatId[action.payload.chatId] = action.payload.unread;
    },
    mergeChatUnread: (state, action: PayloadAction<Record<string, number>>) => {
      Object.entries(action.payload).forEach(([chatId, unread]) => {
        if (unread > (state.unreadByChatId[chatId] || 0)) {
          state.unreadByChatId[chatId] = unread;
        }
      });
    },
    requestLiveRefresh: (state) => {
      state.refreshNonce += 1;
    },
    resetLive: () => initialState,
  },
});

export const {
  setOrders,
  setChats,
  setOrdersLoading,
  setChatsLoading,
  setChatUnread,
  mergeChatUnread,
  requestLiveRefresh,
  resetLive,
} = liveSlice.actions;
export default liveSlice.reducer;
