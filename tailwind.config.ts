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
          DEFAULT: "#664930",
          light: "#7A5E45",
          muted: "#997E67",
        },
        paper: {
          DEFAULT: "#FFDBBB",
          dark: "#CCBEB1",
        },
        accent: {
          DEFAULT: "#997E67",
          light: "#B0937A",
          dark: "#664930",
        },
        lime: {
          DEFAULT: "#CCBEB1",
          dark: "#997E67",
        },
        cyan: {
          DEFAULT: "#CCBEB1",
          dark: "#997E67",
        },
        pink: {
          DEFAULT: "#997E67",
          dark: "#664930",
        },
        yellow: {
          DEFAULT: "#FFDBBB",
          dark: "#CCBEB1",
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
        "brutal": "6px 6px 0px 0px #664930",
        "brutal-sm": "3px 3px 0px 0px #664930",
        "brutal-lg": "10px 10px 0px 0px #664930",
        "brutal-xl": "14px 14px 0px 0px #664930",
        "brutal-accent": "6px 6px 0px 0px #997E67",
        "brutal-lime": "6px 6px 0px 0px #CCBEB1",
        "brutal-cyan": "6px 6px 0px 0px #CCBEB1",
        "brutal-pink": "6px 6px 0px 0px #997E67",
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
