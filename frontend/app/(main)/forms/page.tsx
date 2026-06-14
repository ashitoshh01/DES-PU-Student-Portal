"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useFormStore, type FormSummary, type FormTab } from "@/store/form.store";
import { MOCK_FORMS } from "@/lib/forms-mock-data";
import {
  Plus,
  Search,
  FileText,
  Clock,
  BarChart3,
  Share2,
  MoreVertical,
  Edit3,
  Trash2,
  Copy,
  ExternalLink,
  Filter,
} from "lucide-react";

const TABS: { key: FormTab; label: string; icon: typeof FileText }[] = [
  { key: "my", label: "My Forms", icon: FileText },
  { key: "drafts", label: "Drafts", icon: Edit3 },
  { key: "shared", label: "Shared with me", icon: Share2 },
  { key: "recent", label: "Recent", icon: Clock },
];

function FormCard({ form }: { form: FormSummary }) {
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  const timeAgo = (() => {
    const diff = Date.now() - new Date(form.updated_at).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      onClick={() => router.push(`/forms/${form.form_id}`)}
      className="bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer group"
    >
      {/* Color banner */}
      <div
        className="h-2.5 w-full"
        style={{ background: form.theme_color }}
      />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${form.theme_color}15` }}
            >
              <FileText
                size={18}
                style={{ color: form.theme_color }}
                strokeWidth={1.8}
              />
            </div>
            <div className="min-w-0">
              <h3 className="text-[14px] font-semibold text-text-primary truncate group-hover:text-primary transition-colors">
                {form.title}
              </h3>
              <p className="text-[11px] text-text-secondary mt-0.5">
                {form.creator_name} · {timeAgo}
              </p>
            </div>
          </div>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setShowMenu(!showMenu);
              }}
              className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-background transition-all text-text-secondary"
            >
              <MoreVertical size={14} />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl border border-border shadow-lg z-50 overflow-hidden">
                  <button onClick={(e) => e.stopPropagation()} className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-text-primary hover:bg-primary-light hover:text-primary transition-colors">
                    <Edit3 size={13} /> Edit
                  </button>
                  <button onClick={(e) => e.stopPropagation()} className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-text-primary hover:bg-primary-light hover:text-primary transition-colors">
                    <Copy size={13} /> Duplicate
                  </button>
                  <button onClick={(e) => e.stopPropagation()} className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-text-primary hover:bg-primary-light hover:text-primary transition-colors">
                    <Share2 size={13} /> Share
                  </button>
                  <button onClick={(e) => e.stopPropagation()} className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-danger hover:bg-red-50 transition-colors">
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Description */}
        {form.description && (
          <p className="text-[12px] text-text-secondary leading-relaxed line-clamp-2 mb-4">
            {form.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Status badge */}
            {form.is_draft ? (
              <span className="flex items-center gap-1 text-[10.5px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Draft
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10.5px] font-semibold text-success bg-emerald-50 px-2 py-0.5 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-success" />
                Active
              </span>
            )}

            {/* Response count */}
            {!form.is_draft && (
              <span className="flex items-center gap-1 text-[11px] text-text-secondary">
                <BarChart3 size={12} />
                {form.response_count} responses
              </span>
            )}
          </div>

          <button className="p-1.5 rounded-lg hover:bg-primary-light transition-colors text-text-secondary hover:text-primary opacity-0 group-hover:opacity-100">
            <ExternalLink size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function FormsPage() {
  const { forms, activeTab, searchQuery, setForms, setActiveTab, setSearchQuery } =
    useFormStore();

  useEffect(() => {
    setForms(MOCK_FORMS);
  }, [setForms]);

  const filteredForms = forms.filter((f) => {
    // Tab filter
    if (activeTab === "drafts" && !f.is_draft) return false;
    if (activeTab === "my" && f.created_by !== "u-self") return false;
    if (activeTab === "shared" && f.created_by === "u-self") return false;

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        f.title.toLowerCase().includes(q) ||
        f.description?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const stats = {
    total: forms.length,
    active: forms.filter((f) => f.is_published).length,
    drafts: forms.filter((f) => f.is_draft).length,
    responses: forms.reduce((sum, f) => sum + f.response_count, 0),
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Forms</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Create, manage and analyze forms
          </p>
        </div>
        <motion.a
          href="/forms/new"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold shadow-md shadow-primary/20 hover:bg-primary-dark transition-colors"
        >
          <Plus size={16} strokeWidth={2.5} />
          Create Form
        </motion.a>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
      >
        {[
          { label: "Total Forms", value: stats.total, color: "#E86E0A", bg: "#FFF4EB" },
          { label: "Active", value: stats.active, color: "#10B981", bg: "#ECFDF5" },
          { label: "Drafts", value: stats.drafts, color: "#F59E0B", bg: "#FFFBEB" },
          { label: "Total Responses", value: stats.responses, color: "#3B82F6", bg: "#EFF6FF" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: stat.bg }}
            >
              <BarChart3 size={18} style={{ color: stat.color }} />
            </div>
            <div>
              <p className="text-lg font-bold text-text-primary">{stat.value}</p>
              <p className="text-[11px] text-text-secondary">{stat.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Tabs + Search */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12.5px] font-semibold transition-all cursor-pointer
                ${activeTab === tab.key
                  ? "bg-primary-light text-primary border border-primary/20"
                  : "text-text-secondary hover:bg-background hover:text-text-primary"
                }
              `}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/50"
          />
          <input
            type="text"
            placeholder="Search forms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 h-9 pl-9 pr-4 rounded-xl bg-white border border-border/50 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Create new card */}
        <motion.a
          href="/forms/new"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -3 }}
          className="bg-white rounded-2xl border-2 border-dashed border-border hover:border-primary/30 p-8 flex flex-col items-center justify-center gap-3 cursor-pointer group transition-all"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus size={24} className="text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">
              Blank Form
            </p>
            <p className="text-[11px] text-text-secondary mt-0.5">
              Start from scratch
            </p>
          </div>
        </motion.a>

        {/* Form cards */}
        {filteredForms.map((form, i) => (
          <motion.div
            key={form.form_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * (i + 1) }}
          >
            <FormCard form={form} />
          </motion.div>
        ))}
      </div>

      {filteredForms.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-4">
            <FileText size={28} className="text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary">
            No forms found
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Create your first form or try a different search
          </p>
        </div>
      )}
    </div>
  );
}
