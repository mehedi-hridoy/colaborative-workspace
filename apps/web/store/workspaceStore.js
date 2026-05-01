import { create } from "zustand";

export const useWorkspaceStore = create((set) => ({
  workspaces: [],
  currentWorkspace: null,

  setWorkspaces: (data) => set({ workspaces: data }),

  addWorkspace: (ws) =>
    set((state) => ({
      workspaces: [...state.workspaces, ws],
    })),

  setCurrentWorkspace: (ws) => {
    localStorage.setItem("workspace", JSON.stringify(ws));
    set({ currentWorkspace: ws });
  },

  loadWorkspace: () => {
    const stored = localStorage.getItem("workspace");
    if (stored) {
      set({ currentWorkspace: JSON.parse(stored) });
    }
  },
}));