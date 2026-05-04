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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#dbeafe_0%,_#eff6ff_25%,_#f8fafc_65%)] flex items-center justify-center px-6 py-14">
      <div className="w-full max-w-md bg-white/95 backdrop-blur rounded-2xl border border-[#d9e1ec] shadow-[0_20px_60px_rgba(15,23,42,0.15)] p-8 md:p-10">
        {/* Logo & Heading */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[#0f172a] rounded-lg flex items-center justify-center shadow-lg shadow-slate-900/20">
              <Icons.Dashboard size={24} className="text-white" />
            </div>
            <span className="text-xl font-semibold text-[#0f172a]">TeamFlow</span>
          </div>

          <h1 className="text-4xl font-black tracking-tight mb-3" style={{color: '#000000'}}>
            Welcome back
          </h1>
          <p className="text-base text-slate-600">
            Sign in to run your workspace with total clarity.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6 mb-8">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{color: '#000000'}}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-white border border-[#d3dbe7] rounded-xl px-4 py-3 text-base text-black placeholder:text-gray-400 caret-black focus:outline-none focus:ring-2 focus:ring-[#0f172a]/10 focus:border-[#0f172a] transition-all"
              required
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium" style={{color: '#000000'}}>Password</label>
              <a href="#" className="text-sm text-[#1863dc] hover:underline">
                Forgot?
              </a>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white border border-[#d3dbe7] rounded-xl px-4 py-3 text-base text-black placeholder:text-gray-400 caret-black focus:outline-none focus:ring-2 focus:ring-[#0f172a]/10 focus:border-[#0f172a] transition-all"
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
            className="w-full bg-[#0f172a] text-white rounded-xl py-3 font-semibold hover:bg-[#020617] disabled:opacity-50 transition-colors shadow-[0_10px_24px_rgba(15,23,42,0.2)]"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-[#e5e7eb]" />
          <span className="text-sm text-gray-600">or</span>
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
            className="bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#dbe3ee] rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition-colors"
          >
            Demo Admin
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("user@example.com");
              setPassword("user123");
            }}
            className="bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#dbe3ee] rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition-colors"
          >
            Demo User
          </button>
        </div>

        {/* Sign Up Link */}
        <p className="text-center text-base text-gray-600">
          Don't have an account?{" "}
          <Link href="/register" className="text-black font-medium hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
