"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";
import { useResourcesStore } from "@/store/resources.store";

export default function RequestResourceModal() {
  const { showRequestModal, setShowRequestModal } = useResourcesStore();

  if (!showRequestModal) return null;

  return (
    <AnimatePresence>
      {showRequestModal && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            onClick={() => setShowRequestModal(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-[460px] bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
              <h3 className="text-[15px] font-bold text-text-primary">
                Request a Resource
              </h3>
              <button
                onClick={() => setShowRequestModal(false)}
                className="p-1.5 rounded-lg hover:bg-background transition-colors"
              >
                <X size={16} className="text-text-secondary" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., DBMS Unit 5 Notes"
                  className="w-full px-3 py-2.5 rounded-xl bg-background border border-border/50 text-[13px] text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="e.g., DBMS"
                  className="w-full px-3 py-2.5 rounded-xl bg-background border border-border/50 text-[13px] text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe what resource you need..."
                  className="w-full px-3 py-2.5 rounded-xl bg-background border border-border/50 text-[13px] text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setShowRequestModal(false)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-primary to-amber-500 text-white text-[13px] font-bold shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <Send size={15} />
                Submit Request
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
