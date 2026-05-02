"use client";

import { useState } from "react";
import { useAnnouncementStore } from "../../store/announcementStore";

const QUICK_EMOJIS = ["👍", "🔥", "🎉", "❤️", "👀", "🚀"];

export default function AnnouncementCard({ announcement, currentUserId }) {
  const { addReaction, addComment, togglePin } = useAnnouncementStore();
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [posting, setPosting] = useState(false);

  // Group reactions by emoji: { "🔥": [user1, user2], ... }
  const reactionGroups = {};
  (announcement.reactions || []).forEach((r) => {
    if (!reactionGroups[r.emoji]) reactionGroups[r.emoji] = [];
    reactionGroups[r.emoji].push(r);
  });

  const handleReact = async (emoji) => {
    await addReaction(announcement.id, emoji);
  };

  const handleComment = async () => {
    if (!commentText.trim() || posting) return;
    setPosting(true);
    const ok = await addComment(announcement.id, commentText.trim());
    if (ok) setCommentText("");
    setPosting(false);
  };

  const handlePin = () => togglePin(announcement.id);

  const commentCount = announcement.comments?.length || 0;
  const timeLabel = new Date(announcement.createdAt).toLocaleString();
  const authorName =
    announcement.user?.name || announcement.user?.email || "User";
  const authorInitial = (
    announcement.user?.name ||
    announcement.user?.email ||
    "U"
  )
    .slice(0, 1)
    .toUpperCase();

  return (
    <article
      className={`rounded-lg border bg-white p-4 shadow-sm transition ${
        announcement.isPinned
          ? "border-amber-300 bg-amber-50/40"
          : "border-slate-200"
      }`}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-teal-700 text-xs font-bold text-white">
            {authorInitial}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {authorName}
            </p>
            <p className="text-[11px] text-slate-400">{timeLabel}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {announcement.isPinned && (
            <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
              <svg
                className="h-3 w-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.828 3.414a2 2 0 012.345 0l.707.707a2 2 0 010 2.828L11.414 8.414l3.172 3.172a1 1 0 01-1.414 1.414L10 9.828l-1.172 1.172a2 2 0 01-2.828 0l-.707-.707a2 2 0 010-2.828L6.586 6.172 3.414 3a1 1 0 011.414-1.414L8 4.758l1.121-1.121.707-.223z" />
              </svg>
              Pinned
            </span>
          )}
          <button
            onClick={handlePin}
            title={announcement.isPinned ? "Unpin" : "Pin"}
            className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <p className="mb-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
        {announcement.content}
      </p>

      {/* Reactions */}
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        {Object.entries(reactionGroups).map(([emoji, reactions]) => {
          const reacted = reactions.some((r) => r.userId === currentUserId);
          return (
            <button
              key={emoji}
              onClick={() => handleReact(emoji)}
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium transition ${
                reacted
                  ? "border-teal-300 bg-teal-50 text-teal-800"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span className="text-sm">{emoji}</span>
              <span>{reactions.length}</span>
            </button>
          );
        })}

        {/* Quick emoji picker */}
        <div className="flex items-center gap-0.5 rounded-full border border-dashed border-slate-200 px-1.5 py-0.5">
          {QUICK_EMOJIS.filter((e) => !reactionGroups[e]).map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReact(emoji)}
              className="rounded p-0.5 text-sm opacity-50 transition hover:opacity-100"
              title={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Comment toggle */}
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
        {showComments && commentCount > 0 ? " ▲" : commentCount > 0 ? " ▼" : ""}
      </button>

      {/* Comments section */}
      {showComments && (
        <div className="border-t border-slate-100 pt-2">
          {commentCount > 0 && (
            <div className="mb-2 space-y-2">
              {announcement.comments.map((c) => (
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
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleComment();
                }
              }}
              disabled={posting}
              className="min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-50"
            />
            <button
              onClick={handleComment}
              disabled={!commentText.trim() || posting}
              className="rounded-md bg-teal-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {posting ? "..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
