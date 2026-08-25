"use client";

import { motion } from "framer-motion";
import { HardDrive, ArrowRight } from "lucide-react";
import { useUIStore } from "@/store/ui.store";

const STORAGE_USED = 8.5;
const STORAGE_TOTAL = 15;
const STORAGE_PERCENT = (STORAGE_USED / STORAGE_TOTAL) * 100;

export default function StorageCard() {
  const { sidebarCollapsed } = useUIStore();

  if (sidebarCollapsed) {
    return (
      <div className="p-4 border-t border-border/50 flex flex-col items-center justify-center">
        <button 
          title={`Storage: ${STORAGE_USED} GB / ${STORAGE_TOTAL} GB (${Math.round(STORAGE_PERCENT)}%)`}
          className="relative p-2.5 rounded-xl hover:bg-background transition-all duration-200 group flex items-center justify-center text-text-secondary hover:text-primary"
        >
          <HardDrive size={18} strokeWidth={1.8} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-border/50">
      <div className="flex items-center gap-2 mb-2">
        <HardDrive size={14} className="text-text-secondary" />
        <span className="text-xs font-medium text-text-secondary">My Storage</span>
      </div>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-lg font-bold text-text-primary">{STORAGE_USED} GB</span>
        <span className="text-xs text-text-secondary">/ {STORAGE_TOTAL} GB</span>
      </div>
      <div className="w-full h-2 bg-background rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${STORAGE_PERCENT}%` }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
          className="h-full rounded-full bg-gradient-to-r from-primary to-amber-500"
        />
      </div>
      <button className="flex items-center gap-1 mt-3 text-xs font-medium text-primary hover:text-primary-dark transition-colors">
        Manage Storage
        <ArrowRight size={12} />
      </button>
    </div>
  );
}
