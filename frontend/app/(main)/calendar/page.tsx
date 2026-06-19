"use client";

import { motion } from "framer-motion";
import CalendarLeftPanel from "@/components/calendar/CalendarLeftPanel";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import CalendarRightPanel from "@/components/calendar/CalendarRightPanel";
import EventModal from "@/components/calendar/EventModal";
import EventDetailDrawer from "@/components/calendar/EventDetailDrawer";

export default function CalendarPage() {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex h-full overflow-hidden"
      >
        {/* Left Panel — Calendar Categories */}
        <div className="hidden lg:flex flex-col border-r border-border/50 p-4 overflow-y-auto">
          <CalendarLeftPanel />
        </div>

        {/* Center Panel — Calendar Grid */}
        <div className="flex-1 min-w-0 flex flex-col p-4 overflow-hidden">
          <CalendarGrid />
        </div>

        {/* Right Panel — Mini Calendar + Upcoming */}
        <div className="hidden xl:flex flex-col border-l border-border/50 p-4 overflow-y-auto">
          <CalendarRightPanel />
        </div>
      </motion.div>

      {/* Modals & Drawers */}
      <EventModal />
      <EventDetailDrawer />
    </>
  );
}
