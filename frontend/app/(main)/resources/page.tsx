"use client";

import { motion } from "framer-motion";
import {
  Search,
  Upload,
  BookOpen,
  Compass,
  Star,
  Users,
} from "lucide-react";
import { useResourcesStore } from "@/store/resources.store";
import ResourcesWelcomeCard from "@/components/resources/ResourcesWelcomeCard";
import ResourcesExplorer from "@/components/resources/ResourcesExplorer";
import SubjectCards from "@/components/resources/SubjectCards";
import ResourcesTable from "@/components/resources/ResourcesTable";
import ResourcesQuickFilters from "@/components/resources/ResourcesQuickFilters";
import ResourceRequestCard from "@/components/resources/ResourceRequestCard";
import UploadResourceModal from "@/components/resources/UploadResourceModal";
import RequestResourceModal from "@/components/resources/RequestResourceModal";

type TabId = "my-semester" | "explore" | "topper-notes" | "faculty-resources";

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "my-semester", label: "My Semester", icon: BookOpen },
  { id: "explore", label: "Explore", icon: Compass },
  { id: "topper-notes", label: "Topper Notes", icon: Star },
  { id: "faculty-resources", label: "Faculty Resources", icon: Users },
];

export default function ResourcesPage() {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    setShowUploadModal,
  } = useResourcesStore();

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="h-full flex flex-col"
      >
        {/* Page Header */}
        <div className="flex-shrink-0 px-6 pt-6 pb-0">
          {/* Title row */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h1 className="text-2xl font-bold text-text-primary tracking-tight">
                Resources
              </h1>
              <p className="text-sm text-text-secondary mt-0.5">
                Access study materials, notes, papers and more
              </p>
            </div>

            {/* Upload button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-amber-500 text-white text-[13px] font-semibold shadow-sm hover:shadow-md transition-shadow cursor-pointer flex-shrink-0"
            >
              <Upload size={15} />
              Upload Resource
            </motion.button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-border/50">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative flex items-center gap-2 px-4 py-3 text-[13px] font-medium transition-all
                    ${
                      isActive
                        ? "text-primary"
                        : "text-text-secondary hover:text-text-primary"
                    }
                  `}
                >
                  <tab.icon size={15} strokeWidth={isActive ? 2.2 : 1.8} />
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="resources-tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto px-6 pt-5 pb-6">
          <div className="flex gap-5 max-w-[1600px] mx-auto">
            {/* Left Explorer Sidebar */}
            <div className="hidden lg:block w-[220px] flex-shrink-0">
              <div className="sticky top-0">
                <ResourcesExplorer />
                <ResourceRequestCard />
              </div>
            </div>

            {/* Center Content */}
            <div className="flex-1 min-w-0 space-y-5">
              {/* Welcome + Stats */}
              <ResourcesWelcomeCard />

              {/* Subject Cards */}
              <SubjectCards />

              {/* Resources Table */}
              <ResourcesTable />
            </div>

            {/* Right Sidebar — Quick Filters */}
            <div className="hidden xl:block w-[220px] flex-shrink-0">
              <div className="sticky top-0">
                <ResourcesQuickFilters />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modals */}
      <UploadResourceModal />
      <RequestResourceModal />
    </>
  );
}
