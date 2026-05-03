import { create } from "zustand";

export const useWorkspaceStore = create((set) => ({
  workspaces: [],
  currentWorkspace: null,

  setWorkspaces: (data) =>
    set((state) => {
      const currentWorkspace = state.currentWorkspace
        ? data.find((ws) => ws.id === state.currentWorkspace.id) || null
        : null;

      if (!currentWorkspace) {
        localStorage.removeItem("workspace");
      }

      return { workspaces: data, currentWorkspace };
    }),

  addWorkspace: (ws) =>
    set((state) => ({
      workspaces: [...state.workspaces, ws],
    })),

  setCurrentWorkspace: (ws) => {
    if (ws) {
      localStorage.setItem("workspace", JSON.stringify(ws));
    } else {
      localStorage.removeItem("workspace");
    }
    set({ currentWorkspace: ws });
  },

  loadWorkspace: () => {
    const stored = localStorage.getItem("workspace");
    if (stored) {
      try {
        set({ currentWorkspace: JSON.parse(stored) });
      } catch {
        localStorage.removeItem("workspace");
        set({ currentWorkspace: null });
      }
    }
  },

  clearWorkspace: () => {
    localStorage.removeItem("workspace");
    set({ currentWorkspace: null, workspaces: [] });
  },

  // --- Real-time presence ---
  onlineUsers: [],
  listenSocket: () => {
    import("../app/lib/socket").then(({ getSocket }) => {
      const socket = getSocket();
      socket.off("presence:update");
      socket.on("presence:update", (userIds) => {
        set({ onlineUsers: userIds });
      });
    });
  },
  cleanupSocket: () => {
    import("../app/lib/socket").then(({ getSocket }) => {
      const socket = getSocket();
      socket.off("presence:update");
      set({ onlineUsers: [] });
    });
  },
}));
