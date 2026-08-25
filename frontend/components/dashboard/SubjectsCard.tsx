"use client";

import { motion } from "framer-motion";
import { BookOpen, MessageSquareText } from "lucide-react";

const subjects = [
  {
    name: "DBMS",
    faculty: "Prof. P. B. Kulkarni",
    discussions: 3,
    color: "#E86E0A",
    bg: "#FFF4EB",
  },
  {
    name: "Computer Networks",
    faculty: "Prof. A. B. Patil",
    discussions: 2,
    color: "#3B82F6",
    bg: "#EFF6FF",
  },
  {
    name: "Operating Systems",
    faculty: "Prof. S. R. Joshi",
    discussions: 1,
    color: "#10B981",
    bg: "#ECFDF5",
  },
  {
    name: "AI & ML",
    faculty: "Prof. M. S. Shah",
    discussions: 2,
    color: "#8B5CF6",
    bg: "#F5F3FF",
  },
  {
    name: "Web Technology",
    faculty: "Prof. A. N. Gupta",
    discussions: 3,
    color: "#EC4899",
    bg: "#FDF2F8",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function SubjectsCard() {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: 0.4 }}
      className="col-span-12 lg:col-span-7 rounded-[24px] bg-white border border-border shadow-sm card-hover"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[15px] font-semibold text-text-primary flex items-center gap-2">
            <BookOpen size={16} className="text-primary" />
            My Subjects
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {subjects.map((subject, i) => (
            <motion.div
              key={subject.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.08 }}
              whileHover={{ scale: 1.04, y: -2 }}
              className="flex flex-col items-center p-4 rounded-2xl border border-border/50 hover:border-border cursor-pointer transition-all group text-center"
            >
              <div
                className="flex items-center justify-center w-11 h-11 rounded-xl mb-3"
                style={{ backgroundColor: subject.bg }}
              >
                <BookOpen size={20} style={{ color: subject.color }} />
              </div>
              <p className="text-xs font-bold text-text-primary leading-tight group-hover:text-primary transition-colors">
                {subject.name}
              </p>
              <p className="text-[10px] text-text-secondary mt-1 leading-tight">
                {subject.faculty}
              </p>
              {subject.discussions > 0 && (
                <div className="flex items-center gap-1 mt-2">
                  <MessageSquareText size={10} className="text-primary" />
                  <span className="text-[10px] font-semibold text-primary">
                    {subject.discussions} New Post{subject.discussions > 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
