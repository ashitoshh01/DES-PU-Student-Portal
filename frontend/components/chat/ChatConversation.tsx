"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore, type Conversation, type Message } from "@/store/chat.store";
import MessageBubble from "./MessageBubble";
import ChatComposer from "./ChatComposer";
import PollCreator from "./PollCreator";
import {
  Search,
  Phone,
  Video,
  Info,
  MoreVertical,
  ChevronDown,
} from "lucide-react";

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }).toUpperCase();
}

function formatDateLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function groupMessagesByDate(messages: Message[]) {
  const groups: { date: string; messages: Message[] }[] = [];
  let currentDate = "";

  for (const msg of messages) {
    const date = formatDateLabel(msg.created_at);
    if (date !== currentDate) {
      currentDate = date;
      groups.push({ date, messages: [msg] });
    } else {
      groups[groups.length - 1].messages.push(msg);
    }
  }

  return groups;
}

function TypingIndicator({ names }: { names: string[] }) {
  if (names.length === 0) return null;
  const text = names.length === 1 ? `${names[0]} is typing` : `${names.join(", ")} are typing`;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-center gap-2 px-4 py-1.5"
    >
      <div className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-text-secondary/40"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
      <span className="text-xs text-text-secondary italic">{text}...</span>
    </motion.div>
  );
}

export default function ChatConversation({
  conversation,
}: {
  conversation: Conversation;
}) {
  const {
    messages,
    typingUsers,
    showDetails,
    toggleDetails,
    showPollCreator,
    setShowPollCreator,
  } = useChatStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const isGroup = conversation.type !== "DIRECT";
  const typingNames = typingUsers[conversation.conv_id] || [];

  // Get presence text
  const presenceText = (() => {
    if (isGroup) {
      return `${conversation.member_count || conversation.members.length} members`;
    }
    const member = conversation.members[0];
    if (member?.presence_status === "ONLINE") return "Online";
    if (member?.presence_status === "AWAY") return "Away";
    return "Offline";
  })();

  const messageGroups = groupMessagesByDate(messages);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    setShowScrollDown(scrollHeight - scrollTop - clientHeight > 200);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/50 bg-white shrink-0">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br ${
              isGroup ? "from-orange-400 to-amber-500" : "from-blue-400 to-indigo-500"
            }`}>
              {conversation.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            {!isGroup && conversation.members[0]?.presence_status === "ONLINE" && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-success border-2 border-white" />
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text-primary">
              {conversation.name}
            </h3>
            <p className={`text-[11px] font-medium ${
              !isGroup && conversation.members[0]?.presence_status === "ONLINE"
                ? "text-success"
                : "text-text-secondary"
            }`}>
              {typingNames.length > 0
                ? `${typingNames[0]} is typing...`
                : presenceText}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-lg hover:bg-background transition-colors text-text-secondary hover:text-text-primary">
            <Search size={18} strokeWidth={1.8} />
          </button>
          <button className="p-2 rounded-lg hover:bg-background transition-colors text-text-secondary hover:text-text-primary">
            <Phone size={18} strokeWidth={1.8} />
          </button>
          <button className="p-2 rounded-lg hover:bg-background transition-colors text-text-secondary hover:text-text-primary">
            <Video size={18} strokeWidth={1.8} />
          </button>
          <button
            onClick={toggleDetails}
            className={`p-2 rounded-lg transition-colors ${
              showDetails
                ? "bg-primary-light text-primary"
                : "hover:bg-background text-text-secondary hover:text-text-primary"
            }`}
          >
            <Info size={18} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-5 py-4 relative"
        style={{ background: "#FAFBFD" }}
      >
        {messageGroups.map((group) => (
          <div key={group.date}>
            {/* Date separator */}
            <div className="flex items-center justify-center my-4">
              <span className="px-3 py-1 rounded-full bg-white border border-border/50 text-[11px] font-medium text-text-secondary shadow-sm">
                {group.date}
              </span>
            </div>

            {/* Messages */}
            {group.messages.map((msg, i) => {
              const prevMsg = i > 0 ? group.messages[i - 1] : null;
              const showSender =
                isGroup && !msg.is_own && msg.sender_id !== prevMsg?.sender_id;

              return (
                <MessageBubble
                  key={msg.msg_id}
                  message={msg}
                  showSender={showSender}
                  isGroup={isGroup}
                />
              );
            })}
          </div>
        ))}

        {/* Typing */}
        <AnimatePresence>
          {typingNames.length > 0 && (
            <TypingIndicator names={typingNames} />
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />

        {/* Scroll to bottom button */}
        <AnimatePresence>
          {showScrollDown && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={scrollToBottom}
              className="fixed bottom-28 right-[calc(50%-16px)] w-8 h-8 rounded-full bg-white border border-border shadow-md flex items-center justify-center text-text-secondary hover:text-primary transition-colors z-10"
            >
              <ChevronDown size={16} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Poll Creator */}
      <AnimatePresence>
        {showPollCreator && <PollCreator />}
      </AnimatePresence>

      {/* Composer */}
      <ChatComposer conversationId={conversation.conv_id} />
    </div>
  );
}
