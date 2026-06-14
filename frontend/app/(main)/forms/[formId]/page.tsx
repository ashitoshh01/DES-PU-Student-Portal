"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { use } from "react";
import { CheckCircle2, CircleDot, CheckSquare, ChevronDown } from "lucide-react";

const MOCK_FORM = {
  title: "Semester Project Registration",
  description: "Register your final year project team and topic for the upcoming semester.",
  theme_color: "#E86E0A",
  questions: [
    { id: "q1", question: "Full Name", type: "SHORT_TEXT" as const, required: true, options: [] },
    { id: "q2", question: "PRN Number", type: "SHORT_TEXT" as const, required: true, options: [] },
    { id: "q3", question: "Project Title", type: "SHORT_TEXT" as const, required: true, options: [] },
    { id: "q4", question: "Project Description", type: "LONG_TEXT" as const, required: true, options: [] },
    { id: "q5", question: "Team Size", type: "MULTIPLE_CHOICE" as const, required: true, options: ["2 members", "3 members", "4 members", "5 members"] },
    { id: "q6", question: "Technology Stack", type: "CHECKBOX" as const, required: false, options: ["React", "Next.js", "Node.js", "Python", "Flutter", "Other"] },
    { id: "q7", question: "Preferred Guide", type: "DROPDOWN" as const, required: true, options: ["Prof. P. B. Kulkarni", "Prof. A. B. Patil", "Prof. S. R. Desai", "No preference"] },
    { id: "q8", question: "Expected Completion Date", type: "DATE" as const, required: false, options: [] },
  ],
};

export default function FormViewPage({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = use(params);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [submitted, setSubmitted] = useState(false);

  const form = MOCK_FORM;

  const updateAnswer = (qId: string, value: string | string[]) => {
    setAnswers({ ...answers, [qId]: value });
  };

  const toggleCheckbox = (qId: string, option: string) => {
    const current = (answers[qId] as string[]) || [];
    const updated = current.includes(option) ? current.filter((o) => o !== option) : [...current, option];
    updateAnswer(qId, updated);
  };

  if (submitted) {
    return (
      <div className="min-h-full bg-background flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl border border-border shadow-sm p-8 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-success" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Response Submitted!</h2>
          <p className="text-sm text-text-secondary mb-6">Your response has been recorded successfully.</p>
          <a href="/forms" className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors inline-block">
            Back to Forms
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Title Card */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden mb-4">
          <div className="h-2.5" style={{ backgroundColor: form.theme_color }} />
          <div className="p-6">
            <h1 className="text-2xl font-bold text-text-primary">{form.title}</h1>
            {form.description && <p className="text-sm text-text-secondary mt-2 leading-relaxed">{form.description}</p>}
            <p className="text-[11px] text-danger mt-3">* Required</p>
          </div>
        </div>

        {/* Questions */}
        {form.questions.map((q, i) => (
          <motion.div key={q.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-border shadow-sm p-5 mb-3">
            <label className="text-sm font-medium text-text-primary mb-3 block">
              {q.question} {q.required && <span className="text-danger">*</span>}
            </label>

            {q.type === "SHORT_TEXT" && (
              <input type="text" value={(answers[q.id] as string) || ""} onChange={(e) => updateAnswer(q.id, e.target.value)}
                placeholder="Your answer" className="w-full border-b-2 border-border/30 focus:border-primary py-2 text-sm text-text-primary outline-none transition-colors bg-transparent" />
            )}
            {q.type === "LONG_TEXT" && (
              <textarea value={(answers[q.id] as string) || ""} onChange={(e) => updateAnswer(q.id, e.target.value)}
                placeholder="Your answer" rows={3} className="w-full border-b-2 border-border/30 focus:border-primary py-2 text-sm text-text-primary outline-none resize-none transition-colors bg-transparent" />
            )}
            {q.type === "MULTIPLE_CHOICE" && (
              <div className="space-y-2">
                {q.options.map((opt) => (
                  <label key={opt} className="flex items-center gap-3 py-1.5 cursor-pointer group">
                    <div className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition-colors ${answers[q.id] === opt ? "border-primary bg-primary" : "border-border group-hover:border-primary/50"}`}>
                      {answers[q.id] === opt && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <input type="radio" name={q.id} value={opt} checked={answers[q.id] === opt} onChange={() => updateAnswer(q.id, opt)} className="hidden" />
                    <span className="text-sm text-text-primary">{opt}</span>
                  </label>
                ))}
              </div>
            )}
            {q.type === "CHECKBOX" && (
              <div className="space-y-2">
                {q.options.map((opt) => (
                  <label key={opt} className="flex items-center gap-3 py-1.5 cursor-pointer group">
                    <div className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center transition-colors ${((answers[q.id] as string[]) || []).includes(opt) ? "border-primary bg-primary" : "border-border group-hover:border-primary/50"}`}>
                      {((answers[q.id] as string[]) || []).includes(opt) && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <input type="checkbox" checked={((answers[q.id] as string[]) || []).includes(opt)} onChange={() => toggleCheckbox(q.id, opt)} className="hidden" />
                    <span className="text-sm text-text-primary">{opt}</span>
                  </label>
                ))}
              </div>
            )}
            {q.type === "DROPDOWN" && (
              <select value={(answers[q.id] as string) || ""} onChange={(e) => updateAnswer(q.id, e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border/50 bg-background text-sm text-text-primary outline-none focus:border-primary/30">
                <option value="">Choose</option>
                {q.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            )}
            {q.type === "DATE" && (
              <input type="date" value={(answers[q.id] as string) || ""} onChange={(e) => updateAnswer(q.id, e.target.value)}
                className="px-3 py-2 rounded-xl border border-border/50 bg-background text-sm text-text-primary outline-none focus:border-primary/30" />
            )}
          </motion.div>
        ))}

        {/* Submit */}
        <div className="flex items-center justify-between mt-4">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setSubmitted(true)}
            className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold shadow-md shadow-primary/20 hover:bg-primary-dark transition-colors"
            style={{ backgroundColor: form.theme_color }}>
            Submit
          </motion.button>
          <button onClick={() => setAnswers({})} className="text-sm text-text-secondary hover:text-primary transition-colors">Clear form</button>
        </div>
      </div>
    </div>
  );
}
