"use client";

import { motion } from "framer-motion";
import {
  Database,
  Code2,
  Network,
  Calculator,
  Monitor,
  Bookmark,
  ChevronRight,
} from "lucide-react";
import { SUBJECTS } from "@/lib/resources-mock-data";
import { useResourcesStore } from "@/store/resources.store";

const iconMap: Record<string, React.ElementType> = {
  database: Database,
  code: Code2,
  network: Network,
  calculator: Calculator,
  monitor: Monitor,
};

export default function SubjectCards() {
  const { activeSubjectId, setActiveSubjectId } = useResourcesStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-semibold text-text-primary">
          Subjects in Semester 3
        </h3>
        <button className="text-xs font-medium text-primary hover:text-primary-dark transition-colors">
          View All
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 scroll-smooth" style={{ scrollbarWidth: "none" }}>
        {SUBJECTS.map((subject, i) => {
          const Icon = iconMap[subject.icon] || Database;
          const isActive = activeSubjectId === subject.id;

          return (
            <motion.button
              key={subject.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.06 }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() =>
                setActiveSubjectId(isActive ? null : subject.id)
              }
              className={`
                relative flex-shrink-0 w-[160px] flex flex-col items-start p-4 rounded-2xl border transition-all duration-200 text-left group
                ${
                  isActive
                    ? "border-primary bg-primary-light shadow-sm"
                    : "border-border bg-white hover:border-border hover:shadow-sm"
                }
              `}
            >
              {/* Bookmark icon */}
              <div className="absolute top-3 right-3">
                <Bookmark
                  size={14}
                  className={`${
                    isActive
                      ? "text-primary"
                      : "text-border group-hover:text-text-secondary"
                  } transition-colors`}
                />
              </div>

              {/* Icon */}
              <div
                className="flex items-center justify-center w-10 h-10 rounded-xl mb-3"
                style={{ backgroundColor: subject.bg }}
              >
                <Icon size={18} style={{ color: subject.color }} strokeWidth={2} />
              </div>

              {/* Subject Name */}
              <p
                className={`text-[13px] font-bold leading-tight ${
                  isActive ? "text-primary" : "text-text-primary"
                }`}
              >
                {subject.name}
              </p>

              {/* Faculty / description */}
              <p className="text-[10px] text-text-secondary mt-0.5 leading-tight line-clamp-1">
                {subject.faculty}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-4 mt-3 w-full">
                <div>
                  <p className="text-sm font-bold text-text-primary leading-none">
                    {subject.resources}
                  </p>
                  <p className="text-[9px] text-text-secondary mt-0.5">
                    Resources
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary leading-none">
                    {subject.downloads >= 1000
                      ? `${(subject.downloads / 1000).toFixed(1)}K`
                      : subject.downloads}
                  </p>
                  <p className="text-[9px] text-text-secondary mt-0.5">
                    Downloads
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}

        {/* View more arrow button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex-shrink-0 w-10 flex items-center justify-center rounded-2xl border border-border bg-white hover:bg-background transition-all"
        >
          <ChevronRight size={18} className="text-text-secondary" />
        </motion.button>
      </div>
    </motion.div>
  );
}
