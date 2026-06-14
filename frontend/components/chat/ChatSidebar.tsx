"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore, type ChatFilter, type Conversation } from "@/store/chat.store";
import { MOCK_MESSAGES } from "@/lib/chat-mock-data";
import {
  Search,
  Plus,
  Filter,
  Pin,
  MessageCircle,
  Users,
  Globe,
  BookOpen,
  Hash,
  ChevronDown,
  X,
} from "lucide-react";

const FILTERS: { key: ChatFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "groups", label: "Groups" },
  { key: "communities", label: "Communities" },
];

const getConvIcon = (type: string) => {
  switch (type) {
    case "DIRECT": return null;
    case "GROUP": return Users;
    case "SUBJECT_GROUP": return BookOpen;
    case "PROJECT_GROUP": return Hash;
    case "COMMUNITY": return Globe;
    default: return MessageCircle;
  }
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const getAvatarColor = (name: string) => {
  const colors = [
    "from-orange-400 to-amber-500",
    "from-blue-400 to-indigo-500",
    "from-emerald-400 to-teal-500",
    "from-purple-400 to-violet-500",
    "from-rose-400 to-pink-500",
    "from-cyan-400 to-sky-500",
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
};

function ConversationItem({
  conv,
  isActive,
  onClick,
}: {
  conv: Conversation;
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = getConvIcon(conv.type);
  const isGroup = conv.type !== "DIRECT";
  const onlineMembers = conv.members?.filter(
    (m) => m.presence_status === "ONLINE"
  ).length;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: 2 }}
      className={`
        w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 cursor-pointer
        ${isActive
          ? "bg-primary-light/80 border border-primary/20"
          : "hover:bg-background border border-transparent"
        }
      `}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div
          className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br ${getAvatarColor(conv.name)}`}
        >
          {isGroup && Icon ? (
            <Icon size={18} strokeWidth={2} />
          ) : (
            getInitials(conv.name)
          )}
        </div>
        {!isGroup && conv.members?.[0]?.presence_status === "ONLINE" && (
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-success border-2 border-white" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p
            className={`text-[13px] font-semibold truncate ${
              isActive ? "text-primary" : "text-text-primary"
            }`}
          >
            {conv.name}
          </p>
          <span className="text-[10px] text-text-secondary ml-2 shrink-0 tabular-nums">
            {conv.last_message_time}
          </span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-[11.5px] text-text-secondary truncate pr-2">
            {conv.last_message}
          </p>
          {conv.unread_count > 0 && (
            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-white text-[10px] font-bold shrink-0">
              {conv.unread_count}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}

export default function ChatSidebar() {
  const {
    conversations,
    activeConversationId,
    filter,
    searchQuery,
    setActiveConversation,
    setFilter,
    setSearchQuery,
    setMessages,
    setShowCreateModal,
  } = useChatStore();

  const [showNewMenu, setShowNewMenu] = useState(false);

  const filteredConvs = useMemo(() => {
    let result = conversations;

    // Apply filter
    if (filter === "unread") {
      result = result.filter((c) => c.unread_count > 0);
    } else if (filter === "groups") {
      result = result.filter(
        (c) => c.type === "GROUP" || c.type === "SUBJECT_GROUP" || c.type === "PROJECT_GROUP"
      );
    } else if (filter === "communities") {
      result = result.filter((c) => c.type === "COMMUNITY");
    }

    // Apply search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.last_message?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [conversations, filter, searchQuery]);

  const pinnedConvs = filteredConvs.filter((c) => c.is_pinned);
  const recentConvs = filteredConvs.filter((c) => !c.is_pinned && c.type !== "COMMUNITY");
  const communityConvs = filteredConvs.filter((c) => c.type === "COMMUNITY");

  const handleSelect = (convId: string) => {
    setActiveConversation(convId);
    setMessages(MOCK_MESSAGES[convId] || []);
  };

  return (
    <div className="w-[340px] shrink-0 border-r border-border/50 bg-white flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-primary">Chats</h2>
          <div className="flex items-center gap-2">
            {/* New chat button */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNewMenu(!showNewMenu)}
                className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white cursor-pointer"
              >
                <Plus size={16} strokeWidth={2.5} />
              </motion.button>

              <AnimatePresence>
                {showNewMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowNewMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -5 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-border shadow-lg z-50 overflow-hidden"
                    >
                      <button
                        onClick={() => {
                          setShowNewMenu(false);
                          setShowCreateModal(true, "chat");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary hover:bg-primary-light hover:text-primary transition-colors"
                      >
                        <MessageCircle size={16} />
                        New Chat
                      </button>
                      <button
                        onClick={() => {
                          setShowNewMenu(false);
                          setShowCreateModal(true, "group");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary hover:bg-primary-light hover:text-primary transition-colors"
                      >
                        <Users size={16} />
                        New Group
                      </button>
                      <button
                        onClick={() => {
                          setShowNewMenu(false);
                          setShowCreateModal(true, "community");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary hover:bg-primary-light hover:text-primary transition-colors"
                      >
                        <Globe size={16} />
                        New Community
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <button className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors">
              <Filter size={16} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/50"
          />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-xl bg-background border border-border/50 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`
                px-3 py-1.5 rounded-full text-[11.5px] font-semibold transition-all duration-200 cursor-pointer
                ${filter === f.key
                  ? "bg-primary text-white shadow-sm"
                  : "bg-background text-text-secondary hover:text-text-primary hover:bg-border-light"
                }
              `}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {/* Pinned */}
        {pinnedConvs.length > 0 && (
          <div className="mt-2">
            <div className="flex items-center gap-1.5 px-2 py-1.5 text-[10.5px] font-semibold text-text-secondary uppercase tracking-wider">
              <Pin size={11} />
              Pinned
            </div>
            <div className="space-y-0.5">
              {pinnedConvs.map((conv) => (
                <ConversationItem
                  key={conv.conv_id}
                  conv={conv}
                  isActive={activeConversationId === conv.conv_id}
                  onClick={() => handleSelect(conv.conv_id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recent */}
        {recentConvs.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center gap-1.5 px-2 py-1.5 text-[10.5px] font-semibold text-text-secondary uppercase tracking-wider">
              Recent
            </div>
            <div className="space-y-0.5">
              {recentConvs.map((conv) => (
                <ConversationItem
                  key={conv.conv_id}
                  conv={conv}
                  isActive={activeConversationId === conv.conv_id}
                  onClick={() => handleSelect(conv.conv_id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Communities */}
        {communityConvs.length > 0 && filter !== "groups" && (
          <div className="mt-3">
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-[10.5px] font-semibold text-text-secondary uppercase tracking-wider">
                Communities
              </span>
              <button className="text-[11px] font-medium text-primary hover:text-primary-dark transition-colors">
                View all
              </button>
            </div>
            <div className="space-y-0.5">
              {communityConvs.map((conv) => (
                <ConversationItem
                  key={conv.conv_id}
                  conv={conv}
                  isActive={activeConversationId === conv.conv_id}
                  onClick={() => handleSelect(conv.conv_id)}
                />
              ))}
            </div>
          </div>
        )}

        {filteredConvs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center mb-3">
              <MessageCircle size={20} className="text-primary" />
            </div>
            <p className="text-sm font-medium text-text-primary">No conversations found</p>
            <p className="text-xs text-text-secondary mt-1">Try a different search or filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
