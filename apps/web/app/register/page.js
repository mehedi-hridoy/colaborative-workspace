"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icons } from "../../lib/icons";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch( `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/register` , {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.msg || data.message || "Registration failed");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#dcfce7_0%,_#ecfeff_28%,_#f8fafc_65%)] flex items-center justify-center px-6 py-14">
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
            Get started today
          </h1>
          <p className="text-base text-slate-600">
            Create your workspace account and start leading execution.
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg px-4 py-3 text-sm text-[#10b981] mb-6 flex items-center gap-2">
            <Icons.Check size={18} />
            Account created successfully! Redirecting to login...
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-6 mb-8">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{color: '#000000'}}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full bg-white border border-[#d3dbe7] rounded-xl px-4 py-3 text-base text-black placeholder:text-gray-400 caret-black focus:outline-none focus:ring-2 focus:ring-[#0f172a]/10 focus:border-[#0f172a] transition-all"
              required
            />
          </div>

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
            <label className="block text-sm font-medium mb-2" style={{color: '#000000'}}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white border border-[#d3dbe7] rounded-xl px-4 py-3 text-base text-black placeholder:text-gray-400 caret-black focus:outline-none focus:ring-2 focus:ring-[#0f172a]/10 focus:border-[#0f172a] transition-all"
              required
            />
            <p className="text-xs text-gray-600 mt-2">At least 6 characters</p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{color: '#000000'}}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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

          {/* Terms */}
          <p className="text-xs text-gray-600 leading-relaxed">
            By creating an account, you agree to our{" "}
            <a href="#" className="text-black hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-black hover:underline">
              Privacy Policy
            </a>
            .
          </p>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-[#0f172a] text-white rounded-xl py-3 font-semibold hover:bg-[#020617] disabled:opacity-50 transition-colors shadow-[0_10px_24px_rgba(15,23,42,0.2)]"
          >
            {loading ? "Creating account..." : success ? "Success!" : "Create Account"}
          </button>
        </form>

        {/* Sign In Link */}
        <p className="text-center text-base text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-black font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
