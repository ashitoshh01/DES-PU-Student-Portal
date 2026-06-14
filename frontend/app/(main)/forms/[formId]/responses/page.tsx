"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { use } from "react";
import { ArrowLeft, Download, ChevronDown, ChevronUp, User, Clock, FileText, BarChart3 } from "lucide-react";

const MOCK_RESPONSES = [
  { id: "r1", name: "Rahul Patil", email: "rahul@despu.edu", date: "14 Jun, 2:30 PM", answers: ["Rahul Patil", "2021CSE001", "Smart Campus App", "An app for campus navigation and events", "4 members", "React, Node.js", "Prof. P. B. Kulkarni", "2026-12-15"] },
  { id: "r2", name: "Neha Joshi", email: "neha@despu.edu", date: "14 Jun, 1:15 PM", answers: ["Neha Joshi", "2021CSE015", "ML Attendance System", "Face recognition based attendance", "3 members", "Python, Flutter", "Prof. A. B. Patil", "2026-11-30"] },
  { id: "r3", name: "Vivek Deshmukh", email: "vivek@despu.edu", date: "13 Jun, 4:45 PM", answers: ["Vivek Deshmukh", "2021CSE022", "E-Commerce Platform", "Full stack e-commerce with payment", "3 members", "Next.js, Node.js", "Prof. S. R. Desai", "2027-01-15"] },
  { id: "r4", name: "Ananya Rao", email: "ananya@despu.edu", date: "13 Jun, 11:20 AM", answers: ["Ananya Rao", "2021CSE008", "Health Tracker", "Student health and wellness tracker", "2 members", "Flutter", "Prof. P. B. Kulkarni", "2026-12-01"] },
  { id: "r5", name: "Pooja Sharma", email: "pooja@despu.edu", date: "12 Jun, 3:00 PM", answers: ["Pooja Sharma", "2021CSE031", "Study Buddy", "Peer-to-peer study matching platform", "4 members", "React, Python", "No preference", "2027-02-28"] },
];

const QUESTIONS = ["Full Name", "PRN Number", "Project Title", "Project Description", "Team Size", "Technology Stack", "Preferred Guide", "Expected Completion Date"];

export default function ResponsesPage({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = use(params);
  const [view, setView] = useState<"summary" | "individual">("summary");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [sortAsc, setSortAsc] = useState(false);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <a href="/forms" className="p-2 rounded-lg hover:bg-background transition-colors text-text-secondary"><ArrowLeft size={18} /></a>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Semester Project Registration</h1>
            <p className="text-[12px] text-text-secondary">Responses</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold text-text-secondary hover:bg-background transition-all">
            <Download size={14} /> Export CSV
          </button>
          <a href={`/forms/${formId}/analytics`} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold text-primary bg-primary-light hover:bg-primary/10 transition-all">
            <BarChart3 size={14} /> Analytics
          </a>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Responses", value: MOCK_RESPONSES.length, color: "#E86E0A", bg: "#FFF4EB" },
          { label: "Today", value: 2, color: "#10B981", bg: "#ECFDF5" },
          { label: "This Week", value: 4, color: "#3B82F6", bg: "#EFF6FF" },
          { label: "Completion Rate", value: "94%", color: "#8B5CF6", bg: "#F5F3FF" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.bg }}>
              <FileText size={16} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-lg font-bold text-text-primary">{s.value}</p>
              <p className="text-[10.5px] text-text-secondary">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-1 mb-4">
        {(["summary", "individual"] as const).map((v) => (
          <button key={v} onClick={() => setView(v)}
            className={`px-3.5 py-2 rounded-xl text-[12px] font-semibold transition-all capitalize ${view === v ? "bg-primary-light text-primary border border-primary/20" : "text-text-secondary hover:bg-background"}`}>
            {v}
          </button>
        ))}
      </div>

      {view === "summary" ? (
        /* Table View */
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-background/50">
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">#</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Respondent</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider cursor-pointer hover:text-primary" onClick={() => setSortAsc(!sortAsc)}>
                    <span className="flex items-center gap-1">Submitted {sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />}</span>
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Project Title</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Team Size</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_RESPONSES.map((r, i) => (
                  <tr key={r.id} className="border-b border-border/30 hover:bg-primary-light/20 transition-colors cursor-pointer" onClick={() => { setSelectedIdx(i); setView("individual"); }}>
                    <td className="px-4 py-3 text-text-secondary text-[12px]">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[9px] font-bold">
                          {r.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-[12.5px] font-medium text-text-primary">{r.name}</p>
                          <p className="text-[10px] text-text-secondary">{r.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-text-secondary">{r.date}</td>
                    <td className="px-4 py-3 text-[12px] text-text-primary font-medium">{r.answers[2]}</td>
                    <td className="px-4 py-3 text-[12px] text-text-secondary">{r.answers[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Individual View */
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedIdx(Math.max(0, selectedIdx - 1))} disabled={selectedIdx === 0}
                className="p-1.5 rounded-lg hover:bg-background text-text-secondary disabled:opacity-30"><ChevronUp size={16} /></button>
              <span className="text-sm font-medium text-text-primary">{selectedIdx + 1} of {MOCK_RESPONSES.length}</span>
              <button onClick={() => setSelectedIdx(Math.min(MOCK_RESPONSES.length - 1, selectedIdx + 1))} disabled={selectedIdx === MOCK_RESPONSES.length - 1}
                className="p-1.5 rounded-lg hover:bg-background text-text-secondary disabled:opacity-30"><ChevronDown size={16} /></button>
            </div>
            <div className="flex items-center gap-2 text-[12px] text-text-secondary">
              <User size={13} /> {MOCK_RESPONSES[selectedIdx].name}
              <span className="mx-1">·</span>
              <Clock size={13} /> {MOCK_RESPONSES[selectedIdx].date}
            </div>
          </div>

          <div className="space-y-4">
            {QUESTIONS.map((q, i) => (
              <div key={q} className="border-b border-border/20 pb-4 last:border-0">
                <p className="text-[12px] font-semibold text-text-secondary mb-1">{q}</p>
                <p className="text-sm text-text-primary">{MOCK_RESPONSES[selectedIdx].answers[i]}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
