"use client";

import { useEffect } from "react";
import { useAnnouncementStore } from "../store/announcementStore";
import AnnouncementCard from "./AnnouncementCard";

export default function AnnouncementFeed({ workspaceId }) {
  const {
    announcements,
    loading,
    fetchAnnouncements,
    initSocket,
    cleanupSocket,
  } = useAnnouncementStore();

  useEffect(() => {
    if (!workspaceId) return;

    fetchAnnouncements(workspaceId);
    initSocket(workspaceId);

    return () => cleanupSocket();
  }, [workspaceId]);

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
        Feed
      </h3>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 py-6">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-teal-600" />
          <p className="text-xs text-slate-400">Loading...</p>
        </div>
      ) : announcements.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400">
          No announcements yet.
        </p>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <AnnouncementCard key={a.id} item={a} />
          ))}
        </div>
      )}
    </div>
  );
}
