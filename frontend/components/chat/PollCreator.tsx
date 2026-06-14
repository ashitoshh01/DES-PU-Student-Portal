"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useChatStore, type Message } from "@/store/chat.store";
import { X, Plus, Trash2, BarChart3 } from "lucide-react";

export default function PollCreator() {
  const { setShowPollCreator, addMessage } = useChatStore();
  const activeConvId = useChatStore((s) => s.activeConversationId);

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [isMultiple, setIsMultiple] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (idx: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== idx));
    }
  };

  const updateOption = (idx: number, value: string) => {
    setOptions(options.map((o, i) => (i === idx ? value : o)));
  };

  const handleCreate = () => {
    if (!question.trim() || options.filter((o) => o.trim()).length < 2) return;
    if (!activeConvId) return;

    const pollMsg: Message = {
      msg_id: `msg-poll-${Date.now()}`,
      conv_id: activeConvId,
      sender_id: "u-self",
      sender_name: "Ashitosh Lavhate",
      content: "",
      type: "POLL",
      poll: {
        poll_id: `poll-${Date.now()}`,
        question: question.trim(),
        is_anonymous: isAnonymous,
        is_multiple: isMultiple,
        has_voted: false,
        total_votes: 0,
        options: options
          .filter((o) => o.trim())
          .map((text, i) => ({
            option_id: `po-${Date.now()}-${i}`,
            text: text.trim(),
            votes: 0,
            voted: false,
            percentage: 0,
          })),
      },
      reactions: [],
      is_deleted: false,
      is_own: true,
      read_by: [],
      status: "sent",
      created_at: new Date().toISOString(),
    };

    addMessage(pollMsg);
    setShowPollCreator(false);
  };

  const canCreate =
    question.trim().length > 0 && options.filter((o) => o.trim()).length >= 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: 20, height: 0 }}
      className="border-t border-border/50 bg-white px-5 py-4"
    >
      <div className="max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <BarChart3 size={16} className="text-amber-500" />
            </div>
            <h4 className="text-sm font-semibold text-text-primary">
              Create Poll
            </h4>
          </div>
          <button
            onClick={() => setShowPollCreator(false)}
            className="p-1.5 rounded-lg hover:bg-background transition-colors text-text-secondary"
          >
            <X size={16} />
          </button>
        </div>

        {/* Question */}
        <input
          type="text"
          placeholder="Ask a question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-border/50 bg-background text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all mb-3"
        />

        {/* Options */}
        <div className="space-y-2 mb-3">
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-border shrink-0" />
              <input
                type="text"
                placeholder={`Option ${i + 1}`}
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-border/50 bg-white text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/30 transition-all"
              />
              {options.length > 2 && (
                <button
                  onClick={() => removeOption(i)}
                  className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-text-secondary hover:text-danger"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add option */}
        {options.length < 10 && (
          <button
            onClick={addOption}
            className="flex items-center gap-1.5 text-[12px] font-medium text-primary hover:text-primary-dark transition-colors mb-4"
          >
            <Plus size={14} />
            Add option
          </button>
        )}

        {/* Settings */}
        <div className="flex items-center gap-4 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isMultiple}
              onChange={(e) => setIsMultiple(e.target.checked)}
              className="w-4 h-4 rounded border-border accent-primary"
            />
            <span className="text-[12px] text-text-secondary">
              Multiple choice
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 rounded border-border accent-primary"
            />
            <span className="text-[12px] text-text-secondary">
              Anonymous
            </span>
          </label>
        </div>

        {/* Create Button */}
        <button
          onClick={handleCreate}
          disabled={!canCreate}
          className={`
            px-4 py-2 rounded-xl text-sm font-semibold transition-all
            ${canCreate
              ? "bg-primary text-white hover:bg-primary-dark cursor-pointer"
              : "bg-background text-text-secondary cursor-not-allowed"
            }
          `}
        >
          Create Poll
        </button>
      </div>
    </motion.div>
  );
}
