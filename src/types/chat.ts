export type ChatParticipant = {
  id?: number;
  user_id?: number;
  executor_id?: number;
  name?: string;
  photo?: string | null;
};

export type Chat = {
  id: string;
  participantsIds?: Array<number | string>;
  participants?: ChatParticipant[];
  lastMessageTimestamp?: unknown;
  lastMessageText?: string;
};
