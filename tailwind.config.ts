import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        dart: {
          dark: "#0b0f19",
          card: "#131b2e",
          border: "#1e293b",
          gold: "#eab308",
          red: "#ef4444",
          green: "#10b981",
          cyan: "#06b6d4",
          purple: "#8b5cf6",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-short": "bounce 0.6s ease-in-out 2",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(16, 185, 129, 0.2), 0 0 20px rgba(16, 185, 129, 0.2)" },
          "100%": { boxShadow: "0 0 15px rgba(16, 185, 129, 0.6), 0 0 35px rgba(16, 185, 129, 0.4)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
