import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
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
        brand: {
          dark: "#0B1120",
          navy: "#0F172A",
          surface: "#1E293B",
          card: "rgba(30, 41, 59, 0.7)",
          orange: "#FF8C00",
          orangeHover: "#E67E00",
          emerald: "#10B981",
          emeraldHover: "#059669",
          blue: "#0284C7",
          blueHover: "#0369A1",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "glass-gradient": "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)",
        "card-gradient": "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
