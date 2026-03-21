/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        garden: {
          50: "#E8F5E9",
          100: "#C8E6C9",
          200: "#A5D6A7",
          300: "#81C784",
          400: "#66BB6A",
          500: "#4CAF50",
        },
        sky: {
          50: "#E3F2FD",
          100: "#BBDEFB",
          200: "#90CAF9",
        },
        earth: {
          50: "#EFEBE9",
          100: "#D7CCC8",
          200: "#BCAAA4",
        },
        clinical: {
          teal: "#0D9488",
          slate: "#64748B",
          bg: "#F8FAFC",
        },
        caregiver: {
          blue: "#EFF6FF",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      keyframes: {
        aurora: {
          "0%": { backgroundPosition: "50% 50%, 50% 50%" },
          "50%": { backgroundPosition: "350% 50%, 350% 50%" },
          "100%": { backgroundPosition: "50% 50%, 50% 50%" },
        },
        "shine-pulse": {
          "0%": { "--shine-angle": "0deg" },
          "100%": { "--shine-angle": "360deg" },
        },
        "shimmer-slide": {
          to: { transform: "translate(calc(100cqw - 100%), 0)" },
        },
        "spin-around": {
          "0%": { transform: "translateZ(0) rotate(0)" },
          "15%, 35%": { transform: "translateZ(0) rotate(90deg)" },
          "65%, 85%": { transform: "translateZ(0) rotate(270deg)" },
          "100%": { transform: "translateZ(0) rotate(360deg)" },
        },
      },
      animation: {
        aurora: "aurora 15s linear infinite",
        "shine-pulse": "shine-pulse 14s infinite linear",
        "shimmer-slide": "shimmer-slide 3s ease-in-out infinite alternate",
        "spin-around": "spin-around 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
