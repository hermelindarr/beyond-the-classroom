/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      navy: "#101827",
      graphite: "#222A35",
      teal: { DEFAULT: "#1FA7A5", soft: "#6FD6D4" },
      violet: { DEFAULT: "#7C78B8", soft: "#C3BFF0" },
      ivory: "#F1EEE8",
      mist: "#A3AAB6",
      rule: "#2C3544",
      amber: "#E0A458",
    },
    fontFamily: {
      display: ['"Bricolage Grotesque Variable"', "system-ui", "sans-serif"],
      body: ['"Atkinson Hyperlegible"', "system-ui", "sans-serif"],
      code: ['"JetBrains Mono"', "ui-monospace", "monospace"],
    },
    extend: {
      // Type scale on a 4:3 ratio from a 17px base.
      fontSize: {
        sm: ["14px", "1.45"],
        base: ["17px", "1.6"],
        lg: ["20px", "1.5"],
        xl: ["26px", "1.25"],
        "2xl": ["34px", "1.1"],
        "3xl": ["46px", "1.02"],
        "4xl": ["62px", "0.95"],
      },
      maxWidth: { measure: "60ch", shell: "1320px" },
      borderRadius: { evidence: "2px", stage: "8px" },
    },
  },
  plugins: [],
};
