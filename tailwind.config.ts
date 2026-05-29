import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#080B12",
        panel: "#111827",
        text: "#F9FAFB",
        muted: "#9CA3AF",
        blue: "#3B82F6",
        success: "#22C55E",
        gold: "#F59E0B",
        danger: "#EF4444",
        glass: "rgba(17, 24, 39, 0.65)",
        glassBorder: "rgba(255, 255, 255, 0.12)",
      },
      boxShadow: {
        glass: "0 24px 80px rgba(0, 0, 0, 0.34)",
        glow: "0 0 44px rgba(59, 130, 246, 0.18)",
        gold: "0 0 36px rgba(245, 158, 11, 0.16)",
      },
      keyframes: {
        floatIn: {
          "0%": { opacity: "0", transform: "translateY(18px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        sheetIn: {
          "0%": { opacity: "0", transform: "translateX(28px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        sheetUp: {
          "0%": { opacity: "0", transform: "translateY(28px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        floatIn: "floatIn 520ms ease both",
        sheetIn: "sheetIn 260ms ease both",
        sheetUp: "sheetUp 260ms ease both",
      },
    },
  },
  plugins: [],
};

export default config;
