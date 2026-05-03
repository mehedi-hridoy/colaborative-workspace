import { create } from "zustand";

const API_URL =  `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api` ;

export const useAnalyticsStore = create((set) => ({
  analytics: null,
  goalChart: [],
  actionItemChart: [],
  memberStats: [],
  loading: false,
  error: null,

  fetchAnalytics: async (workspaceId) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/analytics/${workspaceId}`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch analytics");
      const data = await res.json();
      set({ analytics: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchGoalChart: async (workspaceId) => {
    try {
      const res = await fetch(`${API_URL}/analytics/${workspaceId}/goal-chart`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch goal chart");
      const data = await res.json();
      set({ goalChart: data });
    } catch (err) {
      console.error("Goal chart fetch error:", err);
    }
  },

  fetchActionItemChart: async (workspaceId) => {
    try {
      const res = await fetch(`${API_URL}/analytics/${workspaceId}/action-item-chart`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch action item chart");
      const data = await res.json();
      set({ actionItemChart: data });
    } catch (err) {
      console.error("Action item chart fetch error:", err);
    }
  },

  fetchMemberStats: async (workspaceId) => {
    try {
      const res = await fetch(`${API_URL}/analytics/${workspaceId}/members`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch member stats");
      const data = await res.json();
      set({ memberStats: data });
    } catch (err) {
      console.error("Member stats fetch error:", err);
    }
  },

  exportData: async (workspaceId) => {
    try {
      const res = await fetch(`${API_URL}/analytics/${workspaceId}/export`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to export data");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `workspace-${workspaceId}-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Export error:", err);
    }
  },
}));
