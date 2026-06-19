"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  ChevronDown,
  Calendar,
  Bell,
  CheckSquare,
  BookOpen,
  MoreVertical,
} from "lucide-react";
import {
  CALENDAR_CATEGORIES,
  OTHER_CALENDARS,
} from "@/lib/calendar-mock-data";
import { useCalendarStore } from "@/store/calendar.store";
import type { EventCategory } from "@/lib/calendar-mock-data";

const createIcons: Record<string, React.ElementType> = {
  calendar: Calendar,
  bell: Bell,
  "check-square": CheckSquare,
  "book-open": BookOpen,
};

export default function CalendarLeftPanel() {
  const {
    showCreateMenu,
    setShowCreateMenu,
    enabledCategories,
    toggleCategory,
    setShowEventModal,
    setEventModalType,
  } = useCalendarStore();

  const createRef = useRef<HTMLDivElement>(null);

  // Close create menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (createRef.current && !createRef.current.contains(e.target as Node)) {
        setShowCreateMenu(false);
      }
    }
    if (showCreateMenu) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [showCreateMenu, setShowCreateMenu]);

  return (
    <div className="w-[220px] flex-shrink-0 flex flex-col h-full overflow-y-auto overflow-x-hidden pr-1">
      {/* Create Button */}
      <div className="relative mb-5" ref={createRef}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateMenu(!showCreateMenu)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-primary to-amber-500 text-white text-[14px] font-bold shadow-md hover:shadow-lg transition-shadow cursor-pointer w-full"
        >
          <Plus size={18} strokeWidth={2.5} />
          Create
          <ChevronDown size={14} className="ml-auto" />
        </motion.button>

        {/* Create dropdown menu */}
        <AnimatePresence>
          {showCreateMenu && (
            <motion.div
              initial={{ opacity: 0, y: -5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-[52px] left-0 w-full bg-white border border-border rounded-xl shadow-lg z-50 py-1.5 overflow-hidden"
            >
              {[
                { id: "event", label: "Event", icon: Calendar },
                { id: "reminder", label: "Reminder", icon: Bell },
                { id: "task", label: "Task", icon: CheckSquare },
                { id: "study-session", label: "Study Session", icon: BookOpen },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setEventModalType(item.id);
                    setShowEventModal(true);
                    setShowCreateMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-text-secondary hover:bg-primary-light hover:text-primary transition-colors"
                >
                  <item.icon size={15} />
                  {item.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* My Calendars */}
      <div className="mb-5">
        <h4 className="text-[12px] font-semibold text-text-primary mb-3">
          My Calendars
        </h4>
        <div className="space-y-1">
          {CALENDAR_CATEGORIES.map((cat) => {
            const isEnabled = enabledCategories.has(cat.id);
            return (
              <div
                key={cat.id}
                className="flex items-center gap-2.5 py-1.5 px-1 rounded-lg hover:bg-background transition-colors group cursor-pointer"
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleCategory(cat.id)}
                  className="flex-shrink-0 w-[18px] h-[18px] rounded-[4px] border-2 flex items-center justify-center transition-all"
                  style={{
                    borderColor: isEnabled ? cat.color : "#D1D5DB",
                    backgroundColor: isEnabled ? cat.color : "transparent",
                  }}
                >
                  {isEnabled && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path
                        d="M1 4L3.5 6.5L9 1"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>

                {/* Label */}
                <span
                  className={`text-[12px] font-medium flex-1 truncate transition-colors ${
                    isEnabled ? "text-text-primary" : "text-text-secondary"
                  }`}
                  onClick={() => toggleCategory(cat.id)}
                >
                  {cat.label}
                </span>

                {/* More button */}
                <button className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-border-light transition-all">
                  <MoreVertical size={12} className="text-text-secondary" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Other Calendars */}
      <div>
        <h4 className="text-[12px] font-semibold text-text-primary mb-3">
          Other Calendars
        </h4>
        <div className="space-y-1">
          {OTHER_CALENDARS.map((cal) => (
            <div
              key={cal.id}
              className="flex items-center gap-2.5 py-1.5 px-1 rounded-lg hover:bg-background transition-colors group cursor-pointer"
            >
              <button
                className="flex-shrink-0 w-[18px] h-[18px] rounded-[4px] border-2 flex items-center justify-center transition-all"
                style={{
                  borderColor: cal.enabled ? cal.color : "#D1D5DB",
                  backgroundColor: cal.enabled ? cal.color : "transparent",
                }}
              >
                {cal.enabled && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 4L3.5 6.5L9 1"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
              <span className="text-[12px] font-medium flex-1 truncate text-text-primary">
                {cal.label}
              </span>
              <button className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-border-light transition-all">
                <MoreVertical size={12} className="text-text-secondary" />
              </button>
            </div>
          ))}

          {/* Add Calendar */}
          <button className="flex items-center gap-2.5 py-1.5 px-1 rounded-lg hover:bg-background transition-colors text-text-secondary hover:text-primary w-full">
            <Plus size={14} />
            <span className="text-[12px] font-medium">Add Calendar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
