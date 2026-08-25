"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

const chats = [
  {
    name: "DBMS Study Group",
    avatar: "📚",
    message: "Rahul: Can someone share notes for Unit 3?",
    time: "10:30 AM",
    unread: 5,
  },
  {
    name: "John Dsouza",
    avatar: "👨‍💻",
    message: "Thanks for the resources!",
    time: "09:15 AM",
    unread: 2,
  },
  {
    name: "Project Team Alpha",
    avatar: "🚀",
    message: "You: Meeting at 4 PM today",
    time: "Yesterday",
    unread: 0,
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function ChatsCard() {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: 0.35 }}
      className="col-span-12 md:col-span-6 lg:col-span-4 rounded-[24px] bg-white border border-border shadow-sm card-hover"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[15px] font-semibold text-text-primary flex items-center gap-2">
            <MessageCircle size={16} className="text-primary" />
            Recent Chats
          </h3>
          <button className="text-xs font-medium text-primary hover:text-primary-dark transition-colors">
            View All
          </button>
        </div>

        <div className="space-y-2">
          {chats.map((chat, i) => (
            <motion.div
              key={chat.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-background/80 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-light text-lg shrink-0">
                {chat.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-text-primary truncate group-hover:text-primary transition-colors">
                    {chat.name}
                  </p>
                  <span className="text-[10px] text-text-secondary ml-2 shrink-0">
                    {chat.time}
                  </span>
                </div>
                <p className="text-xs text-text-secondary truncate mt-0.5">
                  {chat.message}
                </p>
              </div>
              {chat.unread > 0 && (
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold shrink-0">
                  {chat.unread}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
