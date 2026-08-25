"use client";

import { motion } from "framer-motion";
import { Rocket, Users, Code2, Palette, Server, ArrowRight } from "lucide-react";

const projects = [
  {
    name: "AI Resume Builder",
    role: "Looking for Backend Developer",
    members: 4,
    icon: Code2,
    color: "#E86E0A",
    bg: "#FFF4EB",
  },
  {
    name: "Smart Attendance System",
    role: "Looking for UI/UX Designer",
    members: 3,
    icon: Palette,
    color: "#8B5CF6",
    bg: "#F5F3FF",
  },
  {
    name: "College Event Management",
    role: "Looking for Full Stack Developer",
    members: 5,
    icon: Server,
    color: "#3B82F6",
    bg: "#EFF6FF",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function ProjectsCard() {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: 0.5 }}
      className="col-span-12 lg:col-span-7 rounded-[24px] bg-white border border-border shadow-sm card-hover"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[15px] font-semibold text-text-primary flex items-center gap-2">
            <Rocket size={16} className="text-primary" />
            Recommended Projects
          </h3>
          <button className="text-xs font-medium text-primary hover:text-primary-dark transition-colors">
            View All
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {projects.map((project, i) => (
            <motion.div
              key={project.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.55 + i * 0.1 }}
              whileHover={{ y: -2 }}
              className="p-4 rounded-xl border border-border/50 hover:border-primary/20 hover:shadow-sm cursor-pointer transition-all group"
            >
              <div
                className="flex items-center justify-center w-10 h-10 rounded-xl mb-3"
                style={{ backgroundColor: project.bg }}
              >
                <project.icon size={20} style={{ color: project.color }} />
              </div>
              <p className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors mb-1">
                {project.name}
              </p>
              <p className="text-[11px] text-text-secondary leading-tight">
                {project.role}
              </p>
              <div className="flex items-center gap-1 mt-3 text-primary">
                <Users size={12} />
                <span className="text-[11px] font-semibold">
                  {project.members} Members
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
