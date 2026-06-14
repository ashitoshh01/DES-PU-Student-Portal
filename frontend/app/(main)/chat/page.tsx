"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "@/store/chat.store";
import {
  MOCK_CONVERSATIONS,
  MOCK_MESSAGES,
} from "@/lib/chat-mock-data";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatConversation from "@/components/chat/ChatConversation";
import ChatDetails from "@/components/chat/ChatDetails";

export default function ChatPage() {
  const {
    activeConversationId,
    showDetails,
    setConversations,
    setMessages,
    setActiveConversation,
  } = useChatStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setConversations(MOCK_CONVERSATIONS);
    setActiveConversation("c-1");
    setMessages(MOCK_MESSAGES["c-1"] || []);
    setMounted(true);
  }, [setConversations, setActiveConversation, setMessages]);

  useEffect(() => {
    if (activeConversationId) {
      setMessages(MOCK_MESSAGES[activeConversationId] || []);
    }
  }, [activeConversationId, setMessages]);

  if (!mounted) return null;

  const activeConv = MOCK_CONVERSATIONS.find(
    (c) => c.conv_id === activeConversationId
  );

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left Panel — Conversation List */}
      <ChatSidebar />

      {/* Center Panel — Messages */}
      <div className="flex-1 min-w-0 flex flex-col border-r border-border/50">
        {activeConv ? (
          <ChatConversation conversation={activeConv} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-4">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#E86E0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-primary">
                Select a conversation
              </h3>
              <p className="text-sm text-text-secondary mt-1">
                Choose from your existing conversations or start a new one
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel — Details */}
      <AnimatePresence mode="wait">
        {showDetails && activeConv && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="overflow-hidden shrink-0 hidden lg:block"
          >
            <ChatDetails conversation={activeConv} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
