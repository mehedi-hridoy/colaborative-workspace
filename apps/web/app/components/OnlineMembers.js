"use client";

import { useEffect, useState } from "react";
import { usePresenceStore } from "../../store/presenceStore";

export default function OnlineMembers({ workspaceId }) {
  const { onlineMembers, members, fetchMembers, joinWorkspace, leaveWorkspace } = usePresenceStore();
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    if (!workspaceId) return;
    fetchMembers(workspaceId);
    joinWorkspace(workspaceId);

    return () => {
      leaveWorkspace(workspaceId);
    };
  }, [workspaceId, fetchMembers, joinWorkspace, leaveWorkspace]);

  const onlineUsers = members.filter((m) => onlineMembers.includes(m.id));
  const offlineUsers = members.filter((m) => !onlineMembers.includes(m.id));

  const getInitial = (user) => {
    return (user?.name || user?.email || "?")[0].toUpperCase();
  };

  return (
    <div className="relative">
      {/* Online indicator bubble */}
      <button
        onClick={() => setShowList(!showList)}
        className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-slate-600 dark:text-zinc-300 hover:bg-white/20 dark:hover:bg-zinc-800/50 rounded-lg transition"
        title="Click to see online/offline members"
      >
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-semibold">
            {onlineMembers.length} {onlineMembers.length === 1 ? "online" : "online"}
          </span>
        </span>
      </button>

      {/* Dropdown list */}
      {showList && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-white/40 dark:border-white/[0.08] bg-white/95 dark:bg-zinc-900 backdrop-blur-md dark:backdrop-blur-none shadow-lg z-50">
          {/* Online members */}
          <div className="border-b border-white/20 dark:border-white/[0.06]">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500">
              🟢 Online ({onlineUsers.length})
            </div>
            <div className="space-y-1 px-2 pb-2">
              {onlineUsers.length === 0 ? (
                <p className="text-[11px] text-slate-400 dark:text-zinc-600 px-2 py-2">None</p>
              ) : (
                onlineUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition"
                  >
                    <span className="h-6 w-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 text-white text-[10px] font-bold flex items-center justify-center">
                      {getInitial(user)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-slate-800 dark:text-zinc-100 truncate">
                        {user.name}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    <span className="text-xs">✓</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Offline members */}
          <div>
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500">
              ⚪ Offline ({offlineUsers.length})
            </div>
            <div className="space-y-1 px-2 pb-2 max-h-40 overflow-y-auto">
              {offlineUsers.length === 0 ? (
                <p className="text-[11px] text-slate-400 dark:text-zinc-600 px-2 py-2">None</p>
              ) : (
                offlineUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition opacity-60"
                  >
                    <span className="h-6 w-6 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {getInitial(user)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-slate-800 dark:text-zinc-300 truncate">
                        {user.name}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-600 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
