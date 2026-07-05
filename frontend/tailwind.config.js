/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Brand palette — warm amber/orange, dark theme
        brand: {
          50:  "#fff8ed",
          100: "#ffedd5",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea6c0a",
          700: "#c2570a",
          900: "#431407",
        },
        surface: {
          900: "#0e0d0b", // page background  — very dark warm-tinted black
          800: "#161410", // card background  — slightly warm dark
          700: "#1f1c17", // input / elevated card
          600: "#2c2820", // border / divider
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        mono: ["Fira Code", "ui-monospace"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(249,115,22,0.35)",
      },
    },
  },
  plugins: [],
};
