export type ChatParticipant = {
  id?: number;
  user_id?: number;
  executor_id?: number;
  name?: string;
};

export type Chat = {
  id: string;
  participantsIds?: number[];
  participants?: ChatParticipant[];
  lastMessageTimestamp?: unknown;
};
