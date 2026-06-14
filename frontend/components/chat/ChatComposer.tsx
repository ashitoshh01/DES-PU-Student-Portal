"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore, type Message } from "@/store/chat.store";
import {
  Paperclip,
  Image as ImageIcon,
  Film,
  File,
  BarChart3,
  FileText,
  Send,
  Smile,
  Mic,
  X,
} from "lucide-react";

const ATTACHMENT_OPTIONS = [
  { icon: Paperclip, label: "Attach", color: "#64748B" },
  { icon: ImageIcon, label: "Image", color: "#3B82F6" },
  { icon: Film, label: "Video", color: "#8B5CF6" },
  { icon: File, label: "File", color: "#10B981" },
  { icon: BarChart3, label: "Poll", color: "#F59E0B" },
  { icon: FileText, label: "Form", color: "#E86E0A" },
];

export default function ChatComposer({
  conversationId,
}: {
  conversationId: string;
}) {
  const { addMessage, setShowPollCreator } = useChatStore();
  const [content, setContent] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    if (!content.trim()) return;

    const newMsg: Message = {
      msg_id: `msg-${Date.now()}`,
      conv_id: conversationId,
      sender_id: "u-self",
      sender_name: "Ashitosh Lavhate",
      content: content.trim(),
      type: "TEXT",
      reactions: [],
      is_deleted: false,
      is_own: true,
      read_by: [],
      status: "sent",
      created_at: new Date().toISOString(),
    };

    addMessage(newMsg);
    setContent("");

    // Simulate delivered + read status
    setTimeout(() => {
      // In real app, socket would update status
    }, 1000);
  }, [content, conversationId, addMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAttachmentClick = (label: string) => {
    if (label === "Poll") {
      setShowPollCreator(true);
    }
    // For other attachments, would open file picker
  };

  return (
    <div className="border-t border-border/50 bg-white px-5 py-3 shrink-0">
      {/* Input Area */}
      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <div className="flex items-center gap-1 bg-background rounded-2xl border border-border/50 px-4 py-2 focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
            <textarea
              ref={inputRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-secondary/50 outline-none resize-none max-h-24 min-h-[24px] leading-6"
              style={{
                height: content ? "auto" : "24px",
              }}
            />
            <button
              onClick={() => setShowEmoji(!showEmoji)}
              className="p-1 rounded-full hover:bg-white transition-colors text-text-secondary hover:text-text-primary shrink-0"
            >
              <Smile size={18} />
            </button>
          </div>
        </div>

        {/* Send button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={!content.trim()}
          className={`
            w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0
            ${content.trim()
              ? "bg-primary text-white shadow-md shadow-primary/20 cursor-pointer"
              : "bg-background text-text-secondary cursor-not-allowed"
            }
          `}
        >
          <Send size={18} strokeWidth={2} className={content.trim() ? "-rotate-0" : ""} />
        </motion.button>
      </div>

      {/* Attachment Bar */}
      <div className="flex items-center gap-1 mt-2">
        {ATTACHMENT_OPTIONS.map((opt) => (
          <button
            key={opt.label}
            onClick={() => handleAttachmentClick(opt.label)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background transition-all group cursor-pointer"
          >
            <opt.icon
              size={15}
              style={{ color: opt.color }}
              strokeWidth={1.8}
              className="group-hover:scale-110 transition-transform"
            />
            <span className="text-[11px] font-medium">{opt.label}</span>
          </button>
        ))}
        <div className="flex-1" />
        <button className="p-1.5 rounded-lg hover:bg-background transition-colors text-text-secondary hover:text-text-primary">
          <Mic size={18} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}
