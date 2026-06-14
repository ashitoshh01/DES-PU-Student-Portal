"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore, type Message } from "@/store/chat.store";
import {
  Check,
  CheckCheck,
  FileText,
  Download,
  Image as ImageIcon,
  Film,
  File,
  SmilePlus,
} from "lucide-react";

const REACTION_EMOJIS = ["👍", "❤️", "🔥", "😂", "🎉"];

function formatTime(iso: string) {
  const d = new Date(iso);
  return d
    .toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .toUpperCase();
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function StatusIcon({ status }: { status: Message["status"] }) {
  if (status === "sending")
    return <div className="w-3 h-3 rounded-full border border-text-secondary/30 animate-pulse" />;
  if (status === "sent") return <Check size={14} className="text-text-secondary/50" />;
  if (status === "delivered") return <CheckCheck size={14} className="text-text-secondary/50" />;
  if (status === "read") return <CheckCheck size={14} className="text-blue-500" />;
  return null;
}

function FileAttachment({ message }: { message: Message }) {
  const att = message.attachment;
  if (!att) return null;

  const isImage = att.mime_type.startsWith("image/");
  const isVideo = att.mime_type.startsWith("video/");
  const isPdf = att.mime_type === "application/pdf";

  const getIcon = () => {
    if (isPdf) return <FileText size={24} className="text-red-500" />;
    if (isImage) return <ImageIcon size={24} className="text-blue-500" />;
    if (isVideo) return <Film size={24} className="text-purple-500" />;
    return <File size={24} className="text-text-secondary" />;
  };

  const getBgColor = () => {
    if (isPdf) return "bg-red-50";
    if (isImage) return "bg-blue-50";
    if (isVideo) return "bg-purple-50";
    return "bg-gray-50";
  };

  return (
    <div
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${getBgColor()} border border-border/30 mt-1`}
    >
      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12.5px] font-semibold text-text-primary truncate">
          {att.file_name}
        </p>
        <p className="text-[10.5px] text-text-secondary">
          {isPdf ? "PDF" : att.mime_type.split("/")[1]?.toUpperCase()} · {formatFileSize(att.file_size)}
        </p>
      </div>
      <button className="p-1.5 rounded-lg hover:bg-white/80 transition-colors text-text-secondary hover:text-primary">
        <Download size={16} />
      </button>
    </div>
  );
}

function PollCard({ message }: { message: Message }) {
  const poll = message.poll;
  if (!poll) return null;

  const { updatePollVote } = useChatStore();

  const handleVote = (optionId: string) => {
    if (poll.has_voted) return;
    updatePollVote(message.msg_id, optionId);
  };

  return (
    <div className="bg-white rounded-xl border border-border/50 p-4 mt-1 max-w-[340px]">
      <h4 className="text-[13px] font-semibold text-text-primary mb-1">
        {poll.question}
      </h4>
      <p className="text-[10.5px] text-text-secondary mb-3">
        Select one option
      </p>

      <div className="space-y-2">
        {poll.options.map((opt) => (
          <button
            key={opt.option_id}
            onClick={() => handleVote(opt.option_id)}
            className={`
              w-full relative rounded-xl border transition-all text-left overflow-hidden
              ${opt.voted
                ? "border-primary/30 bg-primary-light/30"
                : "border-border/50 hover:border-primary/20 hover:bg-primary-light/10"
              }
              ${poll.has_voted ? "cursor-default" : "cursor-pointer"}
            `}
          >
            {/* Progress bar */}
            {poll.has_voted && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${opt.percentage}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`absolute inset-y-0 left-0 ${
                  opt.voted ? "bg-primary/10" : "bg-background"
                }`}
              />
            )}

            <div className="relative flex items-center justify-between px-3 py-2.5">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    opt.voted ? "border-primary bg-primary" : "border-border"
                  }`}
                >
                  {opt.voted && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
                <span className="text-[12.5px] font-medium text-text-primary">
                  {opt.text}
                </span>
              </div>

              {poll.has_voted && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-text-secondary">
                    {opt.votes} votes
                  </span>
                  <span className="text-[11px] font-semibold text-text-primary tabular-nums">
                    {opt.percentage}%
                  </span>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-[10.5px] text-text-secondary">
          {poll.total_votes} votes
          {poll.expires_at && ` · Poll ends in 1d`}
        </p>
      </div>
    </div>
  );
}

function ReactionBar({
  reactions,
  msgId,
}: {
  reactions: Message["reactions"];
  msgId: string;
}) {
  const { updateMessageReaction } = useChatStore();

  if (reactions.length === 0) return null;

  return (
    <div className="flex items-center gap-1 mt-1">
      {reactions.map((r) => (
        <button
          key={r.emoji}
          onClick={() => updateMessageReaction(msgId, r.emoji, !r.reacted)}
          className={`
            inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] transition-all
            ${r.reacted
              ? "bg-primary-light border border-primary/20"
              : "bg-background border border-border/50 hover:border-primary/20"
            }
          `}
        >
          <span>{r.emoji}</span>
          <span className={`font-medium ${r.reacted ? "text-primary" : "text-text-secondary"}`}>
            {r.count}
          </span>
        </button>
      ))}
    </div>
  );
}

export default function MessageBubble({
  message,
  showSender,
  isGroup,
}: {
  message: Message;
  showSender: boolean;
  isGroup: boolean;
}) {
  const [showReactions, setShowReactions] = useState(false);
  const { updateMessageReaction } = useChatStore();

  const isOwn = message.is_own;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-1.5 group relative`}
      onMouseEnter={() => setShowReactions(true)}
      onMouseLeave={() => setShowReactions(false)}
    >
      <div className={`max-w-[65%] ${isOwn ? "items-end" : "items-start"}`}>
        {/* Sender name for groups */}
        {showSender && (
          <p className="text-[11px] font-semibold text-primary ml-1 mb-0.5">
            {message.sender_name}
          </p>
        )}

        <div className="relative">
          {/* Bubble */}
          <div
            className={`
              relative px-3 py-2 rounded-2xl inline-block
              ${isOwn
                ? "bg-primary-light border border-primary/10 rounded-tr-md"
                : "bg-white border border-border/50 rounded-tl-md shadow-sm"
              }
            `}
          >
            {/* Content */}
            {message.type === "TEXT" && (
              <p className="text-[13px] text-text-primary leading-relaxed whitespace-pre-wrap break-words">
                {message.content}
              </p>
            )}

            {message.type === "FILE" && <FileAttachment message={message} />}

            {message.type === "POLL" && <PollCard message={message} />}

            {message.type === "FORM" && message.form && (
              <div className="bg-white rounded-xl border border-border/50 p-3 mt-1 max-w-[280px]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center">
                    <FileText size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-[12.5px] font-semibold text-text-primary">
                      {message.form.title}
                    </p>
                    <p className="text-[10.5px] text-text-secondary">
                      {message.form.response_count} responses
                    </p>
                  </div>
                </div>
                <button className="w-full py-1.5 rounded-lg bg-primary text-white text-[12px] font-semibold hover:bg-primary-dark transition-colors">
                  Open Form
                </button>
              </div>
            )}

            {/* Timestamp + Status */}
            <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? "justify-end" : "justify-start"}`}>
              <span className="text-[9.5px] text-text-secondary/60 tabular-nums">
                {formatTime(message.created_at)}
              </span>
              {isOwn && <StatusIcon status={message.status} />}
            </div>
          </div>

          {/* Quick reactions tooltip */}
          <AnimatePresence>
            {showReactions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 5 }}
                className={`absolute -top-9 ${isOwn ? "right-0" : "left-0"} flex items-center gap-0.5 px-1.5 py-1 rounded-full bg-white border border-border/50 shadow-lg z-20`}
              >
                {REACTION_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => updateMessageReaction(message.msg_id, emoji, true)}
                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-primary-light transition-colors text-sm hover:scale-125 transform"
                  >
                    {emoji}
                  </button>
                ))}
                <button className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-background transition-colors">
                  <SmilePlus size={14} className="text-text-secondary" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Reactions bar */}
        <ReactionBar reactions={message.reactions} msgId={message.msg_id} />
      </div>
    </motion.div>
  );
}
