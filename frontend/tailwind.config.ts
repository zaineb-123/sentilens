import type { Config } from "tailwindcss";

/**
 * "Aurora" theme.
 * The `slate` scale is deliberately INVERTED (900 = lightest text, 50 = faintest overlay) and the
 * semantic tones are re-tinted for a dark canvas, so every existing `text-slate-*`, `bg-slate-*`,
 * `bg-primary-50`... utility renders correctly on the dark glass UI without touching each page.
 */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: ["class"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "Noto Sans Arabic", "ui-sans-serif", "system-ui", "sans-serif"] },
      colors: {
        navy: { 900: "#0B1437", 800: "#121B4E" },
        ink: "#070B1F",
        slate: {
          50: "rgba(255,255,255,0.04)", 100: "rgba(255,255,255,0.07)", 200: "rgba(255,255,255,0.12)",
          300: "#52627F", 400: "#7B8AA5", 500: "#9AA7BD", 600: "#B4BFD1", 700: "#CBD5E1", 800: "#E2E8F0", 900: "#F8FAFC",
        },
        primary: { DEFAULT: "#6366F1", 50: "rgba(129,140,248,0.14)", 100: "rgba(129,140,248,0.24)", 200: "rgba(129,140,248,0.34)", 400: "#818CF8", 600: "#A5B4FC", 700: "#C7D2FE", 800: "#E0E7FF" },
        positive: { DEFAULT: "#2DD4BF", 50: "rgba(45,212,191,0.14)", 100: "rgba(45,212,191,0.24)", 600: "#2DD4BF", 700: "#5EEAD4" },
        warning: { DEFAULT: "#FB923C", 50: "rgba(251,146,60,0.14)", 100: "rgba(251,146,60,0.24)", 600: "#FB923C", 700: "#FDBA74" },
        negative: { DEFAULT: "#F87171", 50: "rgba(248,113,113,0.14)", 100: "rgba(248,113,113,0.24)", 600: "#F87171", 700: "#FCA5A5" },
        mixed: { DEFAULT: "#A78BFA", 50: "rgba(167,139,250,0.14)", 100: "rgba(167,139,250,0.24)", 600: "#A78BFA", 700: "#C4B5FD" },
        surface: "rgba(255,255,255,0.06)", bg: "#070B1F", border: "rgba(255,255,255,0.10)",
      },
      borderRadius: { xl: "0.875rem", "2xl": "1.25rem", "3xl": "1.75rem" },
      boxShadow: {
        card: "0 8px 32px rgba(2,6,23,0.35), inset 0 1px 0 rgba(255,255,255,0.08)",
        glow: "0 0 40px rgba(99,102,241,0.35)",
      },
    },
  },
  plugins: [],
} satisfies Config;
