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
        // Paleta deportiva ultra-oscura basada en la diana (Captura 1) con fondo profundo hacia el negro
        board: {
          dark: "#07090e",        // Fondo ultra oscuro profundo (hacia el negro)
          card: "#0f1422",        // Contenedores y tarjetas oscuras de alto contraste
          elevated: "#151d30",    // Elementos interactivos elevados
          border: "#1e293b",      // Borde sutil y limpio
          green: "#00e676",       // Verde neón de la diana (aciertos, activo y promedios)
          "green-dark": "#00c853",// Verde diana sólido
          red: "#ef4444",         // Rojo diana deportivo (dobles, bullseye y bogey)
          "red-dark": "#dc2626",  // Rojo oscuro
          blue: "#0284c7",        // Azul vibrante de torneos y acciones secundarias
          "blue-glow": "#38bdf8", // Azul brillo
          charcoal: "#05070a",    // Negro azabache
          wire: "#ffffff",        // Blanco puro para dígitos de tanteo y títulos
          muted: "#94a3b8",       // Texto secundario limpio (slate-400)
        },
      },
      boxShadow: {
        "dart-green": "0 0 20px rgba(0, 184, 83, 0.35)",
        "dart-red": "0 0 20px rgba(229, 37, 33, 0.35)",
        "dart-blue": "0 0 20px rgba(29, 104, 237, 0.35)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-short": "bounce 0.6s ease-in-out 2",
        "glow-green": "glowGreen 2s ease-in-out infinite alternate",
        "glow-red": "glowRed 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glowGreen: {
          "0%": { boxShadow: "0 0 5px rgba(0, 184, 83, 0.2)" },
          "100%": { boxShadow: "0 0 20px rgba(0, 184, 83, 0.6)" },
        },
        glowRed: {
          "0%": { boxShadow: "0 0 5px rgba(229, 37, 33, 0.2)" },
          "100%": { boxShadow: "0 0 20px rgba(229, 37, 33, 0.6)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
