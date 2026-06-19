"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Presentation,
  ClipboardList,
  BookOpen,
  ScrollText,
  Library,
  Users,
  ThumbsUp,
  Download,
  MoreVertical,
  Filter,
  ChevronDown,
  Bookmark,
  Eye,
  Share2,
  Flag,
} from "lucide-react";
import { RESOURCES, type Resource, type ResourceType } from "@/lib/resources-mock-data";
import { useResourcesStore } from "@/store/resources.store";

const typeFilters: { label: string; value: ResourceType | "All Types" }[] = [
  { label: "All Types", value: "All Types" },
  { label: "Notes", value: "Notes" },
  { label: "PPTs", value: "PPTs" },
  { label: "Assignments", value: "Assignments" },
  { label: "PYQ Papers", value: "PYQ Papers" },
  { label: "Lab Manuals", value: "Lab Manuals" },
  { label: "Books", value: "Books" },
];

const typeIcons: Record<string, React.ElementType> = {
  Notes: FileText,
  PPTs: Presentation,
  Assignments: ClipboardList,
  "Lab Manuals": BookOpen,
  "PYQ Papers": ScrollText,
  Books: Library,
  "Faculty Resources": Users,
};

const badgeColors: Record<string, { bg: string; text: string }> = {
  Topper: { bg: "#FFF4EB", text: "#E86E0A" },
  Faculty: { bg: "#EFF6FF", text: "#3B82F6" },
  Verified: { bg: "#ECFDF5", text: "#10B981" },
  PYQ: { bg: "#F5F3FF", text: "#8B5CF6" },
  Popular: { bg: "#FDF2F8", text: "#EC4899" },
};

export default function ResourcesTable() {
  const {
    tableTypeFilter,
    setTableTypeFilter,
    activeSubjectId,
    searchQuery,
    activeResourceType,
    sortBy,
  } = useResourcesStore();

  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const filteredResources = useMemo(() => {
    let filtered = [...RESOURCES];

    // By table type tab
    if (tableTypeFilter !== "All Types") {
      filtered = filtered.filter((r) => r.type === tableTypeFilter);
    }

    // By active resource type from quick filters
    if (activeResourceType !== "All Types") {
      filtered = filtered.filter((r) => r.type === activeResourceType);
    }

    // By subject
    if (activeSubjectId) {
      filtered = filtered.filter((r) => r.subjectId === activeSubjectId);
    }

    // By search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.subject.toLowerCase().includes(q) ||
          r.uploadedBy.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortBy) {
      case "oldest":
        filtered.reverse();
        break;
      case "most-upvoted":
        filtered.sort((a, b) => b.upvotes - a.upvotes);
        break;
      case "most-downloaded":
        filtered.sort((a, b) => b.downloads - a.downloads);
        break;
      case "highest-rated":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
    }

    return filtered;
  }, [tableTypeFilter, activeSubjectId, searchQuery, activeResourceType, sortBy]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-semibold text-text-primary">
          Recently Added Resources
        </h3>
        <button className="text-xs font-medium text-primary hover:text-primary-dark transition-colors">
          View All
        </button>
      </div>

      {/* Type filter tabs + Sort */}
      <div className="flex items-center justify-between gap-3 mb-4 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {typeFilters.map((tf) => {
            const isActive = tableTypeFilter === tf.value;
            const Icon = tf.value !== "All Types" ? typeIcons[tf.value] : null;
            return (
              <button
                key={tf.value}
                onClick={() => setTableTypeFilter(tf.value)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap
                  ${
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "bg-background text-text-secondary hover:bg-border-light hover:text-text-primary"
                  }
                `}
              >
                {Icon && <Icon size={12} />}
                {tf.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-text-secondary">
            <span>Sort by:</span>
            <button className="flex items-center gap-1 font-medium text-text-primary hover:text-primary transition-colors">
              Newest
              <ChevronDown size={12} />
            </button>
          </div>
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border text-[11px] font-medium text-text-secondary hover:bg-background transition-colors">
            <Filter size={12} />
            Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_80px_90px_150px_70px_80px_100px_40px] gap-2 px-4 py-3 bg-background/50 border-b border-border/50 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <input type="checkbox" className="w-3.5 h-3.5 rounded accent-primary cursor-pointer" />
            Resource Name
          </div>
          <div>Subject</div>
          <div>Type</div>
          <div>Uploaded By</div>
          <div>Upvotes</div>
          <div>Downloads</div>
          <div>Uploaded On</div>
          <div />
        </div>

        {/* Table rows */}
        <AnimatePresence mode="popLayout">
          {filteredResources.map((resource, i) => (
            <ResourceRow
              key={resource.id}
              resource={resource}
              index={i}
              isLast={i === filteredResources.length - 1}
              menuOpen={menuOpen === resource.id}
              onMenuToggle={() =>
                setMenuOpen(menuOpen === resource.id ? null : resource.id)
              }
              onMenuClose={() => setMenuOpen(null)}
            />
          ))}
        </AnimatePresence>

        {filteredResources.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-14 h-14 rounded-full bg-primary-light flex items-center justify-center mb-3">
              <FileText size={22} className="text-primary" />
            </div>
            <p className="text-sm font-semibold text-text-primary">
              No resources found
            </p>
            <p className="text-xs text-text-secondary mt-1">
              Try adjusting your filters or search query
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================
// Resource Row
// ============================================================

function ResourceRow({
  resource,
  index,
  isLast,
  menuOpen,
  onMenuToggle,
  onMenuClose,
}: {
  resource: Resource;
  index: number;
  isLast: boolean;
  menuOpen: boolean;
  onMenuToggle: () => void;
  onMenuClose: () => void;
}) {
  const TypeIcon = typeIcons[resource.type] || FileText;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.03 }}
      className={`
        group grid grid-cols-[1fr_80px_90px_150px_70px_80px_100px_40px] gap-2 px-4 py-3 items-center hover:bg-primary-light/30 transition-colors cursor-pointer relative
        ${!isLast ? "border-b border-border/30" : ""}
      `}
    >
      {/* Resource Name */}
      <div className="flex items-center gap-3 min-w-0">
        <input type="checkbox" className="w-3.5 h-3.5 rounded accent-primary flex-shrink-0 cursor-pointer" />
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
          style={{ backgroundColor: "#FFF4EB" }}
        >
          <TypeIcon size={14} className="text-primary" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[12px] font-semibold text-text-primary truncate group-hover:text-primary transition-colors">
              {resource.title}
            </p>
            {resource.badges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold flex-shrink-0"
                style={{
                  backgroundColor: badgeColors[badge]?.bg || "#F3F4F6",
                  color: badgeColors[badge]?.text || "#6B7280",
                }}
              >
                {badge}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-text-secondary truncate mt-0.5">
            {resource.description}
          </p>
        </div>
      </div>

      {/* Subject */}
      <div className="text-[11px] font-medium text-text-secondary">
        {resource.subject}
      </div>

      {/* Type */}
      <div className="text-[11px] font-medium text-text-secondary">
        {resource.type}
      </div>

      {/* Uploaded By */}
      <div className="flex items-center gap-2 min-w-0">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
          style={{
            background:
              resource.uploaderRole === "Faculty"
                ? "linear-gradient(135deg, #3B82F6, #6366F1)"
                : "linear-gradient(135deg, #E86E0A, #F59E0B)",
          }}
        >
          {resource.uploaderAvatar}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-text-primary truncate">
            {resource.uploadedBy}
          </p>
          <p className="text-[9px] text-text-secondary">{resource.uploaderRole}</p>
        </div>
      </div>

      {/* Upvotes */}
      <div className="flex items-center gap-1">
        <ThumbsUp size={11} className="text-primary" />
        <span className="text-[11px] font-semibold text-text-primary">
          {resource.upvotes}
        </span>
      </div>

      {/* Downloads */}
      <div className="text-[11px] font-semibold text-text-primary">
        {resource.downloads}
      </div>

      {/* Upload Date */}
      <div className="text-[10px] text-text-secondary">
        {resource.uploadDate}
      </div>

      {/* Actions */}
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMenuToggle();
          }}
          className="p-1.5 rounded-lg hover:bg-background transition-colors opacity-0 group-hover:opacity-100"
        >
          <MoreVertical size={14} className="text-text-secondary" />
        </button>

        <AnimatePresence>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={onMenuClose}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -5 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-8 z-50 w-40 bg-white border border-border rounded-xl shadow-lg py-1.5"
              >
                {[
                  { icon: Eye, label: "Preview" },
                  { icon: Download, label: "Download" },
                  { icon: Bookmark, label: "Bookmark" },
                  { icon: Share2, label: "Share" },
                  { icon: Flag, label: "Report" },
                ].map((action) => (
                  <button
                    key={action.label}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-medium text-text-secondary hover:bg-background hover:text-text-primary transition-colors"
                    onClick={onMenuClose}
                  >
                    <action.icon size={13} />
                    {action.label}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
