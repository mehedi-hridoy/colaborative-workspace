"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";
import { API_BASE_URL } from "../lib/constants";
import { useAuthStore } from "../../store/authStore";
import "../auth.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { fetchUser } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
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
    <div className="auth-page">
      {/* ── LEFT PANEL — branding ── */}
      <div className="auth-panel-left">
        <div className="auth-grid-dots" />
        <div className="auth-glow" style={{ top: "-5%", left: "-15%", opacity: 0.9 }} />
        <div className="auth-glow" style={{ bottom: "0%", right: "-20%", opacity: 0.5 }} />

        {/* Logo */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: "#e8e8e8",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Zap size={15} color="#080808" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#e8e8e8", letterSpacing: "-0.01em" }}>TeamFlow</span>
        </div>

        {/* Central copy */}
        <div style={{ position: "relative" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: "#333", textTransform: "uppercase", marginBottom: 16 }}>
            Collaborative workspace
          </p>
          <h2 style={{
            fontSize: 40,
            fontWeight: 700,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            color: "#e8e8e8",
            marginBottom: 20,
          }}>
            Work together.<br />
            <span style={{ color: "#333" }}>Stay aligned.</span>
          </h2>
          <p style={{ fontSize: 14, color: "#444", lineHeight: 1.75, maxWidth: 320 }}>
            Goals, tasks, and team communication — in a single calm workspace. Without the noise.
          </p>
        </div>

        {/* Social proof block */}
        <div style={{ position: "relative" }}>
          <div style={{
            background: "#0c0c0c",
            border: "1px solid #1a1a1a",
            borderRadius: 12,
            padding: "20px 22px",
          }}>
            {/* Avatars */}
            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
              {[
                { initials: "AK", color: "#10b981" },
                { initials: "MS", color: "#6366f1" },
                { initials: "JL", color: "#f59e0b" },
              ].map((m, i) => (
                <div key={i} style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: m.color + "20",
                  border: `1px solid ${m.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, fontWeight: 700, color: m.color, letterSpacing: "0.02em",
                }}>{m.initials}</div>
              ))}
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "#141414", border: "1px solid #1f1f1f",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, color: "#333", fontWeight: 600,
              }}>+4</div>
            </div>
            <p style={{ fontSize: 13, color: "#555", lineHeight: 1.65 }}>
              Teams collaborate in real-time with &lt;50ms latency across goals, tasks, and updates.
            </p>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 0, marginTop: 1, borderRadius: 12, overflow: "hidden", border: "1px solid #141414" }}>
            {[
              { value: "< 50ms", label: "Latency" },
              { value: "3-tier", label: "RBAC" },
              { value: "100%", label: "Open" },
            ].map((s, i) => (
              <div key={i} style={{
                flex: 1, background: "#0c0c0c",
                borderLeft: i > 0 ? "1px solid #141414" : "none",
                padding: "14px 16px", textAlign: "center",
              }}>
                <p style={{ fontSize: 18, fontWeight: 700, color: "#e8e8e8", letterSpacing: "-0.03em", lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: 10, color: "#333", marginTop: 4, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — form ── */}
      <div className="auth-panel-right">
        {/* Top-right nav */}
        <div style={{ position: "absolute", top: 28, right: 32 }}>
          <Link href="/register" className="auth-nav-link">
            No account? <span style={{ color: "#e8e8e8", fontWeight: 600 }}>Sign up →</span>
          </Link>
        </div>

        <div style={{ width: "100%", maxWidth: 360 }}>
          {/* Heading */}
          <div style={{ marginBottom: 36 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: "#333", textTransform: "uppercase", marginBottom: 12 }}>
              Welcome back
            </p>
            <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.04em", color: "#e8e8e8", lineHeight: 1.05 }}>
              Sign in to TeamFlow
            </h1>
            <p style={{ marginTop: 10, fontSize: 13, color: "#444", lineHeight: 1.6 }}>
              Continue collaborating with your team.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Email */}
            <div>
              <label className="auth-label" htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="auth-input"
                required
              />
            </div>

            {/* Password */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                <label className="auth-label" htmlFor="login-password" style={{ margin: 0 }}>Password</label>
                <a href="#" className="auth-forgot-link">
                  Forgot?
                </a>
              </div>
              <div className="auth-input-wrap">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="auth-input"
                  style={{ paddingRight: 40 }}
                  required
                />
                <button type="button" className="auth-input-icon-btn" onClick={() => setShowPassword(v => !v)}>
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="auth-error">
                <AlertCircle size={13} color="#8b2020" />
                <span style={{ fontSize: 12, color: "#8b2020" }}>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading} className="auth-btn-primary" style={{ marginTop: 4 }}>
              {loading ? "Signing in…" : <><span>Sign In</span><ArrowRight size={13} /></>}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "24px 0" }}>
            <div className="auth-divider-line" />
            <span style={{ fontSize: 11, color: "#222", fontWeight: 500, whiteSpace: "nowrap", letterSpacing: "0.02em" }}>or try a demo</span>
            <div className="auth-divider-line" />
          </div>

          {/* Demo accounts */}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className="auth-btn-demo"
              onClick={() => { setEmail("admin@example.com"); setPassword("admin123"); }}
            >
              Admin account
            </button>
            <button
              type="button"
              className="auth-btn-demo"
              onClick={() => { setEmail("user@example.com"); setPassword("user123"); }}
            >
              User account
            </button>
          </div>

          {/* Footer note */}
          <p style={{ marginTop: 32, textAlign: "center", fontSize: 12, color: "#252525", letterSpacing: "0.01em" }}>
            Don't have an account?{" "}
            <Link href="/register" className="auth-link" style={{ fontSize: 12 }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
