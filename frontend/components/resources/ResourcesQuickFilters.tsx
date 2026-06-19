"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { RESOURCE_TYPES, CONTRIBUTORS } from "@/lib/resources-mock-data";
import { useResourcesStore } from "@/store/resources.store";
import type { ResourceType } from "@/lib/resources-mock-data";

export default function ResourcesQuickFilters() {
  const {
    activeResourceType,
    setActiveResourceType,
    filterSemester,
    filterUploadedBy,
    sortBy,
  } = useResourcesStore();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="w-full"
    >
      {/* Quick Filters Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-[13px] font-semibold text-text-primary">
          Quick Filters
        </h4>
        <button className="text-[11px] font-medium text-primary hover:text-primary-dark transition-colors">
          Clear All
        </button>
      </div>

      {/* Resource Type */}
      <div className="mb-5">
        <h5 className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-3">
          Resource Type
        </h5>
        <div className="space-y-1.5">
          {/* All Types option */}
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                activeResourceType === "All Types"
                  ? "border-primary"
                  : "border-border group-hover:border-text-secondary"
              }`}
            >
              {activeResourceType === "All Types" && (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
            </div>
            <span
              className={`text-[12px] font-medium transition-colors ${
                activeResourceType === "All Types"
                  ? "text-primary"
                  : "text-text-secondary group-hover:text-text-primary"
              }`}
            >
              All Types
            </span>
          </label>

          {RESOURCE_TYPES.map((rt) => (
            <label
              key={rt.label}
              className="flex items-center gap-2.5 cursor-pointer group"
              onClick={() => setActiveResourceType(rt.label as ResourceType)}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                  activeResourceType === rt.label
                    ? "border-primary"
                    : "border-border group-hover:border-text-secondary"
                }`}
              >
                {activeResourceType === rt.label && (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                )}
              </div>
              <span
                className={`text-[12px] font-medium transition-colors ${
                  activeResourceType === rt.label
                    ? "text-primary"
                    : "text-text-secondary group-hover:text-text-primary"
                }`}
              >
                {rt.label}{" "}
                <span className="text-[10px] text-text-secondary/60">
                  ({rt.count})
                </span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Subject */}
      <div className="mb-5">
        <h5 className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-2">
          Subject
        </h5>
        <div className="relative">
          <select className="w-full appearance-none px-3 py-2 pr-8 rounded-lg bg-background border border-border/50 text-[12px] font-medium text-text-primary focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer">
            <option>All Subjects</option>
            <option>DBMS</option>
            <option>DSA</option>
            <option>Computer Networks</option>
            <option>Mathematics-III</option>
            <option>Operating Systems</option>
          </select>
          <ChevronDown
            size={13}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
          />
        </div>
      </div>

      {/* Semester */}
      <div className="mb-5">
        <h5 className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-2">
          Semester
        </h5>
        <div className="relative">
          <select className="w-full appearance-none px-3 py-2 pr-8 rounded-lg bg-background border border-border/50 text-[12px] font-medium text-text-primary focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer">
            <option>Semester 3</option>
            <option>Semester 1</option>
            <option>Semester 2</option>
            <option>Semester 4</option>
            <option>Semester 5</option>
            <option>Semester 6</option>
          </select>
          <ChevronDown
            size={13}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
          />
        </div>
      </div>

      {/* Uploaded By */}
      <div className="mb-5">
        <h5 className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-2">
          Uploaded By
        </h5>
        <div className="relative">
          <select className="w-full appearance-none px-3 py-2 pr-8 rounded-lg bg-background border border-border/50 text-[12px] font-medium text-text-primary focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer">
            <option>All</option>
            <option>Students</option>
            <option>Faculty</option>
            <option>Library</option>
          </select>
          <ChevronDown
            size={13}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
          />
        </div>
      </div>

      {/* Sort By */}
      <div className="mb-5">
        <h5 className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-2">
          Sort By
        </h5>
        <div className="relative">
          <select className="w-full appearance-none px-3 py-2 pr-8 rounded-lg bg-background border border-border/50 text-[12px] font-medium text-text-primary focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer">
            <option>Newest First</option>
            <option>Oldest First</option>
            <option>Most Upvoted</option>
            <option>Most Downloaded</option>
            <option>Highest Rated</option>
          </select>
          <ChevronDown
            size={13}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
          />
        </div>
      </div>

      {/* Top Contributors */}
      <div className="mt-6 p-4 rounded-2xl bg-primary-light/50 border border-primary/10">
        <div className="flex items-center justify-between mb-3">
          <h5 className="text-[12px] font-semibold text-primary">
            Top Contributors
          </h5>
          <button className="text-[10px] font-medium text-primary hover:text-primary-dark transition-colors">
            View All
          </button>
        </div>

        <div className="space-y-3">
          {CONTRIBUTORS.map((contributor, i) => (
            <div
              key={contributor.id}
              className="flex items-center gap-2.5"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${contributor.color}, ${contributor.color}88)`,
                }}
              >
                {contributor.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-text-primary truncate">
                  {contributor.name}
                </p>
                <p className="text-[9px] text-text-secondary">
                  {contributor.resources >= 1000
                    ? `${(contributor.resources / 1000).toFixed(1)}K`
                    : contributor.resources}{" "}
                  resources
                </p>
              </div>
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white">
                {i === 0 && <span className="text-xs">🥇</span>}
                {i === 1 && <span className="text-xs">🥈</span>}
                {i === 2 && <span className="text-xs">🥉</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
