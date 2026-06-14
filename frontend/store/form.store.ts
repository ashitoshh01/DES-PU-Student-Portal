import { create } from "zustand";

// ─── Types ───────────────────────────────────────────────────
export type QuestionType =
  | "SHORT_TEXT"
  | "LONG_TEXT"
  | "MULTIPLE_CHOICE"
  | "CHECKBOX"
  | "DROPDOWN"
  | "DATE"
  | "TIME"
  | "FILE_UPLOAD"
  | "LINEAR_SCALE"
  | "MCQ_GRID"
  | "CHECKBOX_GRID";

export type FormTab = "my" | "drafts" | "shared" | "recent";

export interface FormQuestion {
  question_id: string;
  question: string;
  type: QuestionType;
  is_required: boolean;
  position: number;
  options: string[];
  // For linear scale
  scale_min?: number;
  scale_max?: number;
  scale_min_label?: string;
  scale_max_label?: string;
}

export interface FormSummary {
  form_id: string;
  title: string;
  description?: string;
  created_by: string;
  creator_name?: string;
  response_count: number;
  is_active: boolean;
  is_draft: boolean;
  is_published: boolean;
  theme_color: string;
  created_at: string;
  updated_at: string;
}

export interface FormFull extends FormSummary {
  questions: FormQuestion[];
  allow_edit_responses: boolean;
  expires_at?: string;
}

export interface FormResponse {
  response_id: string;
  respondent_id: string;
  respondent_name: string;
  submitted_at: string;
  answers: {
    question_id: string;
    question_text: string;
    answer_text?: string;
    answer_array: string[];
  }[];
}

// ─── Store State ─────────────────────────────────────────────
interface FormState {
  // Dashboard
  forms: FormSummary[];
  activeTab: FormTab;
  searchQuery: string;

  // Builder
  currentForm: FormFull | null;
  editingQuestionId: string | null;
  isDragging: boolean;
  previewMode: boolean;

  // Responses
  responses: FormResponse[];
  selectedResponseId: string | null;

  // Actions
  setForms: (forms: FormSummary[]) => void;
  setActiveTab: (tab: FormTab) => void;
  setSearchQuery: (q: string) => void;
  setCurrentForm: (form: FormFull | null) => void;
  setEditingQuestion: (id: string | null) => void;
  setIsDragging: (d: boolean) => void;
  setPreviewMode: (p: boolean) => void;
  addQuestion: (q: FormQuestion) => void;
  updateQuestion: (id: string, updates: Partial<FormQuestion>) => void;
  removeQuestion: (id: string) => void;
  reorderQuestions: (startIdx: number, endIdx: number) => void;
  duplicateQuestion: (id: string) => void;
  setResponses: (r: FormResponse[]) => void;
  setSelectedResponse: (id: string | null) => void;
  updateFormMeta: (updates: Partial<FormFull>) => void;
}

export const useFormStore = create<FormState>((set) => ({
  forms: [],
  activeTab: "my",
  searchQuery: "",
  currentForm: null,
  editingQuestionId: null,
  isDragging: false,
  previewMode: false,
  responses: [],
  selectedResponseId: null,

  setForms: (forms) => set({ forms }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setCurrentForm: (form) => set({ currentForm: form }),
  setEditingQuestion: (id) => set({ editingQuestionId: id }),
  setIsDragging: (d) => set({ isDragging: d }),
  setPreviewMode: (p) => set({ previewMode: p }),

  addQuestion: (q) =>
    set((s) => ({
      currentForm: s.currentForm
        ? { ...s.currentForm, questions: [...s.currentForm.questions, q] }
        : null,
    })),

  updateQuestion: (id, updates) =>
    set((s) => ({
      currentForm: s.currentForm
        ? {
            ...s.currentForm,
            questions: s.currentForm.questions.map((q) =>
              q.question_id === id ? { ...q, ...updates } : q
            ),
          }
        : null,
    })),

  removeQuestion: (id) =>
    set((s) => ({
      currentForm: s.currentForm
        ? {
            ...s.currentForm,
            questions: s.currentForm.questions.filter(
              (q) => q.question_id !== id
            ),
          }
        : null,
    })),

  reorderQuestions: (startIdx, endIdx) =>
    set((s) => {
      if (!s.currentForm) return {};
      const questions = [...s.currentForm.questions];
      const [removed] = questions.splice(startIdx, 1);
      questions.splice(endIdx, 0, removed);
      return {
        currentForm: {
          ...s.currentForm,
          questions: questions.map((q, i) => ({ ...q, position: i })),
        },
      };
    }),

  duplicateQuestion: (id) =>
    set((s) => {
      if (!s.currentForm) return {};
      const q = s.currentForm.questions.find((q) => q.question_id === id);
      if (!q) return {};
      const newQ: FormQuestion = {
        ...q,
        question_id: crypto.randomUUID(),
        position: s.currentForm.questions.length,
      };
      return {
        currentForm: {
          ...s.currentForm,
          questions: [...s.currentForm.questions, newQ],
        },
      };
    }),

  setResponses: (r) => set({ responses: r }),
  setSelectedResponse: (id) => set({ selectedResponseId: id }),
  updateFormMeta: (updates) =>
    set((s) => ({
      currentForm: s.currentForm
        ? { ...s.currentForm, ...updates }
        : null,
    })),
}));
