"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { UPCOMING_EVENTS } from "@/lib/calendar-mock-data";

// ============================================================
// Component
// ============================================================

export default function CalendarRightPanel() {
  return (
    <div className="w-[260px] flex-shrink-0 flex flex-col h-full overflow-y-auto overflow-x-hidden pl-1">
      {/* Upcoming Events */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-5"
      >
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[13px] font-semibold text-text-primary">
            Upcoming Events
          </h4>
          <button className="text-[11px] font-medium text-primary hover:text-primary-dark transition-colors">
            View All
          </button>
        </div>

        <div className="space-y-4">
          {UPCOMING_EVENTS.map((group) => (
            <div key={group.label}>
              <p className="text-[11px] font-semibold text-text-secondary mb-2">
                {group.label}
                {group.date && (
                  <span className="font-normal ml-1">• {group.date}</span>
                )}
              </p>

              <div className="space-y-2">
                {group.events.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-background transition-colors cursor-pointer group"
                  >
                    <div
                      className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                      style={{ backgroundColor: ev.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-text-primary truncate group-hover:text-primary transition-colors">
                        {ev.title}
                      </p>
                      <p className="text-[10px] text-text-secondary mt-0.5">
                        {ev.time}
                      </p>
                    </div>
                    {ev.location && (
                      <span className="text-[9px] text-text-secondary/60 flex-shrink-0 mt-0.5 max-w-[80px] text-right truncate">
                        {ev.location}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Google Calendar Sync */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mt-auto"
      >
        <div className="p-4 rounded-2xl bg-primary-light/50 border border-primary/10">
          <div className="flex items-start gap-3 mb-3">
            {/* Google Calendar icon */}
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="#4285F4" strokeWidth="2" />
                <path d="M3 9h18" stroke="#4285F4" strokeWidth="2" />
                <rect x="7" y="12" width="3" height="3" rx="0.5" fill="#EA4335" />
                <rect x="14" y="12" width="3" height="3" rx="0.5" fill="#34A853" />
                <rect x="7" y="16" width="3" height="3" rx="0.5" fill="#FBBC05" />
                <rect x="14" y="16" width="3" height="3" rx="0.5" fill="#4285F4" />
                <path d="M8 2v4" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" />
                <path d="M16 2v4" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-[12px] font-bold text-text-primary">
                Sync with Google Calendar
              </p>
              <p className="text-[10px] text-text-secondary mt-0.5">
                Connect and sync your events
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-amber-500 text-white text-[12px] font-bold shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <ExternalLink size={13} />
            Connect Calendar
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
