"use client";

import { motion } from "framer-motion";
import { FileText, Network, FolderKanban, ArrowRight, Clock } from "lucide-react";

const deadlines = [
  {
    icon: FileText,
    title: "DBMS Assignment",
    due: "Due Tomorrow, 11:59 PM",
    tag: "DBMS",
    urgent: true,
    color: "#EF4444",
    bg: "#FEF2F2",
  },
  {
    icon: Network,
    title: "CN Lab Submission",
    due: "Due in 3 Days",
    tag: "Computer Networks",
    urgent: false,
    color: "#F59E0B",
    bg: "#FFFBEB",
  },
  {
    icon: FolderKanban,
    title: "Mini Project Report",
    due: "Due in 5 Days",
    tag: "Project",
    urgent: false,
    color: "#3B82F6",
    bg: "#EFF6FF",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function DeadlineCard() {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: 0.2 }}
      className="col-span-12 md:col-span-6 lg:col-span-4 rounded-[24px] bg-white border border-border shadow-sm card-hover"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[15px] font-semibold text-text-primary">
            Upcoming Deadlines
          </h3>
          <button className="text-xs font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1">
            View All
          </button>
        </div>

        <div className="space-y-3">
          {deadlines.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-background/80 transition-colors cursor-pointer group"
            >
              <div
                className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
                style={{ backgroundColor: item.bg }}
              >
                <item.icon size={18} style={{ color: item.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate group-hover:text-primary transition-colors">
                  {item.title}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Clock size={12} className="text-text-secondary/60" />
                  <p
                    className="text-xs font-medium"
                    style={{ color: item.urgent ? "#EF4444" : "#64748B" }}
                  >
                    {item.due}
                  </p>
                </div>
              </div>
              <span
                className="hidden sm:inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full"
                style={{
                  backgroundColor: item.bg,
                  color: item.color,
                }}
              >
                {item.tag}
              </span>
            </motion.div>
          ))}
        </div>

        <button className="flex items-center gap-1.5 mt-4 text-xs font-medium text-primary hover:text-primary-dark transition-colors mx-auto">
          View All Deadlines
          <ArrowRight size={14} />
        </button>
      </div>
    </motion.div>
  );
}
