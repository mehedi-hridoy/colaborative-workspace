// ═══════════════════════════════════════════════════════════════════════════════
// COHERE DESIGN SYSTEM - Design Tokens
// Based on design.md specifications
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// COLOR PALETTE
// ─────────────────────────────────────────────────────────────────────────────

export const colors = {
  // Brand & Accent
  black: "#000000",
  nearBlackPrimary: "#17171c",
  deepEnterpriseGreen: "#003c33",
  darkNavy: "#071829",
  actionBlue: "#1863dc",
  coral: "#ff7759",
  softCoral: "#ffad9b",

  // Surface & Background
  white: "#ffffff",
  softStone: "#eeece7",
  paleGreenWash: "#edfce9",
  paleBluWash: "#f1f5ff",
  cardBorder: "#f2f2f2",

  // Text & Rules
  ink: "#212121",
  mutedSlate: "#93939f",
  slate: "#75758a",
  hairline: "#d9d9dd",
  borderLight: "#e5e7eb",

  // Semantic
  focusBlue: "#4c6ee6",
  formFocusViolet: "#9b60aa",
  errorRed: "#b30000",
  successGreen: "#10b981",
  warningOrange: "#f97316",
  infoBlue: "#3b82f6",
};

// ─────────────────────────────────────────────────────────────────────────────
// TYPOGRAPHY
// ─────────────────────────────────────────────────────────────────────────────

export const typography = {
  // Font Families (fallbacks included)
  display: "var(--font-display, 'CohereText', 'Space Grotesk', 'Inter', ui-sans-serif, system-ui)",
  body: "var(--font-body, 'Unica77', 'Inter', 'Arial', ui-sans-serif, system-ui)",
  mono: "var(--font-mono, 'CohereMono', 'monospace')",

  // Text Styles
  styles: {
    heroDisplay: {
      size: "96px",
      weight: "400",
      lineHeight: "1.00",
      letterSpacing: "-1.92px",
      className: "text-8xl font-normal leading-none tracking-tighter",
    },
    productDisplay: {
      size: "72px",
      weight: "400",
      lineHeight: "1.00",
      letterSpacing: "-1.44px",
      className: "text-7xl font-normal leading-none tracking-tighter",
    },
    sectionDisplay: {
      size: "60px",
      weight: "400",
      lineHeight: "1.00",
      letterSpacing: "-1.2px",
      className: "text-6xl font-normal leading-tight tracking-tighter",
    },
    sectionHeading: {
      size: "48px",
      weight: "400",
      lineHeight: "1.20",
      letterSpacing: "-0.48px",
      className: "text-5xl font-normal leading-snug tracking-tight",
    },
    cardHeading: {
      size: "32px",
      weight: "400",
      lineHeight: "1.20",
      letterSpacing: "-0.32px",
      className: "text-4xl font-normal leading-snug tracking-tight",
    },
    featureHeading: {
      size: "24px",
      weight: "400",
      lineHeight: "1.30",
      letterSpacing: "0",
      className: "text-2xl font-normal leading-relaxed",
    },
    bodyLarge: {
      size: "18px",
      weight: "400",
      lineHeight: "1.40",
      letterSpacing: "0",
      className: "text-lg font-normal leading-relaxed",
    },
    body: {
      size: "16px",
      weight: "400",
      lineHeight: "1.50",
      letterSpacing: "0",
      className: "text-base font-normal leading-relaxed",
    },
    button: {
      size: "14px",
      weight: "500",
      lineHeight: "1.71",
      letterSpacing: "0",
      className: "text-sm font-medium leading-relaxed",
    },
    caption: {
      size: "14px",
      weight: "400",
      lineHeight: "1.40",
      letterSpacing: "0",
      className: "text-sm font-normal leading-relaxed",
    },
    monoLabel: {
      size: "14px",
      weight: "400",
      lineHeight: "1.40",
      letterSpacing: "0.28px",
      className: "text-sm font-normal leading-relaxed tracking-wide uppercase",
    },
    micro: {
      size: "12px",
      weight: "400",
      lineHeight: "1.40",
      letterSpacing: "0",
      className: "text-xs font-normal leading-relaxed",
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SPACING SYSTEM
// ─────────────────────────────────────────────────────────────────────────────

export const spacing = {
  0: "0",
  2: "2px",
  4: "4px",
  6: "6px",
  8: "8px",
  10: "10px",
  12: "12px",
  16: "16px",
  20: "20px",
  22: "22px",
  24: "24px",
  28: "28px",
  32: "32px",
  36: "36px",
  40: "40px",
  56: "56px",
  60: "60px",
  64: "64px",
  80: "80px",
};

// ─────────────────────────────────────────────────────────────────────────────
// BORDER RADIUS
// ─────────────────────────────────────────────────────────────────────────────

export const radius = {
  none: "0",
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "22px",
  full: "9999px",
};

// ─────────────────────────────────────────────────────────────────────────────
// ELEVATION / SHADOWS
// ─────────────────────────────────────────────────────────────────────────────

export const shadows = {
  none: "none",
  xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

export const components = {
  // Button variants
  buttonPrimary: "bg-black text-white hover:bg-[#17171c] rounded-full px-6 py-3 font-medium text-base transition-colors",
  buttonSecondary: "bg-white border border-black text-black hover:bg-black hover:text-white rounded-full px-6 py-3 font-medium text-base transition-colors",
  buttonGhost: "text-black underline hover:no-underline font-medium transition-colors",

  // Card
  card: "bg-white rounded-lg border border-[#f2f2f2] p-6 shadow-xs hover:shadow-sm transition-shadow",
  cardDark: "bg-black rounded-lg border border-[#f2f2f2]/10 p-6 shadow-xs hover:shadow-sm transition-shadow",

  // Input
  input: "bg-white border border-[#e5e7eb] rounded-lg px-4 py-2 text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors",
  inputDark: "bg-[#1a1a1a] border border-[#f2f2f2]/10 rounded-lg px-4 py-2 text-base text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors",
};

// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

export const createColorClass = (bgColor, textColor = colors.ink) => {
  return `bg-[${bgColor}] text-[${textColor}]`;
};
