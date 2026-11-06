import type { Chat } from "../types/chat";

export const getChatTimestampMs = (chat: Chat) => {
  const value = chat.lastMessageTimestamp as
    | { toMillis?: () => number; seconds?: number }
    | Date
    | number
    | string
    | null
    | undefined;

  if (!value) {
    return 0;
  }
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  if (value instanceof Date) {
    return value.getTime();
  }
  if (typeof value.toMillis === "function") {
    return value.toMillis();
  }
  if (typeof value.seconds === "number") {
    return value.seconds * 1000;
  }
  return 0;
};

export const formatChatTime = (chat: Chat, locale: string) => {
  const ms = getChatTimestampMs(chat);
  if (!ms) {
    return "";
  }
  const date = new Date(ms);
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (sameDay) {
    return date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString(locale, { day: "numeric", month: "short" });
};

export const getInitials = (name?: string | null) => {
  const parts = (name || "")
    .split(/\s+/)
    .map((part) => part.replace(/[^\p{L}\p{N}]+/gu, ""))
    .filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};
