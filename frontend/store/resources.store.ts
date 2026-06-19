import { create } from "zustand";
import type { ResourceType } from "@/lib/resources-mock-data";

type TabId = "my-semester" | "explore" | "topper-notes" | "faculty-resources";
type SortBy = "newest" | "oldest" | "most-upvoted" | "most-downloaded" | "highest-rated";

interface ResourcesState {
  // Active tab
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;

  // Active semester path
  activeDepartmentId: string;
  activeYearId: string;
  activeSemesterId: string;
  setActivePath: (deptId: string, yearId: string, semId: string) => void;

  // Active subject filter
  activeSubjectId: string | null;
  setActiveSubjectId: (id: string | null) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Resource type filter
  activeResourceType: ResourceType | "All Types";
  setActiveResourceType: (type: ResourceType | "All Types") => void;

  // Sort
  sortBy: SortBy;
  setSortBy: (sort: SortBy) => void;

  // Semester filter (quick filter panel)
  filterSemester: string;
  setFilterSemester: (s: string) => void;

  // Uploaded by filter
  filterUploadedBy: string;
  setFilterUploadedBy: (u: string) => void;

  // Table type filter tabs
  tableTypeFilter: ResourceType | "All Types";
  setTableTypeFilter: (type: ResourceType | "All Types") => void;

  // Explorer expanded nodes
  expandedNodes: Set<string>;
  toggleNode: (nodeId: string) => void;

  // Upload modal
  showUploadModal: boolean;
  setShowUploadModal: (show: boolean) => void;

  // Resource request modal
  showRequestModal: boolean;
  setShowRequestModal: (show: boolean) => void;
}

export const useResourcesStore = create<ResourcesState>((set) => ({
  activeTab: "my-semester",
  setActiveTab: (tab) => set({ activeTab: tab }),

  activeDepartmentId: "cse",
  activeYearId: "cse-2",
  activeSemesterId: "cse-2-3",
  setActivePath: (deptId, yearId, semId) =>
    set({
      activeDepartmentId: deptId,
      activeYearId: yearId,
      activeSemesterId: semId,
    }),

  activeSubjectId: null,
  setActiveSubjectId: (id) => set({ activeSubjectId: id }),

  searchQuery: "",
  setSearchQuery: (q) => set({ searchQuery: q }),

  activeResourceType: "All Types",
  setActiveResourceType: (type) => set({ activeResourceType: type }),

  sortBy: "newest",
  setSortBy: (sort) => set({ sortBy: sort }),

  filterSemester: "Semester 3",
  setFilterSemester: (s) => set({ filterSemester: s }),

  filterUploadedBy: "All",
  setFilterUploadedBy: (u) => set({ filterUploadedBy: u }),

  tableTypeFilter: "All Types",
  setTableTypeFilter: (type) => set({ tableTypeFilter: type }),

  expandedNodes: new Set(["engineering", "cse", "cse-2"]),
  toggleNode: (nodeId) =>
    set((state) => {
      const next = new Set(state.expandedNodes);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return { expandedNodes: next };
    }),

  showUploadModal: false,
  setShowUploadModal: (show) => set({ showUploadModal: show }),

  showRequestModal: false,
  setShowRequestModal: (show) => set({ showRequestModal: show }),
}));
