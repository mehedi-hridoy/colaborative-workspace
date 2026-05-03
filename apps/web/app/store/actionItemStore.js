"use client";

import { create } from "zustand";
import { getSocket } from "../lib/socket";

const API = "http://localhost:5000/api/action-items";

export const useActionItemStore = create((set, get) => ({
  // items keyed by goalId: { [goalId]: ActionItem[] }
  itemsByGoal: {},
  // loading state per goalId
  loading: {},

  // ─── Fetch all items for a goal ──────────────────────────────────────────
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

  // ─── Create ──────────────────────────────────────────────────────────────
  createItem: async (data) => {
    try {
      const res = await fetch(API, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch { return null; }
  },

  // ─── Update status only ──────────────────────────────────────────────────
  updateStatus: async (id, status) => {
    try {
      const res = await fetch(`${API}/${id}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) return;
      get()._applyUpdate(await res.json());
    } catch {}
  },

  // ─── Full update ─────────────────────────────────────────────────────────
  updateItem: async (id, data) => {
    try {
      const res = await fetch(`${API}/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) return;
      get()._applyUpdate(await res.json());
    } catch {}
  },

  // ─── Delete ──────────────────────────────────────────────────────────────
  deleteItem: async (id, goalId) => {
    try {
      await fetch(`${API}/${id}`, { method: "DELETE", credentials: "include" });
      set((s) => ({
        itemsByGoal: {
          ...s.itemsByGoal,
          [goalId]: (s.itemsByGoal[goalId] || []).filter((i) => i.id !== id),
        },
      }));
    } catch {}
  },

  // ─── Internal: apply an updated item back into the keyed map ─────────────
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

  // ─── Socket listeners ────────────────────────────────────────────────────
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
        return { itemsByGoal: { ...s.itemsByGoal, [goalId]: [item, ...existing] } };
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
