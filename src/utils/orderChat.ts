import { addDoc, collection, getDoc, getDocs, query, Timestamp, where } from "firebase/firestore";
import { db } from "../firebase";

type OrderChatInput = {
  myId: number;
  otherId: number;
  participants: Array<Record<string, unknown>>;
  orderId: number;
  orderCategory?: string;
};

const findChatByOrderId = async (orderId: number) => {
  const chatsRef = collection(db, "chats");
  const [byNumber, byString] = await Promise.all([
    getDocs(query(chatsRef, where("orderId", "==", orderId))),
    getDocs(query(chatsRef, where("orderId", "==", String(orderId)))),
  ]);
  return byNumber.docs[0] || byString.docs[0] || null;
};

export const openOrCreateOrderChat = async (input: OrderChatInput) => {
  const existing = await findChatByOrderId(input.orderId);
  if (existing) {
    return { id: existing.id, ...existing.data() };
  }

  const docRef = await addDoc(collection(db, "chats"), {
    participantsIds: [input.myId, input.otherId],
    participants: input.participants,
    orderId: input.orderId,
    orderCategory: input.orderCategory || "",
    lastMessageTimestamp: Timestamp.now(),
    lastMessageText: "",
    lastMessageUserId: null,
    unread: {
      [String(input.myId)]: 0,
      [String(input.otherId)]: 0,
    },
  });
  const created = await getDoc(docRef);
  return { id: created.id, ...created.data() };
};
