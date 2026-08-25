"use client";

import { motion } from "framer-motion";
import { ClipboardList, Megaphone, MessageSquare } from "lucide-react";
import { getGreeting } from "@/lib/utils";

const stats = [
  {
    icon: ClipboardList,
    value: 3,
    label: "Assignments Due",
    color: "#E86E0A",
    bg: "#FFF4EB",
  },
  {
    icon: Megaphone,
    value: 2,
    label: "Announcements",
    color: "#3B82F6",
    bg: "#EFF6FF",
  },
  {
    icon: MessageSquare,
    value: 5,
    label: "New Messages",
    color: "#10B981",
    bg: "#ECFDF5",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function HeroCard() {
  const greeting = getGreeting();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative col-span-12 lg:col-span-8 overflow-hidden rounded-[24px] border border-border shadow-sm"
      style={{
        background: "linear-gradient(135deg, #FFF8F2 0%, #FFFFFF 40%, #FFF4EB 100%)"
      }}
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Subtle gradient overlay */}
        <div className="absolute top-0 w-80 h-80 bg-gradient-to-bl from-primary/[0.05] to-transparent rounded-full -translate-y-24 translate-x-24" />
        {/* DES Watermark */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 w-[200px] h-[200px] opacity-[0.06] select-none pointer-events-none hidden min-[500px]:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logoFav.png"
            alt="DES Logo Watermark"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      <div className="relative z-10 p-6 pb-7">
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">
            {greeting},{" "}
            <span className="bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">
              Ashitosh!
            </span>{" "}
            👋
          </h1>
          <p className="mt-1 text-text-secondary text-[15px] font-medium">
            Computer Science Engineering
          </p>
          <p className="text-text-secondary/60 text-sm">Semester 6</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          className="flex flex-wrap gap-4 mt-10 mb-1"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
              className="flex items-center gap-3 px-4 py-2.5 rounded-2xl border border-border/60 bg-white/80 backdrop-blur-sm"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
            >
              <div
                className="flex items-center justify-center w-9 h-9 rounded-xl"
                style={{ backgroundColor: stat.bg }}
              >
                <stat.icon size={18} style={{ color: stat.color }} strokeWidth={2} />
              </div>
              <div>
                <p className="text-lg font-bold text-text-primary leading-none">
                  {stat.value}
                </p>
                <p className="text-[11px] text-text-secondary mt-0.5">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Orange wave at bottom */}
      <svg
        viewBox="0 0 1200 40"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 w-full h-10 block z-20 pointer-events-none"
      >
        <defs>
          <linearGradient id="heroWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E86E0A" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#E86E0A" />
          </linearGradient>
        </defs>
        <path
          d="M0,15 Q150,0 300,15 T600,15 T900,15 T1200,15 L1200,40 L0,40 Z"
          fill="url(#heroWaveGrad)"
        />
      </svg>
    </motion.div>
  );
}
