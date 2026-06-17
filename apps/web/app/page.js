"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle, Users, BarChart3, Zap, Shield, Activity } from "lucide-react";
import "./landing.css";

const FEATURES = [
  {
    icon: CheckCircle,
    title: "Goal Tracking",
    desc: "Set objectives, define milestones, and visualise team progress with live charts and granular breakdowns.",
  },
  {
    icon: Activity,
    title: "Action Items",
    desc: "Kanban boards with drag-and-drop workflow. Smart assignments and due-date tracking keep nothing slipping through.",
  },
  {
    icon: Users,
    title: "Team Presence",
    desc: "See who is online in real time. Manage Admin, Member, and Viewer roles with fine-grained permissions.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    desc: "Goal completion charts, productivity trends, and CSV exports available at any moment.",
  },
  {
    icon: Zap,
    title: "Real-time Sync",
    desc: "Socket.io-powered updates propagate instantly across every device the moment something changes.",
  },
  {
    icon: Shield,
    title: "Role-based Access",
    desc: "Three-tier RBAC ensures the right people have the right access — no over-sharing, no friction.",
  },
];

const STATS = [
  { value: "< 50ms", label: "Real-time latency" },
  { value: "3-tier", label: "Permission model" },
  { value: "100%", label: "Open workspace" },
];

export default function LandingPage() {
  return (
    <div className="lp-page">

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        borderBottom: "1px solid #141414",
        background: "rgba(8,8,8,0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: "#e8e8e8",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Zap size={15} color="#080808" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#e8e8e8", letterSpacing: "-0.01em" }}>TeamFlow</span>
          </div>

          {/* Links */}
          <div className="lp-hide-mobile" style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <a href="#features" className="lp-nav-link">Features</a>
            <a href="#why" className="lp-nav-link">Why TeamFlow</a>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/login" className="lp-nav-link lp-hide-mobile">Sign in</Link>
            <div className="lp-divider lp-hide-mobile" />
            <Link href="/register" className="lp-btn-primary" style={{ padding: "8px 18px", fontSize: 13 }}>
              Get started <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: "relative", overflow: "hidden", paddingTop: 160, paddingBottom: 120, paddingLeft: 24, paddingRight: 24, textAlign: "center" }}>
        <div className="lp-grid-dots" />
        <div className="lp-glow" style={{ top: -100, left: "50%", transform: "translateX(-50%)" }} />

        <div style={{ position: "relative", maxWidth: 760, margin: "0 auto" }}>
          {/* Pill badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#111", border: "1px solid #1f1f1f",
            borderRadius: 999, padding: "5px 14px 5px 10px",
            marginBottom: 36,
          }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "#555", textTransform: "uppercase" }}>Now available</span>
            <div style={{ width: 1, height: 12, background: "#222" }} />
            <span style={{ fontSize: 12, color: "#666", fontWeight: 500 }}>Real-time collaboration for your team</span>
          </div>

          <h1 className="lp-hero-h1" style={{
            fontSize: 72,
            fontWeight: 700,
            lineHeight: 1.0,
            letterSpacing: "-0.04em",
            color: "#f0f0f0",
            marginBottom: 28,
          }}>
            Work together.<br />
            <span style={{ color: "#444" }}>Stay aligned.</span>
          </h1>

          <p style={{
            fontSize: 17,
            lineHeight: 1.7,
            color: "#555",
            maxWidth: 520,
            margin: "0 auto 48px",
            fontWeight: 400,
          }}>
            TeamFlow is a calm, focused workspace where goals, tasks, and team communication live together — without the noise.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" className="lp-btn-primary">
              Start for free <ArrowRight size={14} />
            </Link>
            <a href="#features" className="lp-btn-ghost">
              See features
            </a>
          </div>

          <p style={{ marginTop: 20, fontSize: 12, color: "#333", letterSpacing: "0.01em" }}>
            No credit card required · Set up in minutes
          </p>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ borderTop: "1px solid #141414", borderBottom: "1px solid #141414", padding: "32px 24px" }}>
        <div style={{
          maxWidth: 1120, margin: "0 auto",
          display: "flex", gap: 48, justifyContent: "center", alignItems: "center", flexWrap: "wrap",
        }} className="lp-stats-row">
          {STATS.map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <p style={{ fontSize: 28, fontWeight: 700, color: "#e8e8e8", letterSpacing: "-0.03em", lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 12, color: "#444", marginTop: 6, fontWeight: 500, letterSpacing: "0.02em" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ marginBottom: 64 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: "#444", textTransform: "uppercase", marginBottom: 14 }}>
              Core capabilities
            </p>
            <h2 style={{ fontSize: 40, fontWeight: 700, letterSpacing: "-0.03em", color: "#e8e8e8", maxWidth: 520, lineHeight: 1.1 }}>
              Everything your team needs. Nothing it doesn't.
            </h2>
          </div>

          <div className="lp-features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "#141414", borderRadius: 14, overflow: "hidden", border: "1px solid #141414" }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="lp-feature-card" style={{ borderRadius: 0, border: "none", borderColor: "transparent" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 9,
                  background: "#141414", border: "1px solid #1f1f1f",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 18,
                }}>
                  <f.icon size={16} color="#888" strokeWidth={1.8} />
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "#e0e0e0", marginBottom: 10, letterSpacing: "-0.01em" }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: "#555", lineHeight: 1.7, fontWeight: 400 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY SECTION ── */}
      <section id="why" style={{ padding: "100px 24px", borderTop: "1px solid #141414" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: "#444", textTransform: "uppercase", marginBottom: 14 }}>
              Why TeamFlow
            </p>
            <h2 style={{ fontSize: 38, fontWeight: 700, letterSpacing: "-0.03em", color: "#e8e8e8", lineHeight: 1.1, marginBottom: 40 }}>
              Less noise.<br />More momentum.
            </h2>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 28 }}>
              {[
                { title: "One source of truth", desc: "Goals, tasks, announcements, and activity in a single workspace." },
                { title: "Instant decisions", desc: "Real-time updates mean your team always acts on current information." },
                { title: "Clear ownership", desc: "Roles and assignees make responsibilities obvious — no ambiguity." },
              ].map((item, i) => (
                <li key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{
                    marginTop: 2, width: 20, height: 20, borderRadius: 5,
                    background: "#111", border: "1px solid #1f1f1f",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <CheckCircle size={11} color="#555" />
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#d0d0d0", marginBottom: 4 }}>{item.title}</p>
                    <p style={{ fontSize: 13, color: "#555", lineHeight: 1.65 }}>{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Visual panel */}
          <div style={{
            background: "#0c0c0c", border: "1px solid #1a1a1a",
            borderRadius: 16, padding: 32, minHeight: 360,
            display: "flex", flexDirection: "column", justifyContent: "space-between",
          }}>
            {/* Mock activity feed */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#333", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>Live activity</p>
              {[
                { user: "AK", action: "Completed goal", detail: "Q2 Revenue Target", time: "just now", color: "#10b981" },
                { user: "MS", action: "Created task", detail: "Design system audit", time: "2m ago", color: "#6366f1" },
                { user: "JL", action: "Posted update", detail: "Sprint retrospective notes", time: "8m ago", color: "#f59e0b" },
                { user: "RK", action: "Joined workspace", detail: "as Viewer", time: "15m ago", color: "#888" },
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  paddingBottom: i < 3 ? 16 : 0, marginBottom: i < 3 ? 16 : 0,
                  borderBottom: i < 3 ? "1px solid #141414" : "none",
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                    background: item.color + "20",
                    border: `1px solid ${item.color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 700, color: item.color,
                  }}>{item.user}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, color: "#555", lineHeight: 1.5 }}>
                      <span style={{ color: "#888", fontWeight: 500 }}>{item.action}</span>
                      {" · "}
                      <span style={{ color: "#555" }}>{item.detail}</span>
                    </p>
                  </div>
                  <span style={{ fontSize: 10, color: "#2d2d2d", flexShrink: 0, fontWeight: 500 }}>{item.time}</span>
                </div>
              ))}
            </div>

            {/* Mini progress bars */}
            <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid #141414" }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#333", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>Goal progress</p>
              {[
                { label: "Q2 Product Launch", pct: 78, color: "#6366f1" },
                { label: "Team Onboarding", pct: 92, color: "#10b981" },
                { label: "API Refactor", pct: 43, color: "#f59e0b" },
              ].map((g, i) => (
                <div key={i} style={{ marginBottom: i < 2 ? 12 : 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: "#555" }}>{g.label}</span>
                    <span style={{ fontSize: 11, color: "#333", fontWeight: 600 }}>{g.pct}%</span>
                  </div>
                  <div style={{ height: 3, background: "#141414", borderRadius: 999 }}>
                    <div style={{ width: `${g.pct}%`, height: "100%", background: g.color, borderRadius: 999 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "100px 24px", borderTop: "1px solid #141414" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 48, fontWeight: 700, letterSpacing: "-0.04em", color: "#e8e8e8", lineHeight: 1.05, marginBottom: 20 }}>
            Your team deserves a better workspace.
          </h2>
          <p style={{ fontSize: 15, color: "#444", lineHeight: 1.7, marginBottom: 40 }}>
            Set up takes minutes. No credit card. Invite your team and start shipping with clarity from day one.
          </p>
          <Link href="/register" className="lp-btn-primary" style={{ fontSize: 14, padding: "12px 28px" }}>
            Get started free <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid #141414", padding: "32px 24px" }}>
        <div style={{
          maxWidth: 1120, margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: 5, background: "#e8e8e8", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={12} color="#080808" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#444" }}>TeamFlow</span>
          </div>
          <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
            {["Features", "Privacy", "Terms", "Sign in"].map((l, i) => (
              <a key={i} href={l === "Sign in" ? "/login" : "#"} className="lp-nav-link" style={{ fontSize: 12 }}>{l}</a>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "#2a2a2a" }}>© 2026 TeamFlow</p>
        </div>
      </footer>
    </div>
  );
}
