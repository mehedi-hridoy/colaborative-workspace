import { create } from "zustand";
import { getSocket } from "../lib/socket";
import { API_BASE_URL } from "../app/lib/constants";

export const usePresenceStore = create((set) => ({
  onlineMembers: [],
  members: [],

  // Fetch all workspace members
  fetchMembers: async (workspaceId) => {
    if (!workspaceId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/members`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        set({ members: data });
      }
    } catch (err) {
      console.error("Fetch members error:", err);
    }
  },

  // Join workspace and listen for presence updates
  joinWorkspace: (workspaceId) => {
    const socket = getSocket();
    socket.emit("join_workspace", workspaceId);

    // Listen for presence updates
    socket.on("presence:update", (onlineUserIds) => {
      set({ onlineMembers: onlineUserIds });
    });
  },

  // Leave workspace
  leaveWorkspace: (workspaceId) => {
    const socket = getSocket();
    socket.emit("leave_workspace", workspaceId);
    socket.off("presence:update");
    set({ onlineMembers: [] });
  },

  // Get member details by ID
  getMember: (userId) => {
    const state = create((set) => {
      const usePresenceStore = arguments[0];
      return usePresenceStore.members.find((m) => m.id === userId);
    });
  },

  // Check if a member is online
  isOnline: (userId) => {
    const state = create((set) => {
      const usePresenceStore = arguments[0];
      return usePresenceStore.onlineMembers.includes(userId);
    });
  },
}));
