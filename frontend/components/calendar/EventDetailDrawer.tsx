"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  Edit3,
  Trash2,
  Copy,
  Share2,
  Tag,
  Download,
  ThumbsUp,
} from "lucide-react";
import { CALENDAR_EVENTS, CALENDAR_CATEGORIES } from "@/lib/calendar-mock-data";
import { useCalendarStore } from "@/store/calendar.store";

function getCategoryColor(categoryId: string) {
  return CALENDAR_CATEGORIES.find((c) => c.id === categoryId)?.color || "#6B7280";
}

function getCategoryLabel(categoryId: string) {
  return CALENDAR_CATEGORIES.find((c) => c.id === categoryId)?.label || "Event";
}

function formatTime(time?: string) {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return m === 0 ? `${hour}:00 ${ampm}` : `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default function EventDetailDrawer() {
  const { selectedEventId, setSelectedEventId } = useCalendarStore();

  const event = selectedEventId
    ? CALENDAR_EVENTS.find((e) => e.id === selectedEventId)
    : null;

  return (
    <AnimatePresence>
      {event && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            onClick={() => setSelectedEventId(null)}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 z-50 h-full w-[380px] max-w-[90vw] bg-white shadow-2xl flex flex-col"
          >
            {/* Header with color bar */}
            <div
              className="h-2 flex-shrink-0"
              style={{ backgroundColor: getCategoryColor(event.category) }}
            />

            <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getCategoryColor(event.category) }}
                />
                <span className="text-[11px] font-semibold text-text-secondary">
                  {getCategoryLabel(event.category)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded-lg hover:bg-background transition-colors">
                  <Edit3 size={14} className="text-text-secondary" />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-background transition-colors">
                  <Trash2 size={14} className="text-danger" />
                </button>
                <button
                  onClick={() => setSelectedEventId(null)}
                  className="p-1.5 rounded-lg hover:bg-background transition-colors"
                >
                  <X size={14} className="text-text-secondary" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <h2 className="text-[18px] font-bold text-text-primary mb-1">
                {event.title}
              </h2>

              {event.description && (
                <p className="text-[13px] text-text-secondary mb-4 leading-relaxed">
                  {event.description}
                </p>
              )}

              {/* Details */}
              <div className="space-y-3 mb-5">
                {/* Date */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0">
                    <Calendar size={14} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-text-primary">
                      {new Date(event.date + "T00:00:00").toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    {event.multiDay && event.endDate && (
                      <p className="text-[10px] text-text-secondary">
                        Until{" "}
                        {new Date(event.endDate + "T00:00:00").toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                </div>

                {/* Time */}
                {!event.allDay && event.startTime && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center flex-shrink-0">
                      <Clock size={14} className="text-info" />
                    </div>
                    <p className="text-[12px] font-semibold text-text-primary">
                      {formatTime(event.startTime)}
                      {event.endTime && ` – ${formatTime(event.endTime)}`}
                    </p>
                  </div>
                )}

                {event.allDay && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center flex-shrink-0">
                      <Clock size={14} className="text-info" />
                    </div>
                    <p className="text-[12px] font-semibold text-text-primary">
                      All Day
                    </p>
                  </div>
                )}

                {/* Location */}
                {event.location && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                      <MapPin size={14} className="text-success" />
                    </div>
                    <p className="text-[12px] font-semibold text-text-primary">
                      {event.location}
                    </p>
                  </div>
                )}

                {/* Organizer */}
                {event.organizer && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
                      <Users size={14} className="text-warning" />
                    </div>
                    <p className="text-[12px] font-semibold text-text-primary">
                      {event.organizer}
                    </p>
                  </div>
                )}

                {/* Category badge */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                    <Tag size={14} className="text-text-secondary" />
                  </div>
                  <span
                    className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold"
                    style={{
                      backgroundColor: CALENDAR_CATEGORIES.find((c) => c.id === event.category)?.bgColor,
                      color: getCategoryColor(event.category),
                    }}
                  >
                    {getCategoryLabel(event.category)}
                  </span>
                </div>
              </div>

              {/* Register button for registerable events */}
              {event.registerable && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 py-3 mb-4 rounded-xl bg-gradient-to-r from-primary to-amber-500 text-white text-[13px] font-bold shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <ThumbsUp size={15} />
                  Register for this Event
                </motion.button>
              )}

              {/* Action buttons */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: Copy, label: "Duplicate" },
                  { icon: Share2, label: "Share" },
                  { icon: Download, label: "Export" },
                ].map((action) => (
                  <button
                    key={action.label}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border hover:bg-background transition-colors"
                  >
                    <action.icon size={15} className="text-text-secondary" />
                    <span className="text-[10px] font-medium text-text-secondary">
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
