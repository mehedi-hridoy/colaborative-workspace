"use client";

import { create } from "zustand";
import { getSocket } from "../lib/socket";

const API =  `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/action-items` ;

export const useActionItemStore = create((set, get) => ({
  itemsByGoal: {},
  loading: {},

  // ─── Fetch all items for a goal ────────────────────────────────────────────
  fetchByGoal: async (goalId) => {
    set((s) => ({ loading: { ...s.loading, [goalId]: true } }));
    try {
      const res = await fetch(`${API}/goal/${goalId}`, { credentials: "include" });
      if (!res.ok) { set((s) => ({ loading: { ...s.loading, [goalId]: false } })); return; }
      const data = await res.json();
      set((s) => ({
        itemsByGoal: { ...s.itemsByGoal, [goalId]: data },
        loading: { ...s.loading, [goalId]: false },
      }));
    } catch {
      set((s) => ({ loading: { ...s.loading, [goalId]: false } }));
    }
  },

  // ─── Create (OPTIMISTIC) ───────────────────────────────────────────────────
  createItem: async (data) => {
    const tempId = `temp_${Date.now()}`;
    const goalId = data.goalId;
    const optimistic = {
      id: tempId,
      ...data,
      status: data.status || "todo",
      priority: data.priority || "medium",
      createdAt: new Date().toISOString(),
      _optimistic: true,
    };

    // Add immediately
    set((s) => ({
      itemsByGoal: {
        ...s.itemsByGoal,
        [goalId]: [optimistic, ...(s.itemsByGoal[goalId] || [])],
      },
    }));

    try {
      const res = await fetch(API, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Create failed");
      const real = await res.json();

      // Replace temp with real
      set((s) => ({
        itemsByGoal: {
          ...s.itemsByGoal,
          [goalId]: (s.itemsByGoal[goalId] || []).map((i) =>
            i.id === tempId ? real : i
          ),
        },
      }));
      return real;
    } catch {
      // Rollback
      set((s) => ({
        itemsByGoal: {
          ...s.itemsByGoal,
          [goalId]: (s.itemsByGoal[goalId] || []).filter((i) => i.id !== tempId),
        },
      }));
      return null;
    }
  },

  // ─── Update status (OPTIMISTIC) ────────────────────────────────────────────
  updateStatus: async (id, status) => {
    const prev = { ...get().itemsByGoal };

    // Optimistic: update status immediately across all goals
    set((s) => {
      const next = { ...s.itemsByGoal };
      for (const gid of Object.keys(next)) {
        next[gid] = next[gid].map((i) => (i.id === id ? { ...i, status } : i));
      }
      return { itemsByGoal: next };
    });

    try {
      const res = await fetch(`${API}/${id}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Status update failed");
      get()._applyUpdate(await res.json());
    } catch {
      set({ itemsByGoal: prev }); // Rollback
    }
  },

  // ─── Full update ───────────────────────────────────────────────────────────
  updateItem: async (id, data) => {
    const prev = { ...get().itemsByGoal };

    try {
      const res = await fetch(`${API}/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Update failed");
      get()._applyUpdate(await res.json());
    } catch {
      set({ itemsByGoal: prev });
    }
  },

  // ─── Delete (OPTIMISTIC) ───────────────────────────────────────────────────
  deleteItem: async (id, goalId) => {
    const prev = { ...get().itemsByGoal };

    // Optimistic: remove immediately
    set((s) => ({
      itemsByGoal: {
        ...s.itemsByGoal,
        [goalId]: (s.itemsByGoal[goalId] || []).filter((i) => i.id !== id),
      },
    }));

    try {
      const res = await fetch(`${API}/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Delete failed");
    } catch {
      set({ itemsByGoal: prev }); // Rollback
    }
  },

  // ─── Internal helper ───────────────────────────────────────────────────────
  _applyUpdate: (item) => {
    const goalId = item.goalId || item.goal?.id;
    if (!goalId) return;
    set((s) => ({
      itemsByGoal: {
        ...s.itemsByGoal,
        [goalId]: (s.itemsByGoal[goalId] || []).map((i) =>
          i.id === item.id ? item : i
        ),
      },
    }));
  },

  // ─── Socket listeners ──────────────────────────────────────────────────────
  listenSocket: () => {
    const socket = getSocket();
    socket.off("task:new");
    socket.off("task:update");
    socket.off("task:delete");

    socket.on("task:new", (item) => {
      const goalId = item.goalId || item.goal?.id;
      if (!goalId) return;
      set((s) => {
        const existing = s.itemsByGoal[goalId] || [];
        if (existing.some((i) => i.id === item.id)) return s;
        // Remove optimistic version
        const filtered = existing.filter((i) => !i._optimistic || i.title !== item.title);
        return { itemsByGoal: { ...s.itemsByGoal, [goalId]: [item, ...filtered] } };
      });
    });

    socket.on("task:update", (item) => get()._applyUpdate(item));

    socket.on("task:delete", ({ id, goalId }) => {
      set((s) => ({
        itemsByGoal: {
          ...s.itemsByGoal,
          [goalId]: (s.itemsByGoal[goalId] || []).filter((i) => i.id !== id),
        },
      }));
    });
  },

  cleanupSocket: () => {
    const socket = getSocket();
    socket.off("task:new");
    socket.off("task:update");
    socket.off("task:delete");
  },

  reset: () => set({ itemsByGoal: {}, loading: {} }),
}));
