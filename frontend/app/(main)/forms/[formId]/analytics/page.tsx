"use client";

import { motion } from "framer-motion";
import { use } from "react";
import { ArrowLeft, TrendingUp, Users, Clock, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const TEAM_SIZE_DATA = [
  { name: "2 members", value: 8, fill: "#E86E0A" },
  { name: "3 members", value: 15, fill: "#3B82F6" },
  { name: "4 members", value: 18, fill: "#10B981" },
  { name: "5 members", value: 4, fill: "#8B5CF6" },
];

const TECH_DATA = [
  { name: "React", count: 28 }, { name: "Next.js", count: 22 }, { name: "Node.js", count: 25 },
  { name: "Python", count: 18 }, { name: "Flutter", count: 12 }, { name: "Other", count: 5 },
];

const GUIDE_DATA = [
  { name: "Prof. Kulkarni", value: 18, fill: "#E86E0A" },
  { name: "Prof. Patil", value: 14, fill: "#3B82F6" },
  { name: "Prof. Desai", value: 8, fill: "#10B981" },
  { name: "No preference", value: 5, fill: "#94A3B8" },
];

const TREND_DATA = [
  { date: "Jun 1", responses: 3 }, { date: "Jun 3", responses: 5 }, { date: "Jun 5", responses: 8 },
  { date: "Jun 7", responses: 6 }, { date: "Jun 9", responses: 12 }, { date: "Jun 11", responses: 7 },
  { date: "Jun 13", responses: 4 }, { date: "Jun 14", responses: 2 },
];

const PIE_COLORS = ["#E86E0A", "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#94A3B8"];

export default function AnalyticsPage({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = use(params);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <a href={`/forms/${formId}/responses`} className="p-2 rounded-lg hover:bg-background transition-colors text-text-secondary"><ArrowLeft size={18} /></a>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Analytics</h1>
            <p className="text-[12px] text-text-secondary">Semester Project Registration</p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Responses", value: "45", icon: Users, color: "#E86E0A", bg: "#FFF4EB" },
          { label: "Completion Rate", value: "94%", icon: CheckCircle2, color: "#10B981", bg: "#ECFDF5" },
          { label: "Avg. Time", value: "4m 32s", icon: Clock, color: "#3B82F6", bg: "#EFF6FF" },
          { label: "This Week", value: "+12", icon: TrendingUp, color: "#8B5CF6", bg: "#F5F3FF" },
        ].map((s) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg }}>
              <s.icon size={18} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-lg font-bold text-text-primary">{s.value}</p>
              <p className="text-[10.5px] text-text-secondary">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-border shadow-sm p-5">
          <h3 className="text-[14px] font-semibold text-text-primary mb-4">Response Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={TREND_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748B" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} />
              <Line type="monotone" dataKey="responses" stroke="#E86E0A" strokeWidth={2.5} dot={{ r: 4, fill: "#E86E0A" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Team Size Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl border border-border shadow-sm p-5">
          <h3 className="text-[14px] font-semibold text-text-primary mb-4">Team Size Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={TEAM_SIZE_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={false}>
                {TEAM_SIZE_DATA.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Technology Stack */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-border shadow-sm p-5">
          <h3 className="text-[14px] font-semibold text-text-primary mb-4">Technology Stack Preferences</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={TECH_DATA} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748B" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} />
              <Bar dataKey="count" fill="#E86E0A" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Preferred Guide */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl border border-border shadow-sm p-5">
          <h3 className="text-[14px] font-semibold text-text-primary mb-4">Preferred Guide</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={GUIDE_DATA} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={false}>
                {GUIDE_DATA.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Per-Question Breakdown */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl border border-border shadow-sm p-5 mt-6">
        <h3 className="text-[14px] font-semibold text-text-primary mb-4">Question Breakdown</h3>
        <div className="space-y-4">
          {["Team Size", "Technology Stack", "Preferred Guide"].map((q, i) => (
            <div key={q} className="border-b border-border/20 pb-4 last:border-0">
              <p className="text-[12.5px] font-semibold text-text-primary mb-2">Q{i + 5}: {q}</p>
              <div className="space-y-1.5">
                {(i === 0 ? TEAM_SIZE_DATA : i === 1 ? TECH_DATA.map(t => ({ name: t.name, value: t.count })) : GUIDE_DATA).map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <span className="text-[11px] text-text-secondary w-24 truncate">{item.name}</span>
                    <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(item.value / 45) * 100}%` }} transition={{ duration: 0.8, delay: 0.5 }}
                        className="h-full rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                    </div>
                    <span className="text-[11px] font-medium text-text-primary w-8 text-right">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
