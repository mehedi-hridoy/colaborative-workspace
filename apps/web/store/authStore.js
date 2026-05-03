import { create } from "zustand";
import { API_BASE_URL } from "../app/lib/constants";

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user, loading: false }),

  fetchUser: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error();

      const data = await res.json();

      set({ user: data.user, loading: false });
    } catch {
      localStorage.removeItem("workspace");
      set({ user: null, loading: false });
    }
  },

  refreshToken: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Token refresh failed");
      }

      return true;
    } catch (err) {
      console.error("Token refresh error:", err);
      set({ user: null });
      return false;
    }
  },

  logout: async () => {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    localStorage.removeItem("workspace");
    set({ user: null });
  },
}));
