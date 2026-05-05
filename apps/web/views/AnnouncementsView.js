"use client";
import TopBar from "../app/components/TopBar";
import NotificationBell from "../app/components/NotificationBell";
import AnnouncementInput from "../app/components/AnnouncementInput";
import AnnouncementFeed from "../app/components/AnnouncementFeed";
import { useAnnouncementStore } from "../app/store/announcementStore";

export default function AnnouncementsView({ currentWorkspace, activities }) {
  const { announcements } = useAnnouncementStore();
  const pinned = announcements.filter(a => a.isPinned);

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="Team Feed" subtitle="Stay updated with the latest team broadcasts and activities." searchPlaceholder="Search announcements...">
        <NotificationBell />
      </TopBar>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1fr_300px] overflow-hidden">
        {/* Main feed */}
        <div className="overflow-y-auto p-6 border-r border-white/20 dark:border-white/[0.05]">
          {/* Pinned */}
          {pinned.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">📌</span>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-500">Pinned Announcements</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pinned.map(a => (
                  <div key={a.id} className="glass-card p-4 border-l-4 border-violet-500 dark:border-teal-500">
                    <p className="text-sm font-bold text-slate-800 dark:text-white mb-1 line-clamp-2" dangerouslySetInnerHTML={{__html:a.content}} />
                    <p className="text-[10px] text-slate-400 dark:text-zinc-600">{a.user?.name || a.user?.email} · {new Date(a.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compose */}
          {currentWorkspace ? (
            <>
              <div className="mb-6"><AnnouncementInput workspaceId={currentWorkspace.id} /></div>
              <div className="mb-3 flex items-center gap-4 border-b border-white/20 dark:border-white/[0.05] pb-3">
                <button className="text-sm font-bold text-violet-700 dark:text-teal-400 border-b-2 border-violet-500 dark:border-teal-500 pb-1">Recent</button>
              </div>
              <AnnouncementFeed workspaceId={currentWorkspace.id} />
            </>
          ) : (
            <div className="glass-card p-12 text-center">
              <p className="text-4xl mb-3">📢</p>
              <p className="font-bold text-slate-700 dark:text-zinc-300">Select a workspace to see announcements</p>
            </div>
          )}
        </div>

        {/* Right: Live Activity */}
        <div className="overflow-y-auto p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-sm font-black text-slate-700 dark:text-zinc-300">Live Activity</h2>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          {activities.slice(0, 6).map(a => (
            <div key={a.id} className="flex gap-3">
              <div className="flex h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 dark:from-teal-500 dark:to-teal-700 items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
                {(a.user?.name||"?")[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-white">{a.user?.name || "User"}</p>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed mt-0.5">{a.message}</p>
                <p className="text-[10px] text-slate-400 dark:text-zinc-600 mt-0.5">{new Date(a.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
          {activities.length === 0 && (
            <p className="text-xs text-slate-400 dark:text-zinc-600 text-center py-8 border border-dashed border-white/25 dark:border-white/[0.06] rounded-xl">No activity yet</p>
          )}

          <div className="mt-6 glass-card p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-500 mb-3">Workspace Stats</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-2xl font-black text-slate-800 dark:text-white">{activities.length}</p>
                <p className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase">Activity Rate</p>
              </div>
              <div>
                <p className="text-2xl font-black text-violet-600 dark:text-teal-400">{Math.floor(activities.length / 2)}</p>
                <p className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase">This Week</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
