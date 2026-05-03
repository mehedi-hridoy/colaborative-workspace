"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icons } from "../lib/icons";
import { useAuthStore } from "../store/authStore";
import { useWorkspaceStore } from "../store/workspaceStore";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: Icons.Dashboard },
  { id: "goals", label: "Goals", icon: Icons.Goals },
  { id: "action-items", label: "Action Items", icon: Icons.ActionItems },
  { id: "announcements", label: "Announcements", icon: Icons.Announcements },
  { id: "activity", label: "Activity", icon: Icons.Activity },
  { id: "analytics", label: "Analytics", icon: Icons.Analytics },
  { id: "members", label: "Members", icon: Icons.Members },
];

export default function DashboardLayout({ children, activeTab = "dashboard" }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuthStore();
  const { currentWorkspace } = useWorkspaceStore();

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* ─────────────────────────────────────────────────────────────────────────────
          TOP NAV BAR (Layer 1)
          ───────────────────────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-[#e5e7eb] h-16">
        <div className="flex items-center justify-between px-6 h-full">
          {/* Left */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-[#f5f5f5] rounded-lg transition-colors"
            >
              <Icons.Menu size={24} className="text-black" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Icons.Dashboard size={18} className="text-white" />
              </div>
              <span className="font-semibold text-lg hidden sm:inline">TeamFlow</span>
            </div>
          </div>

          {/* Center - Current Workspace */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm text-[#93939f]">Workspace:</span>
            <span className="text-sm font-medium">{currentWorkspace?.name || "No workspace"}</span>
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden lg:flex items-center bg-[#f5f5f5] rounded-lg px-3 py-2 gap-2 w-48">
              <Icons.Search size={18} className="text-[#93939f]" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent text-sm focus:outline-none w-full"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 hover:bg-[#f5f5f5] rounded-lg transition-colors">
              <Icons.Notifications size={24} className="text-black" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#ff7759] rounded-full" />
            </button>

            {/* User Menu */}
            <div className="flex items-center gap-3 pl-4 border-l border-[#e5e7eb]">
              <div className="w-8 h-8 bg-[#003c33] rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <span className="text-sm font-medium hidden sm:inline">{user?.name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────────────────────
          LEFT SIDEBAR (Layer 2)
          ───────────────────────────────────────────────────────────────────────────── */}
      <aside
        className={`fixed left-0 top-16 bottom-0 z-30 bg-white border-r border-[#e5e7eb] transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <nav className="py-6 px-4 space-y-2 h-full overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <Link
                key={item.id}
                href={`/dashboard?tab=${item.id}`}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-black text-white"
                    : "text-black hover:bg-[#f5f5f5]"
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ─────────────────────────────────────────────────────────────────────────────
          MAIN CONTENT AREA (Layer 3)
          ───────────────────────────────────────────────────────────────────────────── */}
      <main
        className={`mt-16 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}
      >
        <div className="min-h-screen bg-gradient-to-br from-white to-[#fafaf9] p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
