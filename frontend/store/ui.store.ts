import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  activeModal: string | null;
  theme: "dark" | "light";
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  openModal: (id: string) => void;
  closeModal: () => void;
  setTheme: (theme: "dark" | "light") => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  sidebarCollapsed: false,
  activeModal: null,
  theme: "light",
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),
  setTheme: (theme) => set({ theme }),
}));
