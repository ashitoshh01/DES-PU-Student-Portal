"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  FileText,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import { useResourcesStore } from "@/store/resources.store";

export default function UploadResourceModal() {
  const { showUploadModal, setShowUploadModal } = useResourcesStore();
  const [dragActive, setDragActive] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  if (!showUploadModal) return null;

  return (
    <AnimatePresence>
      {showUploadModal && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            onClick={() => {
              setShowUploadModal(false);
              setUploaded(false);
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-[520px] bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
              <h3 className="text-[15px] font-bold text-text-primary">
                Upload Resource
              </h3>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploaded(false);
                }}
                className="p-1.5 rounded-lg hover:bg-background transition-colors"
              >
                <X size={16} className="text-text-secondary" />
              </button>
            </div>

            <div className="px-6 py-5">
              {uploaded ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-6"
                >
                  <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-3">
                    <CheckCircle2
                      size={32}
                      className="text-success"
                    />
                  </div>
                  <p className="text-[15px] font-bold text-text-primary">
                    Resource Uploaded!
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    Your resource is now available for students
                  </p>
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      setUploaded(false);
                    }}
                    className="mt-5 px-6 py-2 rounded-xl bg-primary text-white text-[12px] font-semibold hover:bg-primary-dark transition-colors"
                  >
                    Done
                  </button>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">
                      Resource Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., DBMS Unit 2 Notes"
                      className="w-full px-3 py-2.5 rounded-xl bg-background border border-border/50 text-[13px] text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </div>

                  {/* Subject & Type */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">
                        Subject
                      </label>
                      <div className="relative">
                        <select className="w-full appearance-none px-3 py-2.5 pr-8 rounded-xl bg-background border border-border/50 text-[13px] text-text-primary focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer">
                          <option>Select Subject</option>
                          <option>DBMS</option>
                          <option>DSA</option>
                          <option>Computer Networks</option>
                          <option>Mathematics-III</option>
                          <option>Operating Systems</option>
                        </select>
                        <ChevronDown
                          size={13}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">
                        Type
                      </label>
                      <div className="relative">
                        <select className="w-full appearance-none px-3 py-2.5 pr-8 rounded-xl bg-background border border-border/50 text-[13px] text-text-primary focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer">
                          <option>Notes</option>
                          <option>PPTs</option>
                          <option>Assignments</option>
                          <option>Lab Manuals</option>
                          <option>PYQ Papers</option>
                          <option>Books</option>
                        </select>
                        <ChevronDown
                          size={13}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Brief description of the resource..."
                      className="w-full px-3 py-2.5 rounded-xl bg-background border border-border/50 text-[13px] text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                    />
                  </div>

                  {/* File Upload */}
                  <div
                    onDragEnter={() => setDragActive(true)}
                    onDragLeave={() => setDragActive(false)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => setDragActive(false)}
                    className={`
                      relative flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed transition-all cursor-pointer
                      ${
                        dragActive
                          ? "border-primary bg-primary-light/50"
                          : "border-border hover:border-primary/30 hover:bg-primary-light/20"
                      }
                    `}
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center mb-2">
                      <Upload size={20} className="text-primary" />
                    </div>
                    <p className="text-[12px] font-semibold text-text-primary">
                      Drag & drop your file here
                    </p>
                    <p className="text-[10px] text-text-secondary mt-1">
                      or{" "}
                      <span className="text-primary font-semibold cursor-pointer">
                        browse files
                      </span>
                    </p>
                    <p className="text-[9px] text-text-secondary/60 mt-2">
                      PDF, PPT, PPTX, DOCX, XLSX, ZIP • Max 50MB
                    </p>
                  </div>

                  {/* Upload button */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setUploaded(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-primary to-amber-500 text-white text-[13px] font-bold shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <Upload size={15} />
                    Upload Resource
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
