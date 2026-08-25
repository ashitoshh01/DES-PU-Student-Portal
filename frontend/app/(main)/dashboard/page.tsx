"use client";

import { motion } from "framer-motion";
import HeroCard from "@/components/dashboard/HeroCard";
import CalendarCard from "@/components/dashboard/CalendarCard";
import DeadlineCard from "@/components/dashboard/DeadlineCard";
import AnnouncementCard from "@/components/dashboard/AnnouncementCard";
import ChatsCard from "@/components/dashboard/ChatsCard";
import SubjectsCard from "@/components/dashboard/SubjectsCard";
import ActivityCard from "@/components/dashboard/ActivityCard";
import ProjectsCard from "@/components/dashboard/ProjectsCard";
import ContributionCard from "@/components/dashboard/ContributionCard";

const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, staggerChildren: 0.08 },
  },
};

export default function DashboardPage() {
  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="p-6 max-w-[1600px] mx-auto"
    >
      {/* Grid layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Row 1: Hero + Calendar */}
        <HeroCard />
        <CalendarCard />

        {/* Row 2: Deadlines + Announcements + Chats */}
        <DeadlineCard />
        <AnnouncementCard />
        <ChatsCard />

        {/* Row 3: Subjects + Activity */}
        <SubjectsCard />
        <ActivityCard />

        {/* Row 4: Projects + Contribution */}
        <ProjectsCard />
        <ContributionCard />
      </div>
    </motion.div>
  );
}
