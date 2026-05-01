"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/authStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { fetchUser } = useAuthStore();

  const handleLogin = async () => {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Login failed:", data.msg);
      alert(data.msg || "Login failed");
      return;
    }

    console.log("Logged in successfully");
    await fetchUser();
    router.push("/dashboard");
  };

  return (
    <div>
      <h1>Login</h1>

      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}