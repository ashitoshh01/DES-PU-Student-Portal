"use client";

import Sidebar from "@/components/shared/Sidebar";
import Header from "@/components/shared/Header";
import { useUIStore } from "@/store/ui.store";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen } = useUIStore();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
