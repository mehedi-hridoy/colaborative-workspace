import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user, loading: false }),

  fetchUser: async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/me", {
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
      const res = await fetch("http://localhost:5000/api/auth/refresh", {
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
    await fetch("http://localhost:5000/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    localStorage.removeItem("workspace");
    set({ user: null });
  },
}));
