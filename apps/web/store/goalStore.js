import { create } from "zustand";

export const useGoalStore = create((set) => ({
  goals: [],

  setGoals: (data) => set({ goals: data }),

  addGoal: (goal) =>
    set((state) => ({
      goals: [goal, ...state.goals],
    })),

  updateGoal: (goalId, updatedGoal) =>
    set((state) => ({
      goals: state.goals.map((g) => (g.id === goalId ? updatedGoal : g)),
    })),
}));