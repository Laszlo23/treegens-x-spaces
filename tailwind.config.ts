import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        /** Chartreuse / lime from logo (`public/uf4apw1v_400x400.jpg`) — replaces default blue-leaning emerald. */
        emerald: {
          50: "#f9fce8",
          100: "#f0f6d4",
          200: "#e2eca8",
          300: "#d8e37f",
          400: "#d5e26b",
          500: "#c0ca5e",
          600: "#a3b04e",
          700: "#7f8f3e",
          800: "#5c682c",
          900: "#3d4620",
          950: "#1a1f10",
        },
        /** Dark olive for gradients (no cyan) — pairs with `emerald` above. */
        teal: {
          50: "#f4f7e5",
          100: "#e8edc8",
          200: "#d4dda5",
          300: "#b8c85e",
          400: "#9fad4a",
          500: "#8a963f",
          600: "#6f7a33",
          700: "#5a6229",
          800: "#454d20",
          900: "#2f3515",
          950: "#1a1d0c",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "seed-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(213, 226, 107, 0.28)" },
          "50%": { boxShadow: "0 0 40px rgba(213, 226, 107, 0.48)" },
        },
      },
      animation: {
        "seed-glow": "seed-glow 4s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
