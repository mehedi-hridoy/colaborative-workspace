"use client";

import { create } from "zustand";
import { getSocket } from "../lib/socket";

const API = "http://localhost:5000/api/announcements";

export const useAnnouncementStore = create((set, get) => ({
  announcements: [],
  loading: false,

  // 🔹 Fetch
  fetchAnnouncements: async (workspaceId) => {
    set({ loading: true });
    try {
      const res = await fetch(`${API}/${workspaceId}`, {
        credentials: "include",
      });
      const data = await res.json();
      set({ announcements: data, loading: false });
    } catch (e) {
      console.error(e);
      set({ loading: false });
    }
  },

  // 🔹 Create (socket event handles insertion for all clients)
  createAnnouncement: async (workspaceId, content) => {
    await fetch(API, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId, content }),
    });
  },

  // 🔹 React
  addReaction: async (id, emoji) => {
    await fetch(`${API}/${id}/react`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emoji }),
    });
  },

  // 🔹 Comment
  addComment: async (id, message) => {
    await fetch(`${API}/${id}/comment`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
  },

  // 🔹 Socket wiring (call once per workspace)
  initSocket: (workspaceId) => {
    const socket = getSocket();

    socket.emit("join_workspace", workspaceId);

    // NEW
    socket.on("announcement:new", (item) => {
      set((s) => {
        // Prevent duplicate if this client already optimistically added it
        if (s.announcements.some((a) => a.id === item.id)) return s;
        return { announcements: [item, ...s.announcements] };
      });
    });

    // REACTION
    socket.on("announcement:reaction", (payload) => {
      set((s) => ({
        announcements: s.announcements.map((a) =>
          a.id === payload.announcementId
            ? { ...a, reactions: payload.reactions }
            : a
        ),
      }));
    });

    // COMMENT
    socket.on("announcement:comment", (payload) => {
      set((s) => ({
        announcements: s.announcements.map((a) =>
          a.id === payload.announcementId
            ? { ...a, comments: [...(a.comments || []), payload.comment] }
            : a
        ),
      }));
    });

    // PIN
    socket.on("announcement:pin", (payload) => {
      set((s) => ({
        announcements: s.announcements
          .map((a) =>
            a.id === payload.id ? { ...a, isPinned: payload.isPinned } : a
          )
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

  // 🔹 Pin
  togglePin: async (id) => {
    try {
      await fetch(`${API}/${id}/pin`, {
        method: "PATCH",
        credentials: "include",
      });
      return true;
    } catch (e) {
      console.error("togglePin error:", e);
      return false;
    }
  },
}));
