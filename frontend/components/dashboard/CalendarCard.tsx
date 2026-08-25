"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

// Highlighted dates with types
const events: Record<number, { type: "assignment" | "event" | "exam" | "meeting" }> = {
  4: { type: "assignment" },
  7: { type: "event" },
  12: { type: "exam" },
  17: { type: "meeting" },
  19: { type: "assignment" },
  22: { type: "event" },
  27: { type: "exam" },
};

const eventColors: Record<string, string> = {
  assignment: "#E86E0A",
  event: "#3B82F6",
  exam: "#EF4444",
  meeting: "#10B981",
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function CalendarCard() {
  const [currentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = currentDate.getDate();

  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: 0.15 }}
      className="col-span-12 lg:col-span-4 rounded-[24px] bg-white border border-border shadow-sm card-hover"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-semibold text-text-primary">Calendar</h3>
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-text-primary mr-2">
              {monthName} {year}
            </span>
            <button className="p-1.5 rounded-lg hover:bg-background transition-colors">
              <ChevronLeft size={14} className="text-text-secondary" />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-background transition-colors">
              <ChevronRight size={14} className="text-text-secondary" />
            </button>
          </div>
        </div>

        {/* Days header */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAYS.map((d, i) => (
            <div
              key={i}
              className="text-center text-[11px] font-semibold text-text-secondary/60 py-1"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => {
            const event = day ? events[day] : undefined;
            const isToday = day === today;

            return (
              <div key={i} className="relative flex items-center justify-center">
                {day ? (
                  <button
                    className={`
                      w-8 h-8 rounded-lg text-xs font-medium transition-all relative
                      ${isToday
                        ? "bg-primary text-white font-bold shadow-sm shadow-primary/30"
                        : event
                          ? "hover:bg-background font-semibold"
                          : "text-text-primary hover:bg-background/80"
                      }
                    `}
                    style={
                      event && !isToday
                        ? { color: eventColors[event.type] }
                        : undefined
                    }
                  >
                    {day}
                    {event && (
                      <span
                        className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                        style={{ backgroundColor: eventColors[event.type] }}
                      />
                    )}
                  </button>
                ) : (
                  <span className="w-8 h-8" />
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-4 pt-4 border-t border-border/50">
          {Object.entries(eventColors).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-[10px] text-text-secondary capitalize font-medium">
                {type === "assignment" ? "Assignment Due" : type.charAt(0).toUpperCase() + type.slice(1)}
              </span>
            </div>
          ))}
        </div>

        <button className="flex items-center gap-1 mt-3 text-xs font-medium text-primary hover:text-primary-dark transition-colors mx-auto">
          View Full Calendar
          <ArrowRight size={13} />
        </button>
      </div>
    </motion.div>
  );
}
