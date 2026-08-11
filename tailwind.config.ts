import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#131624",        // gi indigo, near-black
        mat: "#F1F3EF",        // cool mat white
        line: "#D8DCD4",       // hairline on mat
        belt: {
          white: "#FAFAF7",
          blue: "#2E5EAA",
          purple: "#6B4FA0",
          brown: "#7A4A2B",
          black: "#17130F"
        },
        flow: "#2E5EAA"        // primary action = blue belt
      },
      fontFamily: {
        display: ["Anton", "sans-serif"],
        body: ["Instrument Sans", "sans-serif"],
        mono: ["Space Mono", "monospace"]
      }
    }
  },
  plugins: []
};
export default config;
