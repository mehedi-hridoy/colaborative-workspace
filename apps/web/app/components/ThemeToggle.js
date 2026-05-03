"use client";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      style={{
        width: 52, height: 28,
        borderRadius: 999,
        border: "1px solid var(--border)",
        background: isDark
          ? "linear-gradient(135deg,#1a1a2e,#16213e)"
          : "linear-gradient(135deg,#a78bfa,#ec4899)",
        display: "flex", alignItems: "center",
        padding: "3px",
        cursor: "pointer",
        transition: "background 350ms ease",
        flexShrink: 0,
      }}
    >
      <span style={{
        width: 22, height: 22,
        borderRadius: "50%",
        background: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12,
        transform: isDark ? "translateX(24px)" : "translateX(0px)",
        transition: "transform 300ms cubic-bezier(0.34,1.56,0.64,1)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
      }}>
        {isDark ? "🌙" : "☀️"}
      </span>
    </button>
  );
}
