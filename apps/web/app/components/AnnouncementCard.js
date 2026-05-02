"use client";

import { useState } from "react";
import { useAnnouncementStore } from "../store/announcementStore";

const EMOJI_OPTIONS = ["🔥", "👍", "🎉", "❤️", "👀", "🚀"];

export default function AnnouncementCard({ item }) {
  const { addReaction, addComment, togglePin } = useAnnouncementStore();
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [posting, setPosting] = useState(false);
  const [pinning, setPinning] = useState(false);

  const handleComment = async () => {
    if (!comment.trim() || posting) return;
    setPosting(true);
    await addComment(item.id, comment.trim());
    setComment("");
    setPosting(false);
  };

  const handlePin = async () => {
    if (pinning) return;
    setPinning(true);
    await togglePin(item.id);
    setPinning(false);
  };

  const authorName = item.user?.name || item.user?.email || "User";
  const authorInitial = (item.user?.name || item.user?.email || "U")
    .slice(0, 1)
    .toUpperCase();
  const commentCount = item.comments?.length || 0;

  return (
    <article
      className={`relative rounded-lg border bg-white p-4 shadow-sm transition ${
        item.isPinned ? "border-amber-300 bg-amber-50/30" : "border-slate-200"
      }`}
    >
      {/* Pin button — top right */}
      <button
        onClick={handlePin}
        disabled={pinning}
        title={item.isPinned ? "Unpin announcement" : "Pin announcement"}
        className={`absolute right-3 top-3 rounded-md border px-2 py-1 text-[11px] font-medium shadow-sm transition disabled:opacity-50 ${
          item.isPinned
            ? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
        }`}
      >
        {pinning ? "..." : item.isPinned ? "📌 Unpin" : "📌 Pin"}
      </button>

      {/* Pinned badge */}
      {item.isPinned && (
        <div className="mb-2 flex items-center gap-1 text-[11px] font-semibold text-amber-600">
          <span>📌</span> Pinned
        </div>
      )}

      {/* Author + time */}
      <div className="mb-2 flex items-center gap-2.5 pr-16">
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-teal-700 text-[10px] font-bold text-white">
          {authorInitial}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{authorName}</p>
          <p className="text-[11px] text-slate-400">
            {new Date(item.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Content */}
      <p className="mb-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
        {item.content}
      </p>

      {/* Reactions */}
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        {/* Existing reactions grouped */}
        {item.reactions &&
          Object.entries(
            item.reactions.reduce((acc, r) => {
              acc[r.emoji] = (acc[r.emoji] || 0) + 1;
              return acc;
            }, {})
          ).map(([emoji, count]) => (
            <button
              key={emoji}
              onClick={() => addReaction(item.id, emoji)}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-600 transition hover:border-teal-300 hover:bg-teal-50"
            >
              <span className="text-sm">{emoji}</span>
              <span>{count}</span>
            </button>
          ))}

        {/* Quick react buttons */}
        {EMOJI_OPTIONS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => addReaction(item.id, emoji)}
            className="rounded p-0.5 text-sm opacity-40 transition hover:opacity-100"
            title={`React ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Comment toggle + input */}
      <div className="border-t border-slate-100 pt-2">
        <button
          onClick={() => setShowComments(!showComments)}
          className="mb-2 flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-700"
        >
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
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.862 9.862 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          {commentCount > 0
            ? `${commentCount} comment${commentCount > 1 ? "s" : ""}`
            : "Comment"}
        </button>

        {showComments && (
          <>
            {/* Comment list */}
            {commentCount > 0 && (
              <div className="mb-2 space-y-2">
                {item.comments.map((c) => (
                  <div key={c.id} className="flex items-start gap-2">
                    <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-[9px] font-bold text-slate-600">
                      {(c.user?.name || c.user?.email || "U")
                        .slice(0, 1)
                        .toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs text-slate-700">
                        <span className="font-semibold text-slate-900">
                          {c.user?.name || c.user?.email || "User"}
                        </span>{" "}
                        {c.message}
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        {new Date(c.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Comment input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Write a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleComment();
                  }
                }}
                disabled={posting}
                className="min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-50"
              />
              <button
                onClick={handleComment}
                disabled={!comment.trim() || posting}
                className="rounded-md bg-teal-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {posting ? "..." : "Send"}
              </button>
            </div>
          </>
        )}
      </div>
    </article>
  );
}
