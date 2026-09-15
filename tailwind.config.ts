import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1A365D",
          50: "#EEF2F8",
          100: "#D7E1EE",
          200: "#B0C3DD",
          300: "#7C9CC4",
          400: "#4D74A6",
          500: "#2C4F80",
          600: "#1E3E68",
          700: "#1A365D",
          800: "#122744",
          900: "#0B1A2E",
        },
        secondary: {
          DEFAULT: "#ED8936",
          50: "#FEF3E7",
          100: "#FDE1C2",
          200: "#FBC488",
          300: "#F6AD55",
          400: "#F1993F",
          500: "#ED8936",
          600: "#D9701F",
          700: "#B25818",
          800: "#8C4514",
          900: "#66330F",
        },
        tertiary: {
          DEFAULT: "#F6AD55",
          50: "#FFFAF0",
          100: "#FEEBC8",
          200: "#FBD38D",
          300: "#F6AD55",
          400: "#ED9A3D",
          500: "#DD8425",
        },
        neutral: {
          DEFAULT: "#4A5568",
          50: "#F7F8FA",
          100: "#EDEFF3",
          200: "#D9DDE5",
          300: "#B7BEC9",
          400: "#8B94A3",
          500: "#697180",
          600: "#4A5568",
          700: "#3A4353",
          800: "#2A303D",
          900: "#1B1F27",
        },
      },
      fontFamily: {
        sans: ["var(--font-hanken)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
