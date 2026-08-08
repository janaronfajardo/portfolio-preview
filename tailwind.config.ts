import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-instrument-serif)", "Instrument Serif", "Georgia", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "monospace"],
      },
      colors: {
        ink: {
          DEFAULT: "#0A0A0A",
          light: "#1A1A1A",
          muted: "#6B6B6B",
        },
        paper: {
          DEFAULT: "#EAE6DA",
          dark: "#D8D3C5",
        },
        accent: {
          DEFAULT: "#FF5C00",
          light: "#FF7A33",
          dark: "#E54E00",
        },
        lime: {
          DEFAULT: "#C4F500",
          dark: "#A8D400",
        },
        cyan: {
          DEFAULT: "#00E5FF",
          dark: "#00B8CC",
        },
        pink: {
          DEFAULT: "#FF3DAA",
          dark: "#E02F91",
        },
        yellow: {
          DEFAULT: "#FFE600",
          dark: "#D4C200",
        },
      },
      fontSize: {
        "fluid-sm": "clamp(0.875rem, 2vw, 1rem)",
        "fluid-base": "clamp(1rem, 2.5vw, 1.125rem)",
        "fluid-lg": "clamp(1.25rem, 4vw, 1.75rem)",
        "fluid-xl": "clamp(1.75rem, 6vw, 3rem)",
        "fluid-2xl": "clamp(2.5rem, 8vw, 5rem)",
        "fluid-3xl": "clamp(3rem, 10vw, 7rem)",
      },
      screens: {
        xs: "475px",
      },
      boxShadow: {
        "brutal": "6px 6px 0px 0px #0A0A0A",
        "brutal-sm": "3px 3px 0px 0px #0A0A0A",
        "brutal-lg": "10px 10px 0px 0px #0A0A0A",
        "brutal-xl": "14px 14px 0px 0px #0A0A0A",
        "brutal-accent": "6px 6px 0px 0px #FF5C00",
        "brutal-lime": "6px 6px 0px 0px #C4F500",
        "brutal-cyan": "6px 6px 0px 0px #00E5FF",
        "brutal-pink": "6px 6px 0px 0px #FF3DAA",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
        "stagger": "staggerIn 0.5s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        staggerIn: {
          "0%": { opacity: "0", transform: "translateY(15px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
