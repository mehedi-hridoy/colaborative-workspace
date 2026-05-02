"use client";

import { useEffect, useState } from "react";
import { useAnnouncementStore } from "../../store/announcementStore";
import { useAuthStore } from "../../store/authStore";
import AnnouncementCard from "./AnnouncementCard";

export default function AnnouncementFeed({ workspaceId }) {
  const {
    announcements,
    loading,
    fetchAnnouncements,
    createAnnouncement,
    initSocketListeners,
    cleanupSocketListeners,
  } = useAnnouncementStore();
  const { user } = useAuthStore();

  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);

  // Fetch announcements and set up socket listeners
  useEffect(() => {
    if (!workspaceId) return;

    fetchAnnouncements(workspaceId);
    initSocketListeners();

    return () => {
      cleanupSocketListeners();
    };
  }, [workspaceId, fetchAnnouncements, initSocketListeners, cleanupSocketListeners]);

  const handlePost = async () => {
    if (!content.trim() || posting) return;

    setPosting(true);
    const ok = await createAnnouncement(content.trim(), workspaceId);
    if (ok) setContent("");
    setPosting(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5 text-teal-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
            />
          </svg>
          <h2 className="text-base font-semibold">Announcements</h2>
        </div>
        {announcements.length > 0 && (
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">
            {announcements.length}
          </span>
        )}
      </div>

      {/* Compose input */}
      <div className="mb-4 rounded-lg border border-slate-200 bg-white p-3">
        <textarea
          placeholder="Share an announcement with your team..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={2}
          disabled={posting}
          className="w-full resize-none rounded-md border-0 bg-transparent p-0 text-sm outline-none placeholder:text-slate-400 disabled:text-slate-400"
        />
        <div className="mt-2 flex justify-end">
          <button
            onClick={handlePost}
            disabled={!content.trim() || posting}
            className="inline-flex items-center gap-1.5 rounded-md bg-teal-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
          >
            {posting ? (
              <>
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Posting...
              </>
            ) : (
              <>
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
                Post
              </>
            )}
          </button>
        </div>
      </div>

      {/* Feed */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 py-8">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-teal-600" />
          <p className="text-sm text-slate-400">Loading announcements...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 py-8 text-center">
          <svg
            className="mx-auto mb-2 h-8 w-8 text-slate-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
            />
          </svg>
          <p className="text-sm text-slate-400">No announcements yet.</p>
          <p className="mt-1 text-xs text-slate-400">
            Be the first to share something!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <AnnouncementCard
              key={a.id}
              announcement={a}
              currentUserId={user?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
