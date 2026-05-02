import { create } from "zustand";
import { getSocket } from "../app/lib/socket";

const API_URL = "http://localhost:5000/api";

export const useAnnouncementStore = create((set, get) => ({
  announcements: [],
  loading: false,

  fetchAnnouncements: async (workspaceId) => {
    if (!workspaceId) return;
    set({ loading: true });

    try {
      const res = await fetch(`${API_URL}/announcements/${workspaceId}`, {
        credentials: "include",
      });

      if (!res.ok) {
        set({ announcements: [], loading: false });
        return;
      }

      const data = await res.json();
      set({ announcements: data, loading: false });
    } catch {
      set({ announcements: [], loading: false });
    }
  },

  createAnnouncement: async (content, workspaceId) => {
    try {
      const res = await fetch(`${API_URL}/announcements`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, workspaceId }),
      });

      if (!res.ok) throw new Error("Failed to create announcement");

      // Socket event will push the new announcement to all clients
      return true;
    } catch (err) {
      console.error("createAnnouncement error:", err);
      return false;
    }
  },

  addReaction: async (announcementId, emoji) => {
    try {
      const res = await fetch(`${API_URL}/announcements/${announcementId}/react`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });

      if (!res.ok) throw new Error("Failed to react");
      // Socket event will update the announcement
      return true;
    } catch (err) {
      console.error("addReaction error:", err);
      return false;
    }
  },

  addComment: async (announcementId, message) => {
    try {
      const res = await fetch(`${API_URL}/announcements/${announcementId}/comment`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) throw new Error("Failed to comment");
      // Socket event will update the announcement
      return true;
    } catch (err) {
      console.error("addComment error:", err);
      return false;
    }
  },

  togglePin: async (announcementId) => {
    try {
      const res = await fetch(`${API_URL}/announcements/${announcementId}/pin`, {
        method: "PATCH",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to toggle pin");
      return true;
    } catch (err) {
      console.error("togglePin error:", err);
      return false;
    }
  },

  // --- Socket handlers: update a single announcement in the list ---
  _upsertAnnouncement: (announcement) => {
    set((state) => {
      const exists = state.announcements.some((a) => a.id === announcement.id);
      let updated;

      if (exists) {
        updated = state.announcements.map((a) =>
          a.id === announcement.id ? announcement : a
        );
      } else {
        updated = [announcement, ...state.announcements];
      }

      // Re-sort: pinned first, then newest
      updated.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      return { announcements: updated };
    });
  },

  // --- Initialize socket listeners (call once per workspace) ---
  initSocketListeners: () => {
    const socket = getSocket();
    const upsert = get()._upsertAnnouncement;

    socket.on("announcement:new", upsert);
    socket.on("announcement:reaction", upsert);
    socket.on("announcement:comment", upsert);
    socket.on("announcement:pin", upsert);
  },

  cleanupSocketListeners: () => {
    const socket = getSocket();

    socket.off("announcement:new");
    socket.off("announcement:reaction");
    socket.off("announcement:comment");
    socket.off("announcement:pin");
  },
}));
