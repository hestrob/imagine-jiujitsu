import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0C1017",        // deep sumi-e & gi obsidian
        "ink-soft": "#161B28", // dark panel secondary
        mat: "#F3F4F0",        // clean mat off-white
        line: "#D8DCD4",       // crisp hairline on mat
        crimson: {
          DEFAULT: "#9D0000",  // black belt rank bar red from Imagine script logo
          bright: "#C8102E",   // vibrant crimson for dark backgrounds
          dark: "#750000",
        },
        belt: {
          white: "#FAFAF7",
          blue: "#2E5EAA",
          purple: "#6B4FA0",
          brown: "#7A4A2B",
          black: "#17130F",
        },
        flow: "#2E5EAA",       // signature blue mat & blue belt accent
      },
      fontFamily: {
        display: ["Anton", "sans-serif"],
        body: ["Instrument Sans", "sans-serif"],
        mono: ["Space Mono", "monospace"],
      },
      boxShadow: {
        editorial: "0 12px 32px -12px rgba(12, 16, 23, 0.14)",
        "editorial-lg": "0 24px 48px -16px rgba(12, 16, 23, 0.28)",
      },
    },
  },
  plugins: [],
};
export default config;

