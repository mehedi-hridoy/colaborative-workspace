"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/authStore";

export default function Dashboard() {
  const router = useRouter();
  const { user, loading, fetchUser, logout } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (loading) return <div>Loading...</div>;

  if (!user) return <div>Unauthorized. Redirecting...</div>;

  return (
    <div>
      <h1>Dashboard</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}