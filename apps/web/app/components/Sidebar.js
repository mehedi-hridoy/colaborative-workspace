"use client";
import ThemeToggle from "./ThemeToggle";

const NAV = [
  { id:"dashboard",     label:"Dashboard",     icon:"⊞" },
  { id:"goals",         label:"Goals",         icon:"◎" },
  { id:"action-items",  label:"Action Items",  icon:"☰" },
  { id:"announcements", label:"Announcements", icon:"📢" },
  { id:"activity",      label:"Activity",      icon:"⚡" },
  { id:"notifications", label:"Notifications", icon:"🔔" },
];

export default function Sidebar({ activeView, setView, workspaces, currentWorkspace, setCurrentWorkspace, user, onLogout }) {
  return (
    <aside className="glass-sidebar flex h-screen w-[220px] flex-col flex-shrink-0 sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/20 dark:border-white/[0.05]">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 dark:from-teal-600 dark:to-teal-800 shadow-lg flex-shrink-0">
          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black tracking-tight text-slate-800 dark:text-white truncate">PRODUCTIVITYOS</p>
          <p className="text-[10px] text-slate-500 dark:text-zinc-500 uppercase tracking-widest truncate">Team Workspace</p>
        </div>
      </div>

      {/* Workspace selector */}
      <div className="px-3 py-3 border-b border-white/20 dark:border-white/[0.05]">
        <p className="mb-1.5 px-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-600">Workspace</p>
        <div className="space-y-0.5">
          {workspaces.map(ws => (
            <button key={ws.id} onClick={() => setCurrentWorkspace(ws)}
              className={`w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left transition-all text-xs font-medium
                ${currentWorkspace?.id === ws.id
                  ? "bg-violet-100/60 dark:bg-teal-500/10 text-violet-700 dark:text-teal-400"
                  : "text-slate-600 dark:text-zinc-400 hover:bg-white/30 dark:hover:bg-white/[0.05]"}`}>
              <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: ws.color || "#8b5cf6" }} />
              <span className="truncate">{ws.name}</span>
            </button>
          ))}
          {workspaces.length === 0 && <p className="px-2 text-[10px] text-slate-400 dark:text-zinc-600">No workspaces</p>}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {NAV.map(item => {
          const active = activeView === item.id;
          return (
            <button key={item.id} onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all
                ${active
                  ? "bg-violet-100/70 dark:bg-teal-500/10 text-violet-700 dark:text-teal-400 font-bold border-l-2 border-violet-500 dark:border-teal-500"
                  : "text-slate-600 dark:text-zinc-400 hover:bg-white/30 dark:hover:bg-white/[0.05] hover:text-slate-800 dark:hover:text-white font-medium"}`}>
              <span className="text-base leading-none">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User + controls */}
      <div className="border-t border-white/20 dark:border-white/[0.05] px-3 py-3 space-y-2">
        <div className="flex items-center justify-between px-1">
          <ThemeToggle />
          <button onClick={onLogout} title="Logout"
            className="rounded-lg p-1.5 text-slate-400 dark:text-zinc-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
        {user && (
          <div className="flex items-center gap-2.5 rounded-xl bg-white/20 dark:bg-zinc-900 border border-white/30 dark:border-white/[0.07] px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-700 dark:from-teal-500 dark:to-teal-700 text-xs font-bold text-white flex-shrink-0">
              {(user.name || user.email || "U").slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-slate-800 dark:text-white">{user.name || "Member"}</p>
              <p className="truncate text-[10px] text-slate-500 dark:text-zinc-500">
                {currentWorkspace ? "Member" : "No workspace"}
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
