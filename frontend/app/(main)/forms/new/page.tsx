"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Plus, Trash2, Copy, GripVertical, Eye, Save, Send,
  Type, AlignLeft, CircleDot, CheckSquare, ChevronDown, Calendar,
  Clock, Upload, Minus, ToggleLeft,
} from "lucide-react";

type QType = "SHORT_TEXT"|"LONG_TEXT"|"MULTIPLE_CHOICE"|"CHECKBOX"|"DROPDOWN"|"DATE"|"TIME"|"FILE_UPLOAD"|"LINEAR_SCALE";

interface Question {
  id: string; question: string; type: QType; required: boolean; options: string[];
}

const Q_TYPES: { type: QType; label: string; icon: typeof Type }[] = [
  { type: "SHORT_TEXT", label: "Short Answer", icon: Type },
  { type: "LONG_TEXT", label: "Paragraph", icon: AlignLeft },
  { type: "MULTIPLE_CHOICE", label: "Multiple Choice", icon: CircleDot },
  { type: "CHECKBOX", label: "Checkboxes", icon: CheckSquare },
  { type: "DROPDOWN", label: "Dropdown", icon: ChevronDown },
  { type: "DATE", label: "Date", icon: Calendar },
  { type: "TIME", label: "Time", icon: Clock },
  { type: "FILE_UPLOAD", label: "File Upload", icon: Upload },
  { type: "LINEAR_SCALE", label: "Linear Scale", icon: Minus },
];

const newQ = (): Question => ({
  id: crypto.randomUUID(), question: "", type: "SHORT_TEXT", required: false, options: ["Option 1"],
});

function QuestionCard({ q, active, onSelect, onChange, onDuplicate, onDelete }: {
  q: Question; active: boolean; onSelect: () => void;
  onChange: (u: Partial<Question>) => void; onDuplicate: () => void; onDelete: () => void;
}) {
  const hasOptions = ["MULTIPLE_CHOICE","CHECKBOX","DROPDOWN"].includes(q.type);

  return (
    <motion.div layout onClick={onSelect}
      className={`bg-white rounded-2xl border ${active ? "border-primary/30 shadow-md ring-2 ring-primary/10" : "border-border shadow-sm"} p-5 cursor-pointer transition-all`}
    >
      <div className="flex items-center justify-center mb-3 opacity-30 hover:opacity-60 transition-opacity cursor-grab">
        <GripVertical size={16} />
      </div>

      <div className="flex items-start gap-4">
        <div className="flex-1 space-y-4">
          <input type="text" value={q.question} onChange={(e) => onChange({ question: e.target.value })}
            placeholder="Question" className="w-full text-base font-medium text-text-primary bg-transparent border-b-2 border-border/50 focus:border-primary pb-2 outline-none transition-colors placeholder:text-text-secondary/40" />

          {active && (
            <div className="flex items-center gap-2">
              <select value={q.type} onChange={(e) => onChange({ type: e.target.value as QType })}
                className="px-3 py-1.5 rounded-lg border border-border/50 bg-background text-[12px] font-medium text-text-primary outline-none focus:border-primary/30">
                {Q_TYPES.map((t) => <option key={t.type} value={t.type}>{t.label}</option>)}
              </select>
            </div>
          )}

          {hasOptions && (
            <div className="space-y-2">
              {q.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-${q.type === "CHECKBOX" ? "sm" : "full"} border-2 border-border shrink-0`} />
                  <input type="text" value={opt} onChange={(e) => {
                    const opts = [...q.options]; opts[i] = e.target.value; onChange({ options: opts });
                  }} className="flex-1 px-2 py-1.5 text-sm text-text-primary bg-transparent border-b border-border/30 focus:border-primary/50 outline-none" />
                  {q.options.length > 1 && active && (
                    <button onClick={(e) => { e.stopPropagation(); const opts = q.options.filter((_, j) => j !== i); onChange({ options: opts }); }}
                      className="p-1 rounded hover:bg-red-50 text-text-secondary hover:text-danger"><Trash2 size={13} /></button>
                  )}
                </div>
              ))}
              {active && (
                <button onClick={(e) => { e.stopPropagation(); onChange({ options: [...q.options, `Option ${q.options.length + 1}`] }); }}
                  className="flex items-center gap-1.5 text-[12px] font-medium text-primary hover:text-primary-dark mt-1">
                  <Plus size={13} /> Add option
                </button>
              )}
            </div>
          )}

          {q.type === "SHORT_TEXT" && <div className="border-b border-border/30 py-2 text-sm text-text-secondary/40">Short answer text</div>}
          {q.type === "LONG_TEXT" && <div className="border-b border-border/30 py-2 text-sm text-text-secondary/40 h-16">Long answer text</div>}
          {q.type === "DATE" && <div className="flex items-center gap-2 text-sm text-text-secondary/40 border-b border-border/30 py-2"><Calendar size={14} /> Month / Day / Year</div>}
          {q.type === "TIME" && <div className="flex items-center gap-2 text-sm text-text-secondary/40 border-b border-border/30 py-2"><Clock size={14} /> Hour : Minute</div>}
          {q.type === "FILE_UPLOAD" && <div className="border-2 border-dashed border-border/50 rounded-xl p-4 text-center text-sm text-text-secondary/40"><Upload size={20} className="mx-auto mb-1" />Click to upload</div>}
          {q.type === "LINEAR_SCALE" && (
            <div className="flex items-center gap-3 py-2">
              {[1,2,3,4,5].map((n) => (
                <div key={n} className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-full border-2 border-border flex items-center justify-center text-xs text-text-secondary">{n}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {active && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
          <div className="flex items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); onDuplicate(); }} className="p-2 rounded-lg hover:bg-background text-text-secondary hover:text-text-primary transition-colors"><Copy size={15} /></button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 rounded-lg hover:bg-red-50 text-text-secondary hover:text-danger transition-colors"><Trash2 size={15} /></button>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-[12px] text-text-secondary">Required</span>
            <button onClick={(e) => { e.stopPropagation(); onChange({ required: !q.required }); }}
              className={`relative w-9 h-5 rounded-full transition-colors ${q.required ? "bg-primary" : "bg-border"}`}>
              <span className={`absolute top-0.5 ${q.required ? "left-4.5" : "left-0.5"} w-4 h-4 rounded-full bg-white shadow transition-all`} />
            </button>
          </label>
        </div>
      )}
    </motion.div>
  );
}

export default function FormBuilderPage() {
  const [title, setTitle] = useState("Untitled Form");
  const [description, setDescription] = useState("");
  const [themeColor, setThemeColor] = useState("#E86E0A");
  const [questions, setQuestions] = useState<Question[]>([newQ()]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);

  const addQuestion = () => { const q = newQ(); setQuestions([...questions, q]); setActiveId(q.id); };
  const updateQuestion = (id: string, u: Partial<Question>) => setQuestions(questions.map((q) => q.id === id ? { ...q, ...u } : q));
  const duplicateQuestion = (id: string) => {
    const q = questions.find((q) => q.id === id); if (!q) return;
    const dup = { ...q, id: crypto.randomUUID() }; setQuestions([...questions, dup]); setActiveId(dup.id);
  };
  const deleteQuestion = (id: string) => { if (questions.length <= 1) return; setQuestions(questions.filter((q) => q.id !== id)); };

  const COLORS = ["#E86E0A", "#3B82F6", "#10B981", "#8B5CF6", "#EF4444", "#F59E0B"];

  return (
    <div className="min-h-full bg-background">
      {/* Toolbar */}
      <div className="sticky top-0 z-20 bg-white border-b border-border/50 px-6 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <a href="/forms" className="p-2 rounded-lg hover:bg-background transition-colors text-text-secondary hover:text-text-primary">
              <ArrowLeft size={18} />
            </a>
            <div>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                className="text-base font-bold text-text-primary bg-transparent outline-none border-b border-transparent hover:border-border/50 focus:border-primary transition-colors" />
              <p className="text-[10.5px] text-text-secondary">Auto-saved · Draft</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Theme colors */}
            <div className="flex items-center gap-1 mr-2">
              {COLORS.map((c) => (
                <button key={c} onClick={() => setThemeColor(c)}
                  className={`w-5 h-5 rounded-full transition-all ${themeColor === c ? "ring-2 ring-offset-1 ring-primary scale-110" : "hover:scale-110"}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
            <button onClick={() => setPreview(!preview)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all ${preview ? "bg-primary-light text-primary" : "text-text-secondary hover:bg-background"}`}>
              <Eye size={14} /> Preview
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold text-text-secondary hover:bg-background transition-all">
              <Save size={14} /> Save
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-[12px] font-semibold shadow-md shadow-primary/20 hover:bg-primary-dark transition-all">
              <Send size={14} /> Publish
            </button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Title Card */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden mb-4">
          <div className="h-2.5" style={{ backgroundColor: themeColor }} />
          <div className="p-6">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full text-2xl font-bold text-text-primary bg-transparent outline-none border-b-2 border-border/30 focus:border-primary pb-2 transition-colors placeholder:text-text-secondary/40"
              placeholder="Form title" />
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Form description" className="w-full text-sm text-text-secondary bg-transparent outline-none border-b border-border/20 focus:border-primary/30 pb-1 mt-3 transition-colors placeholder:text-text-secondary/30" />
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-3">
          {questions.map((q) => (
            <QuestionCard key={q.id} q={q} active={activeId === q.id} onSelect={() => setActiveId(q.id)}
              onChange={(u) => updateQuestion(q.id, u)} onDuplicate={() => duplicateQuestion(q.id)} onDelete={() => deleteQuestion(q.id)} />
          ))}
        </div>

        {/* Add question FAB */}
        <div className="flex justify-center mt-6">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={addQuestion}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-border shadow-sm text-sm font-semibold text-text-primary hover:border-primary/30 hover:text-primary transition-all cursor-pointer">
            <Plus size={16} /> Add question
          </motion.button>
        </div>
      </div>
    </div>
  );
}
