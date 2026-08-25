"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import {
  FileEdit,
  MessageSquare,
  FolderOpen,
  Zap,
  ChevronDown,
} from "lucide-react";

const contributions = [
  {
    icon: FileEdit,
    value: 12,
    label: "Posts Created",
    color: "#E86E0A",
    bg: "#FFF4EB",
  },
  {
    icon: MessageSquare,
    value: 28,
    label: "Replies",
    color: "#3B82F6",
    bg: "#EFF6FF",
  },
  {
    icon: FolderOpen,
    value: 8,
    label: "Resources Shared",
    color: "#10B981",
    bg: "#ECFDF5",
  },
  {
    icon: Zap,
    value: 120,
    label: "Points Earned",
    color: "#8B5CF6",
    bg: "#F5F3FF",
  },
];

function AnimatedCounter({ target, duration = 1.5 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, target, duration]);

  return <span ref={ref}>{count}</span>;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function ContributionCard() {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: 0.55 }}
      className="col-span-12 lg:col-span-5 rounded-[24px] bg-white border border-border shadow-sm card-hover"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[15px] font-semibold text-text-primary">
            Your Contribution
          </h3>
          <button className="flex items-center gap-1 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors px-2.5 py-1.5 rounded-lg hover:bg-background">
            This Month
            <ChevronDown size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {contributions.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.08 }}
              className="flex items-center gap-3 p-3 rounded-xl border border-border/40"
            >
              <div
                className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
                style={{ backgroundColor: item.bg }}
              >
                <item.icon size={18} style={{ color: item.color }} />
              </div>
              <div>
                <p className="text-xl font-bold text-text-primary leading-none">
                  <AnimatedCounter target={item.value} />
                </p>
                <p className="text-[10px] text-text-secondary mt-0.5 leading-tight">
                  {item.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
