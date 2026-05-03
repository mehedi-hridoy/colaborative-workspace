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
      const res = await fetch("http://localhost:5000/api/auth/register", {
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
            Get started today
          </h1>
          <p className="text-base text-[#93939f]">
            Create your account and start collaborating with your team.
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
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full bg-white border border-[#e5e7eb] rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-black/10 transition-all"
              required
            />
          </div>

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
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white border border-[#e5e7eb] rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-black/10 transition-all"
              required
            />
            <p className="text-xs text-[#93939f] mt-2">At least 6 characters</p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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

          {/* Terms */}
          <p className="text-xs text-[#93939f] leading-relaxed">
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
            className="w-full bg-black text-white rounded-lg py-3 font-medium hover:bg-[#17171c] disabled:opacity-50 transition-colors"
          >
            {loading ? "Creating account..." : success ? "Success!" : "Create Account"}
          </button>
        </form>

        {/* Sign In Link */}
        <p className="text-center text-base text-[#93939f]">
          Already have an account?{" "}
          <Link href="/login" className="text-black font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
