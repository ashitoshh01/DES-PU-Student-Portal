"use client";

import { motion } from "framer-motion";
import { Database, Network, MonitorCog, Megaphone } from "lucide-react";

const announcements = [
  {
    icon: Database,
    subject: "DBMS",
    title: "Assignment 4 Uploaded",
    faculty: "Dr. P. B. Kulkarni",
    time: "2 hours ago",
    color: "#E86E0A",
    bg: "#FFF4EB",
  },
  {
    icon: Network,
    subject: "Computer Networks",
    title: "Lab Exam Schedule Released",
    faculty: "Prof. A. B. Patil",
    time: "5 hours ago",
    color: "#3B82F6",
    bg: "#EFF6FF",
  },
  {
    icon: MonitorCog,
    subject: "Operating Systems",
    title: "Extra Class Tomorrow",
    faculty: "Prof. S. R. Joshi",
    time: "1 day ago",
    color: "#10B981",
    bg: "#ECFDF5",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function AnnouncementCard() {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: 0.3 }}
      className="col-span-12 md:col-span-6 lg:col-span-4 rounded-[24px] bg-white border border-border shadow-sm card-hover"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[15px] font-semibold text-text-primary flex items-center gap-2">
            <Megaphone size={16} className="text-primary" />
            Latest Announcements
          </h3>
          <button className="text-xs font-medium text-primary hover:text-primary-dark transition-colors">
            View All
          </button>
        </div>

        <div className="space-y-3">
          {announcements.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-background/80 transition-colors cursor-pointer group"
            >
              <div
                className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0 mt-0.5"
                style={{ backgroundColor: item.bg }}
              >
                <item.icon size={18} style={{ color: item.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: item.color }}
                  >
                    {item.subject}
                  </span>
                </div>
                <p className="text-sm font-medium text-text-primary truncate group-hover:text-primary transition-colors">
                  {item.title}
                </p>
                <p className="text-xs text-text-secondary mt-0.5">
                  {item.faculty} · {item.time}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
