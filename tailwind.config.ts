import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        blush: "#D9A0A7", // dusty blush — MANDATORY price-pill background
        ivory: "#FFF9F4", // warm ivory — page background
        espresso: "#382724", // espresso — body text + price-pill text
        gold: "#C6A46A", // champagne gold — accents/rules
        sage: "#78866B", // muted sage — optional accents
      },
      fontFamily: {
        display: ["var(--font-display)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Jost", "Manrope", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
