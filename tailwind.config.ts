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
        // Paleta oficial inspirada 100% en la Diana de Dardos (Samurai 4) + Fondo Gris Oscuro
        board: {
          dark: "#14161f",        // Gris oscuro base (fondo)
          card: "#1c1f2b",        // Gris oscuro para tarjetas y contenedores
          elevated: "#242836",    // Gris oscuro elevado para botones e inputs
          border: "#313647",      // Gris borde neutro
          green: "#00b853",       // Verde diana oficial (dobles/triples y outer bull)
          "green-dark": "#02853d",// Verde diana saturado
          red: "#e52521",         // Rojo diana oficial (dobles/triples y bullseye central)
          "red-dark": "#b01815",  // Rojo diana profundo
          sisal: "#efe7d8",       // Marfil/Sisal natural de sectores claros
          "sisal-muted": "#b8ad98", // Sisal envejecido para subtítulos
          blue: "#1d68ed",        // Azul eléctrico oficial marca Samurai 4
          "blue-glow": "#38bdf8", // Azul brillo
          charcoal: "#0d0e12",    // Negro carbón de sectores oscuros y aro
          wire: "#ffffff",        // Blanco alambre/spider de los números
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
