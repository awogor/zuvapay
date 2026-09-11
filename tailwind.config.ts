import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Satoshi"', '"Outfit"', 'system-ui', 'sans-serif'],
        display: ['"Clash Display"', '"Syne"', '"Outfit"', 'system-ui', 'sans-serif'],
        mono: ['"Space Grotesk"', 'monospace'],
      },
      colors: {
        zuva: {
          obsidian: "#0B0F17",
          slate: "#121826",
          surface: "#1A2234",
          solar: "#FF6B00",
          amber: "#F59E0B",
          gold: "#FBBF24",
          emerald: "#10B981",
          emeraldHover: "#059669",
          cyan: "#0284C7",
          cardBorder: "rgba(226, 232, 240, 0.8)",
          canvas: "#FDFDFC",
        },
        brand: {
          dark: "#0B1120",
          navy: "#0F172A",
          surface: "#1E293B",
          card: "rgba(30, 41, 59, 0.7)",
          orange: "#FF6B00",
          orangeHover: "#E65C00",
          amber: "#F59E0B",
          emerald: "#10B981",
          emeraldHover: "#059669",
          blue: "#0284C7",
          blueHover: "#0369A1",
        },
      },
      backgroundImage: {
        "solar-gradient": "linear-gradient(135deg, #FF6B00 0%, #F59E0B 50%, #FBBF24 100%)",
        "solar-glow": "radial-gradient(circle at center, rgba(255, 107, 0, 0.15) 0%, rgba(245, 158, 11, 0.05) 50%, transparent 70%)",
        "obsidian-card": "linear-gradient(135deg, #0B0F17 0%, #121826 100%)",
        "glass-surface": "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.6) 100%)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "glass-gradient": "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)",
        "card-gradient": "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
      },
      boxShadow: {
        'solar': '0 10px 30px -5px rgba(255, 107, 0, 0.28)',
        'soft-elevated': '0 20px 40px -15px rgba(15, 23, 42, 0.07)',
      },
    },
  },
  plugins: [],
};

export default config;
