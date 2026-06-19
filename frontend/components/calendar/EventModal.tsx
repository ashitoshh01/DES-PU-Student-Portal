"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  Tag,
  Palette,
  Paperclip,
  Bell,
  Repeat,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import { useCalendarStore } from "@/store/calendar.store";

const REMINDERS = [
  "10 minutes before",
  "30 minutes before",
  "1 hour before",
  "1 day before",
  "1 week before",
];

const RECURRENCE_OPTIONS = [
  "Does not repeat",
  "Daily",
  "Weekly",
  "Monthly",
  "Yearly",
  "Custom",
];

const CATEGORY_OPTIONS = [
  { label: "My Events", color: "#3B82F6" },
  { label: "Assignments", color: "#E86E0A" },
  { label: "Exams", color: "#EF4444" },
  { label: "Faculty Announcements", color: "#8B5CF6" },
  { label: "College Events", color: "#6366F1" },
  { label: "Festivals & Holidays", color: "#10B981" },
  { label: "Clubs & Communities", color: "#06B6D4" },
  { label: "Project Deadlines", color: "#F59E0B" },
];

export default function EventModal() {
  const { showEventModal, setShowEventModal, eventModalType } = useCalendarStore();
  const [created, setCreated] = useState(false);

  if (!showEventModal) return null;

  const titleLabel =
    eventModalType === "reminder"
      ? "New Reminder"
      : eventModalType === "task"
      ? "New Task"
      : eventModalType === "study-session"
      ? "New Study Session"
      : "New Event";

  return (
    <AnimatePresence>
      {showEventModal && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            onClick={() => {
              setShowEventModal(false);
              setCreated(false);
            }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-[540px] bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 flex-shrink-0">
              <h3 className="text-[15px] font-bold text-text-primary">
                {titleLabel}
              </h3>
              <button
                onClick={() => {
                  setShowEventModal(false);
                  setCreated(false);
                }}
                className="p-1.5 rounded-lg hover:bg-background transition-colors"
              >
                <X size={16} className="text-text-secondary" />
              </button>
            </div>

            <div className="px-6 py-5 overflow-y-auto flex-1">
              {created ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-6"
                >
                  <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-3">
                    <CheckCircle2 size={32} className="text-success" />
                  </div>
                  <p className="text-[15px] font-bold text-text-primary">
                    {titleLabel.replace("New ", "")} Created!
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    It has been added to your calendar
                  </p>
                  <button
                    onClick={() => {
                      setShowEventModal(false);
                      setCreated(false);
                    }}
                    className="mt-5 px-6 py-2 rounded-xl bg-primary text-white text-[12px] font-semibold hover:bg-primary-dark transition-colors"
                  >
                    Done
                  </button>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">
                      Title
                    </label>
                    <input
                      type="text"
                      placeholder={
                        eventModalType === "study-session"
                          ? "e.g., DBMS Chapter 5 Study"
                          : "e.g., Team Meeting"
                      }
                      className="w-full px-3 py-2.5 rounded-xl bg-background border border-border/50 text-[13px] text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Add description..."
                      className="w-full px-3 py-2.5 rounded-xl bg-background border border-border/50 text-[13px] text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                    />
                  </div>

                  {/* Date + Time */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">
                        <Calendar size={11} className="inline mr-1" />
                        Date
                      </label>
                      <input
                        type="date"
                        defaultValue="2025-05-14"
                        className="w-full px-3 py-2.5 rounded-xl bg-background border border-border/50 text-[12px] text-text-primary focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">
                        <Clock size={11} className="inline mr-1" />
                        Start
                      </label>
                      <input
                        type="time"
                        defaultValue="10:00"
                        className="w-full px-3 py-2.5 rounded-xl bg-background border border-border/50 text-[12px] text-text-primary focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">
                        <Clock size={11} className="inline mr-1" />
                        End
                      </label>
                      <input
                        type="time"
                        defaultValue="11:00"
                        className="w-full px-3 py-2.5 rounded-xl bg-background border border-border/50 text-[12px] text-text-primary focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">
                      <MapPin size={11} className="inline mr-1" />
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="Add location"
                      className="w-full px-3 py-2.5 rounded-xl bg-background border border-border/50 text-[13px] text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </div>

                  {/* Guests + Category */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">
                        <Users size={11} className="inline mr-1" />
                        Guests
                      </label>
                      <input
                        type="text"
                        placeholder="Add guests"
                        className="w-full px-3 py-2.5 rounded-xl bg-background border border-border/50 text-[13px] text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">
                        <Tag size={11} className="inline mr-1" />
                        Category
                      </label>
                      <div className="relative">
                        <select className="w-full appearance-none px-3 py-2.5 pr-8 rounded-xl bg-background border border-border/50 text-[12px] text-text-primary focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer">
                          {CATEGORY_OPTIONS.map((c) => (
                            <option key={c.label}>{c.label}</option>
                          ))}
                        </select>
                        <ChevronDown
                          size={13}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Reminder + Recurrence */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">
                        <Bell size={11} className="inline mr-1" />
                        Reminder
                      </label>
                      <div className="relative">
                        <select className="w-full appearance-none px-3 py-2.5 pr-8 rounded-xl bg-background border border-border/50 text-[12px] text-text-primary focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer">
                          {REMINDERS.map((r) => (
                            <option key={r}>{r}</option>
                          ))}
                        </select>
                        <ChevronDown
                          size={13}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">
                        <Repeat size={11} className="inline mr-1" />
                        Recurrence
                      </label>
                      <div className="relative">
                        <select className="w-full appearance-none px-3 py-2.5 pr-8 rounded-xl bg-background border border-border/50 text-[12px] text-text-primary focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer">
                          {RECURRENCE_OPTIONS.map((r) => (
                            <option key={r}>{r}</option>
                          ))}
                        </select>
                        <ChevronDown
                          size={13}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Attachments */}
                  <div>
                    <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">
                      <Paperclip size={11} className="inline mr-1" />
                      Attachments
                    </label>
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-background border border-border/50 border-dashed cursor-pointer hover:border-primary/30 transition-all">
                      <Paperclip size={14} className="text-text-secondary/50" />
                      <span className="text-[12px] text-text-secondary/50">
                        Click to attach files
                      </span>
                    </div>
                  </div>

                  {/* Create button */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setCreated(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-primary to-amber-500 text-white text-[13px] font-bold shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <Calendar size={15} />
                    Create {eventModalType === "study-session" ? "Study Session" : eventModalType.charAt(0).toUpperCase() + eventModalType.slice(1)}
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
