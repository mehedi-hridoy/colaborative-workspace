import { create } from "zustand";
import { getSocket } from "../app/lib/socket";

const API_URL = "http://localhost:5000/api";

export const useActivityStore = create((set, get) => ({
  // Per-goal activity map: { [goalId]: Activity[] }
  activitiesByGoal: {},
  // Per-goal loading state: { [goalId]: boolean }
  loadingByGoal: {},
  // Per-goal socket listener map
  listenersByGoal: {},

  fetchActivities: async (goalId) => {
    set((state) => ({
      loadingByGoal: { ...state.loadingByGoal, [goalId]: true },
    }));

    try {
      const res = await fetch(`${API_URL}/activity/goal/${goalId}`, {
        credentials: "include",
      });

      if (!res.ok) {
        set((state) => ({
          activitiesByGoal: { ...state.activitiesByGoal, [goalId]: [] },
          loadingByGoal: { ...state.loadingByGoal, [goalId]: false },
        }));
        return;
      }

      const data = await res.json();

      set((state) => ({
        activitiesByGoal: { ...state.activitiesByGoal, [goalId]: data },
        loadingByGoal: { ...state.loadingByGoal, [goalId]: false },
      }));
    } catch {
      set((state) => ({
        activitiesByGoal: { ...state.activitiesByGoal, [goalId]: [] },
        loadingByGoal: { ...state.loadingByGoal, [goalId]: false },
      }));
    }
  },

  postActivity: async (goalId, message) => {
    try {
      const res = await fetch(`${API_URL}/activity`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalId, message }),
      });

      if (!res.ok) throw new Error("Failed to post activity");

      // Re-fetch to get the full activity with user data included
      await get().fetchActivities(goalId);

      return true;
    } catch (err) {
      console.error("postActivity error:", err);
      return false;
    }
  },

  startGoalActivityListener: (goalId) => {
    if (!goalId) return;

    const existing = get().listenersByGoal[goalId];
    if (existing) return;

    const socket = getSocket();
    const handler = (activity) => {
      if (activity.goalId !== goalId) return;

      set((state) => ({
        activitiesByGoal: {
          ...state.activitiesByGoal,
          [goalId]: [activity, ...(state.activitiesByGoal[goalId] || [])],
        },
      }));
    };

    socket.on("activity:new", handler);

    set((state) => ({
      listenersByGoal: { ...state.listenersByGoal, [goalId]: handler },
    }));
  },

  stopGoalActivityListener: (goalId) => {
    const handler = get().listenersByGoal[goalId];
    if (!handler) return;

    const socket = getSocket();
    socket.off("activity:new", handler);

    set((state) => {
      const next = { ...state.listenersByGoal };
      delete next[goalId];
      return { listenersByGoal: next };
    });
  },

  // Helper selectors
  getActivities: (goalId) => get().activitiesByGoal[goalId] || [],
  isLoading: (goalId) => get().loadingByGoal[goalId] || false,
}));
