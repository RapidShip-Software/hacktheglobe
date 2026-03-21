import type { Config } from "tailwindcss";

const config: Config = {
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
      },
    },
  },
  plugins: [],
};

export default config;
