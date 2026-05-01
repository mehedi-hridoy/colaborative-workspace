"use client";

import { useEffect } from "react";
import { useAuthStore } from "../../store/authStore";

export default function AuthProvider({ children }) {
  const fetchUser = useAuthStore((state) => state.fetchUser);

  useEffect(() => {
    fetchUser();
  }, []);

  return <>{children}</>;
}
