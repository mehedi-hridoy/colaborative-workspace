"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icons } from "../../lib/icons";
import { useAuthStore } from "../../store/authStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { fetchUser } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch( `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/login` , {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.msg || data.message || "Login failed");
        setLoading(false);
        return;
      }

      await fetchUser();
      router.push("/dashboard");
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f5f5] to-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo & Heading */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <Icons.Dashboard size={24} className="text-white" />
            </div>
            <span className="text-xl font-semibold">TeamFlow</span>
          </div>

          <h1 className="text-4xl font-normal tracking-tighter mb-3">
            Welcome back
          </h1>
          <p className="text-base text-[#93939f]">
            Sign in to continue collaborating with your team.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6 mb-8">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-white border border-[#e5e7eb] rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-black/10 transition-all"
              required
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Password</label>
              <a href="#" className="text-sm text-[#1863dc] hover:underline">
                Forgot?
              </a>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white border border-[#e5e7eb] rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-black/10 transition-all"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-[#fef2f2] border border-[#fecaca] rounded-lg px-4 py-3 text-sm text-[#b30000]">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white rounded-lg py-3 font-medium hover:bg-[#17171c] disabled:opacity-50 transition-colors"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-[#e5e7eb]" />
          <span className="text-sm text-[#93939f]">or</span>
          <div className="flex-1 h-px bg-[#e5e7eb]" />
        </div>

        {/* Demo Accounts */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <button
            type="button"
            onClick={() => {
              setEmail("admin@example.com");
              setPassword("admin123");
            }}
            className="bg-[#f5f5f5] hover:bg-[#eeece7] border border-[#e5e7eb] rounded-lg px-4 py-3 text-sm font-medium transition-colors"
          >
            Demo Admin
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("user@example.com");
              setPassword("user123");
            }}
            className="bg-[#f5f5f5] hover:bg-[#eeece7] border border-[#e5e7eb] rounded-lg px-4 py-3 text-sm font-medium transition-colors"
          >
            Demo User
          </button>
        </div>

        {/* Sign Up Link */}
        <p className="text-center text-base text-[#93939f]">
          Don't have an account?{" "}
          <Link href="/register" className="text-black font-medium hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
