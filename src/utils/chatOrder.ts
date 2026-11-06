import type { Chat } from "../types/chat";

type OrderLike = {
  id: number;
  status?: string | number;
  description?: string;
  category?: { name?: string };
  executor?: { id?: number };
  executorId?: number | null;
  user?: { id?: number };
  userId?: number;
};

export const chatOrderId = (chat: Chat) => {
  if (chat.orderId == null) {
    return null;
  }
  const value = Number(chat.orderId);
  return Number.isFinite(value) ? value : null;
};

const otherPartyIds = (chat: Chat, myId?: number | null) =>
  (chat.participants || [])
    .map((member) => member.id ?? member.user_id ?? member.executor_id)
    .filter((id): id is number => id != null && (myId == null || id !== myId))
    .map(Number);

export const resolveChatOrder = <T extends OrderLike>(chat: Chat, orders: T[], myId?: number | null) => {
  const byId = chatOrderId(chat);
  if (byId != null) {
    const found = orders.find((order) => order.id === byId);
    if (found) {
      return found;
    }
  }

  const others = otherPartyIds(chat, myId);
  if (others.length === 0) {
    return null;
  }

  const matches = orders.filter((order) => {
    const ids = [order.executor?.id, order.executorId, order.user?.id, order.userId];
    return ids.some((id) => id != null && others.includes(Number(id)));
  });

  if (matches.length === 0) {
    return null;
  }
  if (matches.length === 1) {
    return matches[0];
  }

  const active = matches.filter((order) => order.status === "CONFIRMED" || order.status === 2);
  const pool = active.length > 0 ? active : matches;
  return [...pool].sort((a, b) => b.id - a.id)[0];
};

export const chatOrderMeta = (chat: Chat, order: OrderLike | null) => ({
  id: order?.id ?? chatOrderId(chat),
  category: order?.category?.name || chat.orderCategory || "",
  description: order?.description || "",
});
