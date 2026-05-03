"use client";

import { create } from "zustand";
import { getSocket } from "../lib/socket";

const API = "http://localhost:5000/api/announcements";

export const useAnnouncementStore = create((set, get) => ({
  announcements: [],
  loading: false,

  // ─── Fetch ─────────────────────────────────────────────────────────────────
  fetchAnnouncements: async (workspaceId) => {
    set({ loading: true });
    try {
      const res = await fetch(`${API}/${workspaceId}`, { credentials: "include" });
      const data = await res.json();
      set({ announcements: data, loading: false });
    } catch (e) {
      console.error(e);
      set({ loading: false });
    }
  },

  // ─── Create (OPTIMISTIC) ───────────────────────────────────────────────────
  createAnnouncement: async (workspaceId, content, currentUser) => {
    // Optimistic: add immediately with a temp ID
    const tempId = `temp_${Date.now()}`;
    const optimistic = {
      id: tempId,
      content,
      workspaceId,
      createdAt: new Date().toISOString(),
      isPinned: false,
      user: currentUser || { name: "You", email: "" },
      reactions: [],
      comments: [],
      attachments: [],
      _optimistic: true,
    };

    set((s) => ({ announcements: [optimistic, ...s.announcements] }));

    try {
      const res = await fetch(API, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, content }),
      });

      if (!res.ok) throw new Error("Failed to create announcement");
      const real = await res.json();

      // Replace temp with real
      set((s) => ({
        announcements: s.announcements.map((a) =>
          a.id === tempId ? { ...real, _optimistic: false } : a
        ),
      }));

      return real;
    } catch (err) {
      // Rollback: remove the optimistic entry
      set((s) => ({
        announcements: s.announcements.filter((a) => a.id !== tempId),
      }));
      console.error("createAnnouncement failed:", err);
      return null;
    }
  },

  // ─── React (OPTIMISTIC) ────────────────────────────────────────────────────
  addReaction: async (id, emoji, currentUser) => {
    const prev = get().announcements;

    // Optimistic: toggle reaction locally
    set((s) => ({
      announcements: s.announcements.map((a) => {
        if (a.id !== id) return a;
        const existing = (a.reactions || []).find(
          (r) => r.emoji === emoji && r.userId === currentUser?.id
        );
        if (existing) {
          return { ...a, reactions: a.reactions.filter((r) => r.id !== existing.id) };
        }
        return {
          ...a,
          reactions: [
            ...(a.reactions || []),
            { id: `temp_${Date.now()}`, emoji, userId: currentUser?.id, user: currentUser },
          ],
        };
      }),
    }));

    try {
      const res = await fetch(`${API}/${id}/react`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });
      if (!res.ok) throw new Error("Reaction failed");
      // Server will emit socket event which updates all clients
    } catch {
      // Rollback
      set({ announcements: prev });
    }
  },

  // ─── Comment (OPTIMISTIC) ──────────────────────────────────────────────────
  addComment: async (id, message, currentUser) => {
    const tempComment = {
      id: `temp_${Date.now()}`,
      message,
      createdAt: new Date().toISOString(),
      user: currentUser || { name: "You", email: "" },
      _optimistic: true,
    };

    // Optimistic: add comment immediately
    set((s) => ({
      announcements: s.announcements.map((a) =>
        a.id === id ? { ...a, comments: [...(a.comments || []), tempComment] } : a
      ),
    }));

    try {
      const res = await fetch(`${API}/${id}/comment`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error("Comment failed");
      // Socket event will update with real data
    } catch {
      // Rollback: remove optimistic comment
      set((s) => ({
        announcements: s.announcements.map((a) =>
          a.id === id
            ? { ...a, comments: (a.comments || []).filter((c) => c.id !== tempComment.id) }
            : a
        ),
      }));
    }
  },

  // ─── Pin (OPTIMISTIC) ──────────────────────────────────────────────────────
  togglePin: async (id) => {
    const prev = get().announcements;

    // Optimistic: toggle pin state
    set((s) => ({
      announcements: s.announcements
        .map((a) => (a.id === id ? { ...a, isPinned: !a.isPinned } : a))
        .sort((a, b) => b.isPinned - a.isPinned),
    }));

    try {
      const res = await fetch(`${API}/${id}/pin`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Pin toggle failed");
      return true;
    } catch (e) {
      // Rollback
      set({ announcements: prev });
      console.error("togglePin error:", e);
      return false;
    }
  },

  // ─── Socket wiring ─────────────────────────────────────────────────────────
  initSocket: (workspaceId) => {
    const socket = getSocket();
    socket.emit("join_workspace", workspaceId);

    socket.on("announcement:new", (item) => {
      set((s) => {
        if (s.announcements.some((a) => a.id === item.id)) return s;
        // Also remove any optimistic version of this
        const filtered = s.announcements.filter((a) => a._optimistic !== true || a.content !== item.content);
        return { announcements: [item, ...filtered] };
      });
    });

    socket.on("announcement:reaction", (payload) => {
      set((s) => ({
        announcements: s.announcements.map((a) =>
          a.id === payload.announcementId ? { ...a, reactions: payload.reactions } : a
        ),
      }));
    });

    socket.on("announcement:comment", (payload) => {
      set((s) => ({
        announcements: s.announcements.map((a) => {
          if (a.id !== payload.announcementId) return a;
          // Replace any optimistic comment or append
          const filtered = (a.comments || []).filter((c) => !c._optimistic);
          return { ...a, comments: [...filtered, payload.comment] };
        }),
      }));
    });

    socket.on("announcement:pin", (payload) => {
      set((s) => ({
        announcements: s.announcements
          .map((a) => (a.id === payload.id ? { ...a, isPinned: payload.isPinned } : a))
          .sort((a, b) => b.isPinned - a.isPinned),
      }));
    });
  },

  cleanupSocket: () => {
    const socket = getSocket();
    socket.off("announcement:new");
    socket.off("announcement:reaction");
    socket.off("announcement:comment");
    socket.off("announcement:pin");
  },
}));
