import { create } from "zustand";
import { API_BASE_URL } from "../app/lib/constants";

export const useGoalStore = create((set, get) => ({
  goals: [],

  setGoals: (data) => set({ goals: data }),

  // ─── Create (OPTIMISTIC) ───────────────────────────────────────────────────
  addGoal: (goal) =>
    set((state) => ({
      goals: [goal, ...state.goals],
    })),

  // ─── Optimistic create with rollback ───────────────────────────────────────
  createGoalOptimistic: async (goalData, currentUser) => {
    const tempId = `temp_${Date.now()}`;
    const optimistic = {
      id: tempId,
      ...goalData,
      status: goalData.status || "in_progress",
      createdAt: new Date().toISOString(),
      owner: currentUser || { name: "You" },
      milestones: [],
      actionItems: [],
      _optimistic: true,
    };

    // Add immediately
    set((s) => ({ goals: [optimistic, ...s.goals] }));

    try {
      const res = await fetch(`${API_BASE_URL}/api/goals`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goalData),
      });

      if (!res.ok) throw new Error("Failed to create goal");
      const real = await res.json();

      // Replace temp with real
      set((s) => ({
        goals: s.goals.map((g) => (g.id === tempId ? real : g)),
      }));

      return real;
    } catch (err) {
      // Rollback
      set((s) => ({
        goals: s.goals.filter((g) => g.id !== tempId),
      }));
      console.error("createGoal failed:", err);
      return null;
    }
  },

  updateGoal: (goalId, updatedGoal) =>
    set((state) => ({
      goals: state.goals.map((g) => (g.id === goalId ? updatedGoal : g)),
    })),

  // ─── Delete (OPTIMISTIC) ───────────────────────────────────────────────────
  deleteGoalOptimistic: async (goalId) => {
    const prev = get().goals;

    // Remove immediately
    set((s) => ({ goals: s.goals.filter((g) => g.id !== goalId) }));

    try {
      const res = await fetch(`${API_BASE_URL}/api/goals/${goalId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed");
      return true;
    } catch {
      set({ goals: prev }); // Rollback
      return false;
    }
  },
}));