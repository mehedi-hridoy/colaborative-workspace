"use client";
import TopBar from "../app/components/TopBar";
import NotificationBell from "../app/components/NotificationBell";

export default function ActivityView({ activities }) {
  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="Activity" subtitle="Full workspace activity history." searchPlaceholder="Search activity...">
        <NotificationBell />
      </TopBar>
      <div className="flex-1 overflow-y-auto p-6 max-w-3xl">
        {activities.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <p className="text-4xl mb-3">⚡</p>
            <p className="font-bold text-slate-700 dark:text-zinc-300">No activity yet</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-[14px] top-0 bottom-0 w-px bg-white/25 dark:bg-white/[0.06]" />
            <div className="space-y-4">
              {activities.map(a => (
                <div key={a.id} className="flex gap-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-700 dark:from-teal-500 dark:to-teal-700 text-[10px] font-bold text-white flex-shrink-0 relative z-10">
                    {(a.user?.name||"?")[0].toUpperCase()}
                  </div>
                  <div className="glass-card flex-1 p-3 hover:scale-[1.01]">
                    <p className="text-sm text-slate-700 dark:text-zinc-300">
                      <span className="font-bold text-slate-800 dark:text-white">{a.user?.name||a.user?.email||"User"}</span>{" "}{a.message}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-600 mt-1">{new Date(a.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
