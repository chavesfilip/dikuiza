// =============================================================================
// tailwind.config.ts — Sistema de Design do Dikuiza
// =============================================================================
// O Tailwind CSS permite escrever estilos directamente no HTML/JSX usando
// classes como "bg-gold text-ink p-4". Aqui definimos as CORES e FONTES
// específicas do Dikuiza — o nosso "Design System".
// =============================================================================

import type { Config } from "tailwindcss";

const config: Config = {
  // Diz ao Tailwind onde procurar classes para incluir no CSS final
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      // ── CORES PERSONALIZADAS ──────────────────────────────────────────────
      // Usamos "ink" para fundo escuro, "gold" para o dourado angolano,
      // "terra" para o terracota quente, "sage" para verde subtil.
      colors: {
        ink: {
          DEFAULT: "#0F0E0D",
          soft:    "#1C1A17",
          mid:     "#2A2723",
        },
        gold: {
          DEFAULT: "#E8A030",
          lite:    "#F2BC60",
          dim:     "#A06E18",
        },
        terra: {
          DEFAULT: "#C0522A",
          lite:    "#D97850",
        },
        sage: {
          DEFAULT: "#3D6B58",
          lite:    "#5A9B7F",
        },
        cream: {
          DEFAULT: "#FAF7F2",
          dim:     "#C8C2B8",
          mute:    "#706A61",
        },
      },

      // ── FONTES ────────────────────────────────────────────────────────────
      // "Syne" é a fonte display (títulos, números grandes) — bold e moderna
      // "DM Sans" é a fonte de corpo — legível e profissional
      fontFamily: {
        display: ["Syne", "sans-serif"],
        body:    ["DM Sans", "sans-serif"],
      },

      // ── ANIMAÇÕES ─────────────────────────────────────────────────────────
      animation: {
        "fade-in":    "fadeIn 0.3s ease-in-out",
        "slide-up":   "slideUp 0.3s ease-out",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "spin-slow":  "spin 20s linear infinite",
      },
      keyframes: {
        fadeIn:  { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { transform: "translateY(16px)", opacity: "0" }, to: { transform: "translateY(0)", opacity: "1" } },
      },

      // ── BORDER RADIUS ─────────────────────────────────────────────────────
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
    },
  },
  plugins: [],
};

export default config;
