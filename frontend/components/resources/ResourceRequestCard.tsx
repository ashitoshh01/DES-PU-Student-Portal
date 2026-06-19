"use client";

import { motion } from "framer-motion";
import { Send, Lightbulb } from "lucide-react";
import { useResourcesStore } from "@/store/resources.store";

export default function ResourceRequestCard() {
  const { setShowRequestModal } = useResourcesStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="mt-4 p-4 rounded-2xl bg-white border border-border"
    >
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-light flex-shrink-0">
          <Lightbulb size={18} className="text-primary" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-text-primary">
            Can&apos;t find what you need?
          </p>
          <p className="text-[11px] text-text-secondary mt-0.5 leading-relaxed">
            Request a resource and our community will help!
          </p>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowRequestModal(true)}
        className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-amber-500 text-white text-[12px] font-semibold shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      >
        <Send size={13} />
        Request Resource
      </motion.button>
    </motion.div>
  );
}
