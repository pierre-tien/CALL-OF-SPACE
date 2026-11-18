/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#05070D",
        panel: "rgba(5, 7, 13, 0.82)",
        line: "rgba(8, 123, 255, 0.4)",
        signal: "#087BFF",
        alert: "#FF2638",
        cyan: "#00D9FF",
        ice: "#EAF2FF",
      },
      fontFamily: {
        display: ["Orbitron", "sans-serif"],
        sans: ["Rajdhani", "sans-serif"],
      },
      boxShadow: {
        glass: "0 20px 60px rgba(0, 0, 0, 0.35)",
      },
    },
  },
  plugins: [],
};
