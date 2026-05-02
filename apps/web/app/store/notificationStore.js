"use client";

import { create } from "zustand";
import { getSocket } from "../lib/socket";

const API = "http://localhost:5000/api/notifications";

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  // ─── Fetch all notifications for the current user ───────────────────────────
  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const res = await fetch(API, { credentials: "include" });
      if (!res.ok) {
        // Silently fail — backend may not be ready yet or user may not be authed
        console.warn("fetchNotifications: server returned", res.status);
        set({ loading: false });
        return;
      }
      const data = await res.json();
      set({
        notifications: data,
        unreadCount: data.filter((n) => !n.isRead).length,
        loading: false,
      });
    } catch (e) {
      // Network error (server down, CORS) — degrade gracefully, never throw
      console.warn("fetchNotifications: could not reach server", e?.message);
      set({ loading: false });
    }
  },

  // ─── Mark a single notification as read ─────────────────────────────────────
  markAsRead: async (id) => {
    try {
      const res = await fetch(`${API}/${id}/read`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) return;

      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (e) {
      console.error("markAsRead:", e);
    }
  },

  // ─── Mark all notifications as read ─────────────────────────────────────────
  markAllRead: async () => {
    try {
      const res = await fetch(`${API}/read-all`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) return;

      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (e) {
      console.error("markAllRead:", e);
    }
  },

  // ─── Socket listener — call once after login ─────────────────────────────────
  listenSocket: () => {
    const socket = getSocket();

    // Prevent duplicate listeners on hot-reload / re-mount
    socket.off("notification:new");

    socket.on("notification:new", (notification) => {
      set((state) => {
        // Guard against duplicates
        if (state.notifications.some((n) => n.id === notification.id)) {
          return state;
        }
        return {
          notifications: [notification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        };
      });
    });
  },

  // ─── Cleanup socket listener on logout ───────────────────────────────────────
  cleanupSocket: () => {
    const socket = getSocket();
    socket.off("notification:new");
  },

  // ─── Reset on logout ─────────────────────────────────────────────────────────
  reset: () => set({ notifications: [], unreadCount: 0, loading: false }),
}));
