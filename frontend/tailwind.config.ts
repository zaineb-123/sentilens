import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: ["class"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "Noto Sans Arabic", "ui-sans-serif", "system-ui", "sans-serif"] },
      colors: {
        navy: { 900: "#0B1437", 800: "#121B4E" },
        primary: { DEFAULT: "#4F46E5", 50: "#EEF2FF", 100: "#E0E7FF", 600: "#4F46E5", 700: "#4338CA" },
        positive: { DEFAULT: "#0D9488", 50: "#F0FDFA", 100: "#CCFBF1", 600: "#0D9488" },
        warning: { DEFAULT: "#EA580C", 50: "#FFF7ED", 100: "#FFEDD5", 600: "#EA580C" },
        negative: { DEFAULT: "#DC2626", 50: "#FEF2F2", 100: "#FEE2E2", 600: "#DC2626" },
        mixed: { DEFAULT: "#8B5CF6", 50: "#F5F3FF", 100: "#EDE9FE", 600: "#8B5CF6" },
        surface: "#FFFFFF", bg: "#F8FAFC", border: "#E2E8F0",
      },
      borderRadius: { xl: "0.875rem", "2xl": "1.25rem" },
      boxShadow: { card: "0 1px 2px rgb(15 23 42 / 0.06), 0 1px 1px rgb(15 23 42 / 0.04)" },
    },
  },
  plugins: [],
} satisfies Config;
