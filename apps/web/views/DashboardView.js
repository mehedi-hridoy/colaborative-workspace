\"use client\";
import { Icons } from \"../lib/icons\";
import TopBar from \"../app/components/TopBar\";
import NotificationBell from "../app/components/NotificationBell";

export default function DashboardView({ user, currentWorkspace, stats, activities, setView }) {
  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title={`Welcome back, ${user?.name?.split(" ")[0] || "there"}.`}
        subtitle="Here is what's happening in your workspace today."
        searchPlaceholder="Search workspace..."
      >
        <NotificationBell />
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-700 dark:from-teal-500 dark:to-teal-700 text-[11px] font-bold text-white">
          {(user?.name || user?.email || "U").slice(0, 2).toUpperCase()}
        </div>
      </TopBar>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-0">
        {/* Main content */}
        <div className="p-6 border-r border-white/20 dark:border-white/[0.05] overflow-y-auto">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {stats.map((s, i) => (
              <div key={s.label} className={`glass-card p-5 card-in`} style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-500">{s.label}</p>
                    <p className="mt-1 text-4xl font-black text-slate-800 dark:text-white">{s.value}</p>
                    {s.sub && <p className="mt-1 text-xs font-semibold text-violet-500 dark:text-teal-500">{s.sub}</p>}
                  </div>
                  <div className="text-3xl opacity-20">{s.icon}</div>
                </div>
                <div className="h-1.5 rounded-full bg-white/30 dark:bg-zinc-800 overflow-hidden">
                  <div className={`h-full rounded-full ${s.barColor || "bg-gradient-to-r from-violet-500 to-purple-600 dark:from-teal-500 dark:to-emerald-500"}`}
                    style={{ width: `${Math.min(100, (s.value / Math.max(s.value, 1)) * 100)}%`, minWidth: s.value > 0 ? "8px" : "0" }} />
                </div>
              </div>
            ))}
          </div>

          {/* Workspace overview */}
          {currentWorkspace ? (
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-black text-slate-800 dark:text-white">{currentWorkspace.name}</h2>
                  {currentWorkspace.description && <p className="text-sm text-slate-500 dark:text-zinc-500">{currentWorkspace.description}</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setView("goals")} className="btn-primary text-xs px-4 py-2">View Goals →</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setView("action-items")} className="flex items-center gap-3 rounded-xl border border-white/30 dark:border-white/[0.07] bg-white/20 dark:bg-zinc-900/60 p-3 hover:bg-white/35 dark:hover:bg-zinc-800/70 transition text-left">
                  <Icons.Menu size={24} className="text-gray-600 dark:text-gray-400" />
                  <div><p className="text-sm font-bold text-slate-800 dark:text-white">Action Items</p><p className="text-xs text-slate-500 dark:text-zinc-500">Manage tasks</p></div>
                </button>
                <button onClick={() => setView("announcements")} className="flex items-center gap-3 rounded-xl border border-white/30 dark:border-white/[0.07] bg-white/20 dark:bg-zinc-900/60 p-3 hover:bg-white/35 dark:hover:bg-zinc-800/70 transition text-left">
                  <Icons.Announcements size={24} className="text-gray-600 dark:text-gray-400" />
                  <div><p className="text-sm font-bold text-slate-800 dark:text-white">Team Feed</p><p className="text-xs text-slate-500 dark:text-zinc-500">Announcements</p></div>
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-card p-10 text-center">
              <div className="flex justify-center mb-4">
                <Icons.Dashboard size={48} className="text-gray-400 dark:text-gray-600" />
              </div>
              <p className="text-lg font-bold text-slate-700 dark:text-zinc-300">Select a workspace</p>
              <p className="text-sm text-slate-500 dark:text-zinc-500 mt-1">Choose from the sidebar to get started</p>
            </div>
          )}
        </div>

        {/* Right: Recent Activity */}
        <div className="p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black text-slate-700 dark:text-zinc-300">Recent Activity</h2>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          {activities.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/30 dark:border-white/[0.07] p-6 text-center text-xs text-slate-400 dark:text-zinc-600">No activity yet</p>
          ) : (
            <div className="space-y-3">
              {activities.slice(0, 8).map(a => (
                <div key={a.id} className="flex gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 dark:from-teal-500 dark:to-teal-700 text-[10px] font-bold text-white flex-shrink-0">
                    {(a.user?.name || "?")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                      <span className="font-bold text-slate-800 dark:text-white">{a.user?.name || "User"}</span>{" "}{a.message}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-600 mt-0.5">{new Date(a.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {activities.length > 0 && (
            <button onClick={() => setView("activity")}
              className="mt-4 w-full rounded-xl border border-white/30 dark:border-white/[0.07] py-2 text-xs font-bold text-slate-500 dark:text-zinc-500 hover:text-violet-600 dark:hover:text-teal-400 transition">
              VIEW ALL ACTIVITY
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
