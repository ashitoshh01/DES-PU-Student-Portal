"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/store/ui.store";
import StorageCard from "@/components/dashboard/StorageCard";
import {
  LayoutDashboard,
  MessageCircle,
  FolderOpen,
  BookOpen,
  Rocket,
  Code2,
  Calendar,
  Cloud,
  Users,
  Trophy,
  Settings,
  HelpCircle,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", active: true },
  { icon: MessageCircle, label: "Chat", href: "/chat" },
  { icon: FolderOpen, label: "Resources", href: "/resources" },
  { icon: BookOpen, label: "Subjects", href: "/subjects" },
  { icon: Rocket, label: "Projects", href: "/projects" },
  { icon: Code2, label: "IDE", href: "/ide" },
  { icon: Calendar, label: "Calendar", href: "/calendar" },
  { icon: Cloud, label: "My Space", href: "/my-space" },
  { icon: Users, label: "Communities", href: "/communities" },
  { icon: Trophy, label: "Leaderboard", href: "/leaderboard" },
];

const bottomItems = [
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: HelpCircle, label: "Help & Support", href: "/help" },
];

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        animate={{
          width: isMobile ? 280 : (sidebarCollapsed ? 80 : 280)
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        className={`
          fixed top-0 left-0 z-50 h-full bg-white border-r border-border flex flex-col
          lg:sticky lg:h-screen lg:shrink-0 lg:z-auto
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Collapse button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 z-50 w-6 h-6 rounded-full bg-white border border-border/80 hidden lg:flex items-center justify-center text-text-secondary hover:text-primary shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          {sidebarCollapsed ? (
            <ChevronRight size={13} strokeWidth={2.5} />
          ) : (
            <ChevronLeft size={13} strokeWidth={2.5} />
          )}
        </motion.button>

        {/* Logo section */}
        <div className="flex items-center justify-between h-[72px] px-5 border-b border-border/50 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="DES PU Logo"
            className={`h-10 object-contain transition-all duration-300 ${
              sidebarCollapsed ? "w-10 object-cover object-left rounded-xl bg-primary-light p-1" : "w-auto"
            }`}
          />
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg hover:bg-background transition-colors lg:hidden"
          >
            <X size={18} className="text-text-secondary" />
          </button>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 py-4 px-3 ${
          sidebarCollapsed ? "overflow-visible" : "overflow-y-auto overflow-x-hidden"
        }`}>
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = activeItem === item.label;
              return (
                <button
                  key={item.label}
                  onClick={() => setActiveItem(item.label)}
                  className={`
                    w-full flex items-center rounded-xl text-[13px] font-medium
                    transition-all duration-200 relative group
                    ${sidebarCollapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"}
                    ${isActive
                      ? "bg-primary-light text-primary"
                      : "text-text-secondary hover:bg-background hover:text-text-primary"
                    }
                  `}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 bg-primary-light rounded-xl"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <item.icon
                    size={18}
                    className={`relative z-10 ${
                      isActive ? "text-primary" : "text-text-secondary group-hover:text-text-primary"
                    }`}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  <AnimatePresence mode="wait">
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.15 }}
                        className="relative z-10 whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {sidebarCollapsed && (
                    <span className="absolute left-full ml-4 px-2.5 py-1.5 rounded-lg bg-text-primary text-white text-[11px] font-medium opacity-0 pointer-events-none translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto transition-all duration-200 whitespace-nowrap shadow-md z-50">
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="h-px bg-border/50 my-4" />

          <div className="space-y-0.5">
            {bottomItems.map((item) => (
              <button
                key={item.label}
                onClick={() => setActiveItem(item.label)}
                className={`
                  w-full flex items-center rounded-xl text-[13px] font-medium text-text-secondary hover:bg-background hover:text-text-primary transition-all duration-200 relative group
                  ${sidebarCollapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"}
                `}
              >
                <item.icon size={18} strokeWidth={1.8} />
                <AnimatePresence mode="wait">
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {sidebarCollapsed && (
                  <span className="absolute left-full ml-4 px-2.5 py-1.5 rounded-lg bg-text-primary text-white text-[11px] font-medium opacity-0 pointer-events-none translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto transition-all duration-200 whitespace-nowrap shadow-md z-50">
                    {item.label}
                  </span>
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* Storage widget */}
        <StorageCard />
      </motion.aside>
    </>
  );
}
