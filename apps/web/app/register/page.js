"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, ArrowRight, AlertCircle, CheckCircle, Check, Eye, EyeOff } from "lucide-react";
import { API_BASE_URL } from "../lib/constants";
import "../auth.css";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
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
            Get started today
          </p>
          <h2 style={{
            fontSize: 40,
            fontWeight: 700,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            color: "#e8e8e8",
            marginBottom: 20,
          }}>
            Ship faster.<br />
            <span style={{ color: "#333" }}>Together.</span>
          </h2>
          <p style={{ fontSize: 14, color: "#444", lineHeight: 1.75, maxWidth: 320 }}>
            Set up in minutes. No credit card required. Bring your whole team — it's free to start.
          </p>
        </div>

        {/* Feature checklist */}
        <div style={{ position: "relative" }}>
          <div style={{
            background: "#0c0c0c",
            border: "1px solid #1a1a1a",
            borderRadius: 12,
            padding: "20px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#333", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>
              What you get
            </p>
            {[
              "Real-time collaboration across all devices",
              "Role-based access — Admin, Member, Viewer",
              "Goal tracking, Kanban boards & activity logs",
              "Live team presence with <50ms latency",
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: 5,
                  background: "#111", border: "1px solid #1f1f1f",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Check size={10} color="#555" strokeWidth={2.5} />
                </div>
                <span style={{ fontSize: 13, color: "#444", lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — form ── */}
      <div className="auth-panel-right" style={{ overflowY: "auto" }}>
        {/* Top-right nav */}
        <div style={{ position: "absolute", top: 28, right: 32 }}>
          <Link href="/login" className="auth-nav-link">
            Already a member? <span style={{ color: "#e8e8e8", fontWeight: 600 }}>Sign in →</span>
          </Link>
        </div>

        <div style={{ width: "100%", maxWidth: 360 }}>
          {/* Heading */}
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: "#333", textTransform: "uppercase", marginBottom: 12 }}>
              Create account
            </p>
            <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.04em", color: "#e8e8e8", lineHeight: 1.05 }}>
              Join TeamFlow
            </h1>
            <p style={{ marginTop: 10, fontSize: 13, color: "#444", lineHeight: 1.6 }}>
              Start collaborating with your team today.
            </p>
          </div>

          {/* Success banner */}
          {success && (
            <div className="auth-success">
              <CheckCircle size={13} color="#10b981" />
              <span style={{ fontSize: 12, color: "#10b981" }}>Account created! Redirecting…</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Full Name */}
            <div>
              <label className="auth-label" htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="auth-input"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="auth-label" htmlFor="reg-email">Email address</label>
              <input
                id="reg-email"
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
              <label className="auth-label" htmlFor="reg-password">Password</label>
              <div className="auth-input-wrap">
                <input
                  id="reg-password"
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
              <p style={{ marginTop: 5, fontSize: 11, color: "#252525", letterSpacing: "0.01em" }}>Minimum 6 characters</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="auth-label" htmlFor="reg-confirm">Confirm Password</label>
              <div className="auth-input-wrap">
                <input
                  id="reg-confirm"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="auth-input"
                  style={{ paddingRight: 40 }}
                  required
                />
                <button type="button" className="auth-input-icon-btn" onClick={() => setShowConfirm(v => !v)}>
                  {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
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

            {/* Terms */}
            <p className="auth-terms">
              By creating an account you agree to our{" "}
              <a href="#" className="auth-terms-link">Terms of Service</a>
              {" "}and{" "}
              <a href="#" className="auth-terms-link">Privacy Policy</a>.
            </p>

            {/* Submit */}
            <button type="submit" disabled={loading || success} className="auth-btn-primary" style={{ marginTop: 2 }}>
              {loading ? "Creating account…" : success ? "Success!" : <><span>Create Account</span><ArrowRight size={13} /></>}
            </button>
          </form>

          {/* Footer note */}
          <p style={{ marginTop: 28, textAlign: "center", fontSize: 12, color: "#252525", letterSpacing: "0.01em" }}>
            Already have an account?{" "}
            <Link href="/login" className="auth-link" style={{ fontSize: 12 }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
