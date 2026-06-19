import { create } from "zustand";
import type { CalendarView, EventCategory } from "@/lib/calendar-mock-data";

interface CalendarState {
  // Current date & view
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  activeView: CalendarView;
  setActiveView: (view: CalendarView) => void;

  // Navigation
  goToToday: () => void;
  goToPrev: () => void;
  goToNext: () => void;

  // Category toggles
  enabledCategories: Set<EventCategory>;
  toggleCategory: (id: EventCategory) => void;

  // Create menu
  showCreateMenu: boolean;
  setShowCreateMenu: (show: boolean) => void;

  // Event creation modal
  showEventModal: boolean;
  setShowEventModal: (show: boolean) => void;
  eventModalType: string;
  setEventModalType: (type: string) => void;

  // Event detail drawer
  selectedEventId: string | null;
  setSelectedEventId: (id: string | null) => void;

  // Mini calendar selected date
  miniCalDate: Date;
  setMiniCalDate: (date: Date) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const allCategories: EventCategory[] = [
  "my-events", "assignments", "exams", "faculty-announcements",
  "college-events", "festivals-holidays", "clubs-communities",
  "project-deadlines", "birthdays",
];

export const useCalendarStore = create<CalendarState>((set, get) => ({
  // Default to May 2025 to match the screenshot
  currentDate: new Date(2025, 4, 14), // May 14, 2025
  setCurrentDate: (date) => set({ currentDate: date }),

  activeView: "month",
  setActiveView: (view) => set({ activeView: view }),

  goToToday: () => {
    const today = new Date(2025, 4, 14); // use mock "today"
    set({ currentDate: today, miniCalDate: today });
  },

  goToPrev: () => {
    const { currentDate, activeView } = get();
    const d = new Date(currentDate);
    if (activeView === "month") d.setMonth(d.getMonth() - 1);
    else if (activeView === "week") d.setDate(d.getDate() - 7);
    else if (activeView === "day") d.setDate(d.getDate() - 1);
    else d.setMonth(d.getMonth() - 1);
    set({ currentDate: d, miniCalDate: d });
  },

  goToNext: () => {
    const { currentDate, activeView } = get();
    const d = new Date(currentDate);
    if (activeView === "month") d.setMonth(d.getMonth() + 1);
    else if (activeView === "week") d.setDate(d.getDate() + 7);
    else if (activeView === "day") d.setDate(d.getDate() + 1);
    else d.setMonth(d.getMonth() + 1);
    set({ currentDate: d, miniCalDate: d });
  },

  enabledCategories: new Set(allCategories),
  toggleCategory: (id) =>
    set((state) => {
      const next = new Set(state.enabledCategories);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { enabledCategories: next };
    }),

  showCreateMenu: false,
  setShowCreateMenu: (show) => set({ showCreateMenu: show }),

  showEventModal: false,
  setShowEventModal: (show) => set({ showEventModal: show }),
  eventModalType: "event",
  setEventModalType: (type) => set({ eventModalType: type }),

  selectedEventId: null,
  setSelectedEventId: (id) => set({ selectedEventId: id }),

  miniCalDate: new Date(2025, 4, 14),
  setMiniCalDate: (date) => set({ miniCalDate: date }),

  searchQuery: "",
  setSearchQuery: (q) => set({ searchQuery: q }),
}));
