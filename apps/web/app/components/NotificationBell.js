"use client";

import { useEffect, useRef, useState } from "react";
import { useNotificationStore } from "../store/notificationStore";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const TYPE_META = {
  COMMENT: { icon: "💬", color: "bg-blue-100 text-blue-600",   label: "Comment"  },
  REACTION: { icon: "🎉", color: "bg-amber-100 text-amber-600", label: "Reaction" },
  MENTION:  { icon: "✦",  color: "bg-violet-100 text-violet-600", label: "Mention" },
};

function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60)  return "just now";
  const m = Math.floor(s / 60);
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function NotificationBell() {
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllRead,
  } = useNotificationStore();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    // Refresh list whenever panel opens
    if (next) fetchNotifications();
  };

  const handleClickItem = (n) => {
    if (!n.isRead) markAsRead(n.id);
  };

  const unread = notifications.filter((n) => !n.isRead);
  const read   = notifications.filter((n) =>  n.isRead);

  return (
    <>
      {/* Inline keyframes */}
      <style>{`
        @keyframes nb-slide-down {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        @keyframes nb-ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        .nb-dropdown { animation: nb-slide-down 0.18s cubic-bezier(0.16,1,0.3,1) both; }
        .nb-ping     { animation: nb-ping 1.2s cubic-bezier(0,0,0.2,1) infinite; }
      `}</style>

      <div className="relative" ref={dropdownRef}>

        {/* ── Bell button ──────────────────────────────────────── */}
        <button
          id="notification-bell-btn"
          onClick={handleToggle}
          aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`}
          className={`relative flex h-9 w-9 items-center justify-center rounded-full border transition-all focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-1 ${
            open
              ? "border-teal-400 bg-teal-50 text-teal-700 shadow-md"
              : "border-slate-200 bg-white text-slate-500 shadow-sm hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
          }`}
        >
          {/* Bell SVG */}
          <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>

          {/* Unread badge */}
          {unreadCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white shadow">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}

          {/* Pulse ring when there are unread notifications */}
          {unreadCount > 0 && (
            <span className="nb-ping absolute -right-1.5 -top-1.5 inline-flex h-[18px] w-[18px] rounded-full bg-red-400 opacity-75" />
          )}
        </button>

        {/* ── Dropdown panel ───────────────────────────────────── */}
        {open && (
          <div
            id="notification-dropdown"
            className="nb-dropdown absolute right-0 top-11 z-50 flex w-[360px] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    id="mark-all-read-btn"
                    onClick={markAllRead}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-teal-600 transition hover:bg-teal-50 hover:text-teal-800"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="max-h-[460px] overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-teal-500" />
                  <p className="text-xs text-slate-400">Loading notifications…</p>
                </div>
              ) : notifications.length === 0 ? (
                <EmptyState />
              ) : (
                <>
                  {/* Unread section */}
                  {unread.length > 0 && (
                    <section>
                      <p className="bg-slate-50 px-5 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                        New
                      </p>
                      <ul className="divide-y divide-slate-50">
                        {unread.map((n) => (
                          <NotificationItem key={n.id} n={n} onClick={handleClickItem} />
                        ))}
                      </ul>
                    </section>
                  )}

                  {/* Read section */}
                  {read.length > 0 && (
                    <section>
                      <p className="bg-slate-50 px-5 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                        Earlier
                      </p>
                      <ul className="divide-y divide-slate-50">
                        {read.map((n) => (
                          <NotificationItem key={n.id} n={n} onClick={handleClickItem} />
                        ))}
                      </ul>
                    </section>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {!loading && (
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-2.5">
                <p className="text-[10px] text-slate-400">
                  {notifications.length === 0
                    ? "No notifications"
                    : `${notifications.length} total · ${unreadCount} unread`}
                </p>
                <button
                  onClick={fetchNotifications}
                  className="flex items-center gap-1 rounded text-[11px] font-medium text-slate-400 transition hover:text-slate-700"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function NotificationItem({ n, onClick }) {
  const meta = TYPE_META[n.type] || { icon: "🔔", color: "bg-slate-100 text-slate-500", label: n.type };
  const actorName = n.actor?.name || n.actor?.email || "Someone";
  const initial = actorName[0]?.toUpperCase() || "?";

  return (
    <li
      onClick={() => onClick(n)}
      className={`group flex cursor-pointer items-start gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50 ${
        !n.isRead ? "bg-teal-50/30" : ""
      }`}
    >
      {/* Actor avatar */}
      <div className="relative mt-0.5 flex-shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-[11px] font-bold text-white shadow-sm">
          {initial}
        </div>
        {/* Type badge on avatar */}
        <span className={`absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] ${meta.color}`}>
          {meta.icon}
        </span>
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className="text-xs leading-relaxed text-slate-600">
          <span className="font-semibold text-slate-900">{actorName}</span>{" "}
          <span>{n.message}</span>
        </p>
        <div className="mt-1 flex items-center gap-2">
          <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${meta.color}`}>
            {meta.label}
          </span>
          <span className="text-[10px] text-slate-400">{relativeTime(n.createdAt)}</span>
        </div>
      </div>

      {/* Unread indicator */}
      {!n.isRead ? (
        <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-teal-500 shadow-sm" title="Unread" />
      ) : (
        <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-transparent" />
      )}
    </li>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
        🔔
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-700">You're all caught up!</p>
        <p className="mt-1 text-xs text-slate-400 leading-relaxed">
          Notifications appear here when someone<br />
          comments, reacts, or mentions you.
        </p>
      </div>
    </div>
  );
}
