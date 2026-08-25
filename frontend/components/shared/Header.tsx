"use client";

import { motion } from "framer-motion";
import { useUIStore } from "@/store/ui.store";
import {
  Search,
  Bell,
  MessageSquare,
  Menu,
  ChevronDown,
} from "lucide-react";

export default function Header() {
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-30 h-[72px] bg-white/80 backdrop-blur-xl border-b border-border/50"
    >
      <div className="relative flex items-center justify-between h-full px-6 gap-4">
        {/* Left: Menu Button */}
        <div className="flex items-center gap-4 z-10">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl hover:bg-background transition-colors lg:hidden"
          >
            <Menu size={20} className="text-text-secondary" />
          </button>
        </div>

        {/* Center: Search Bar (Desktop) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[45%] max-w-3xl min-w-[320px] px-6 pointer-events-none hidden md:block z-20">
          <div className="relative w-full pointer-events-auto">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/50"
            />
            <input
              type="text"
              placeholder="Search subjects, resources, people..."
              className="w-full h-10 pl-11 pr-20 rounded-xl bg-background border border-border/50 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 text-[10px] font-medium text-text-secondary/50 bg-white border border-border/50 rounded-md px-1.5 py-0.5">
              Ctrl + K
            </kbd>
          </div>
        </div>

        {/* Search Bar (Mobile/Tablet) */}
        <div className="flex-1 md:hidden max-w-md">
          <div className="relative w-full">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/50"
            />
            <input
              type="text"
              placeholder="Search..."
              className="w-full h-10 pl-11 pr-10 rounded-xl bg-background border border-border/50 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <button className="relative p-2.5 rounded-xl hover:bg-background transition-colors group">
            <Bell
              size={18}
              className="text-text-secondary group-hover:text-text-primary transition-colors"
              strokeWidth={1.8}
            />
            <span className="absolute top-1.5 right-1.5 flex items-center justify-center w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold">
              6
            </span>
          </button>

          {/* Messages */}
          <button className="relative p-2.5 rounded-xl hover:bg-background transition-colors group">
            <MessageSquare
              size={18}
              className="text-text-secondary group-hover:text-text-primary transition-colors"
              strokeWidth={1.8}
            />
            <span className="absolute top-1.5 right-1.5 flex items-center justify-center w-4 h-4 rounded-full bg-danger text-white text-[9px] font-bold">
              4
            </span>
          </button>

          {/* Divider */}
          <div className="h-8 w-px bg-border/60 mx-1 hidden sm:block" />

          {/* Profile */}
          <button className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-full hover:bg-background transition-colors group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-amber-400 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              AL
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-text-primary leading-tight">
                Ashitosh Lavhate
              </p>
              <p className="text-[10px] text-text-secondary">CSE · Semester 6</p>
            </div>
            <ChevronDown
              size={14}
              className="text-text-secondary hidden sm:block"
            />
          </button>
        </div>
      </div>
    </motion.header>
  );
}
