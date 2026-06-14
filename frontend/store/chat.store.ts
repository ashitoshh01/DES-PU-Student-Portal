import { create } from "zustand";

// ─── Types ───────────────────────────────────────────────────
export type ConversationType = "DIRECT" | "GROUP" | "SUBJECT_GROUP" | "PROJECT_GROUP" | "COMMUNITY";
export type MessageType = "TEXT" | "IMAGE" | "VIDEO" | "FILE" | "POLL" | "FORM" | "SYSTEM";
export type ChatFilter = "all" | "unread" | "groups" | "communities";

export interface ChatUser {
  user_id: string;
  name: string;
  avatar?: string;
  presence_status: "ONLINE" | "OFFLINE" | "AWAY";
  role?: string;
}

export interface Conversation {
  conv_id: string;
  type: ConversationType;
  name: string;
  avatar?: string;
  last_message?: string;
  last_message_time?: string;
  last_message_sender?: string;
  unread_count: number;
  is_pinned: boolean;
  members: ChatUser[];
  member_count?: number;
  description?: string;
  created_by?: string;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  reacted: boolean; // current user reacted
}

export interface PollOption {
  option_id: string;
  text: string;
  votes: number;
  voted: boolean; // current user voted
  percentage: number;
}

export interface Poll {
  poll_id: string;
  question: string;
  options: PollOption[];
  total_votes: number;
  is_anonymous: boolean;
  is_multiple: boolean;
  expires_at?: string;
  has_voted: boolean;
}

export interface FileAttachment {
  r2_key: string;
  file_name: string;
  file_size: number;
  mime_type: string;
}

export interface Message {
  msg_id: string;
  conv_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  content: string;
  type: MessageType;
  attachment?: FileAttachment;
  poll?: Poll;
  form?: { form_id: string; title: string; description?: string; response_count: number };
  reactions: MessageReaction[];
  is_deleted: boolean;
  is_own: boolean;
  read_by: string[];
  status: "sending" | "sent" | "delivered" | "read";
  created_at: string;
  edited_at?: string;
}

// ─── Store State ─────────────────────────────────────────────
interface ChatState {
  // Conversations
  conversations: Conversation[];
  activeConversationId: string | null;
  filter: ChatFilter;
  searchQuery: string;

  // Messages
  messages: Message[];
  isLoadingMessages: boolean;

  // Right panel
  showDetails: boolean;

  // Realtime
  typingUsers: Record<string, string[]>; // conv_id -> user names
  onlineUsers: Set<string>;

  // Create modal
  showCreateModal: boolean;
  createModalType: "chat" | "group" | "community" | null;

  // Poll creator
  showPollCreator: boolean;

  // Actions
  setConversations: (convs: Conversation[]) => void;
  setActiveConversation: (id: string | null) => void;
  setFilter: (filter: ChatFilter) => void;
  setSearchQuery: (query: string) => void;
  setMessages: (msgs: Message[]) => void;
  addMessage: (msg: Message) => void;
  setLoadingMessages: (loading: boolean) => void;
  setShowDetails: (show: boolean) => void;
  toggleDetails: () => void;
  setTypingUsers: (convId: string, users: string[]) => void;
  setOnlineUsers: (users: Set<string>) => void;
  setShowCreateModal: (show: boolean, type?: "chat" | "group" | "community") => void;
  setShowPollCreator: (show: boolean) => void;
  updateMessageReaction: (msgId: string, emoji: string, added: boolean) => void;
  updatePollVote: (msgId: string, optionId: string) => void;
}

// ─── Store ───────────────────────────────────────────────────
export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  filter: "all",
  searchQuery: "",
  messages: [],
  isLoadingMessages: false,
  showDetails: false,
  typingUsers: {},
  onlineUsers: new Set(),
  showCreateModal: false,
  createModalType: null,
  showPollCreator: false,

  setConversations: (convs) => set({ conversations: convs }),
  setActiveConversation: (id) => set({ activeConversationId: id, showDetails: false }),
  setFilter: (filter) => set({ filter }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setMessages: (msgs) => set({ messages: msgs }),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setLoadingMessages: (loading) => set({ isLoadingMessages: loading }),
  setShowDetails: (show) => set({ showDetails: show }),
  toggleDetails: () => set((s) => ({ showDetails: !s.showDetails })),
  setTypingUsers: (convId, users) =>
    set((s) => ({ typingUsers: { ...s.typingUsers, [convId]: users } })),
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  setShowCreateModal: (show, type) =>
    set({ showCreateModal: show, createModalType: type || null }),
  setShowPollCreator: (show) => set({ showPollCreator: show }),
  updateMessageReaction: (msgId, emoji, added) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.msg_id === msgId
          ? {
              ...m,
              reactions: m.reactions.map((r) =>
                r.emoji === emoji
                  ? { ...r, count: added ? r.count + 1 : r.count - 1, reacted: added }
                  : r
              ),
            }
          : m
      ),
    })),
  updatePollVote: (msgId, optionId) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.msg_id === msgId && m.poll
          ? {
              ...m,
              poll: {
                ...m.poll,
                total_votes: m.poll.total_votes + 1,
                has_voted: true,
                options: m.poll.options.map((o) => {
                  const newVotes = o.option_id === optionId ? o.votes + 1 : o.votes;
                  return {
                    ...o,
                    votes: newVotes,
                    voted: o.option_id === optionId ? true : o.voted,
                    percentage: Math.round(
                      (newVotes / (m.poll!.total_votes + 1)) * 100
                    ),
                  };
                }),
              },
            }
          : m
      ),
    })),
}));
