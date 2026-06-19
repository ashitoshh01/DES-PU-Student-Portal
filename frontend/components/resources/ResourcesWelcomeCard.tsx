"use client";

import { motion } from "framer-motion";
import {
  FileText,
  Download,
  ThumbsUp,
  Star,
} from "lucide-react";
import { CURRENT_USER, RESOURCE_STATS } from "@/lib/resources-mock-data";

const stats = [
  {
    icon: FileText,
    value: RESOURCE_STATS.totalResources.toString(),
    label: "Total Resources",
    color: "#E86E0A",
    bg: "#FFF4EB",
  },
  {
    icon: Download,
    value: RESOURCE_STATS.downloads >= 1000 ? `${(RESOURCE_STATS.downloads / 1000).toFixed(1)}K` : RESOURCE_STATS.downloads.toString(),
    label: "Downloads",
    color: "#3B82F6",
    bg: "#EFF6FF",
  },
  {
    icon: ThumbsUp,
    value: RESOURCE_STATS.upvotes.toString(),
    label: "Upvotes",
    color: "#10B981",
    bg: "#ECFDF5",
  },
  {
    icon: Star,
    value: RESOURCE_STATS.avgRating.toString(),
    label: "Avg. Rating",
    color: "#8B5CF6",
    bg: "#F5F3FF",
  },
];

export default function ResourcesWelcomeCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col xl:flex-row gap-4"
    >
      {/* Welcome card */}
      <div
        className="flex-shrink-0 rounded-2xl border border-border px-5 py-4 min-w-[260px]"
        style={{
          background:
            "linear-gradient(135deg, #FFF8F2 0%, #FFFFFF 40%, #FFF4EB 100%)",
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <p className="text-[15px] font-semibold text-text-primary">
            Welcome back, {CURRENT_USER.name}!
          </p>
          <span className="text-lg">👋</span>
        </div>
        <p className="text-xs text-text-secondary">
          Here are your resources for
        </p>
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary to-amber-500 text-white text-xs font-semibold">
          {CURRENT_USER.department} • {CURRENT_USER.year} • Semester{" "}
          {CURRENT_USER.semester}
        </div>
      </div>

      {/* Stats row */}
      <div className="flex flex-1 gap-3 flex-wrap">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.08 }}
            className="flex-1 min-w-[140px] flex items-center gap-3 px-4 py-4 rounded-2xl bg-white border border-border shadow-sm"
          >
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl"
              style={{ backgroundColor: stat.bg }}
            >
              <stat.icon
                size={18}
                style={{ color: stat.color }}
                strokeWidth={2}
              />
            </div>
            <div>
              <p className="text-xl font-bold text-text-primary leading-none">
                {stat.value}
              </p>
              <p className="text-[11px] text-text-secondary mt-1">
                {stat.label}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
