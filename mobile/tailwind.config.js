/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#D92243",
          50: "#fdf2f4",
          100: "#fce7ea",
          200: "#f9d0d8",
          300: "#f4a9b7",
          400: "#ed788f",
          500: "#e24d6b",
          600: "#D92243",
          700: "#b71c3a",
          800: "#981a33",
          900: "#811b30",
          950: "#470a16",
        },
      },
      borderRadius: {
        DEFAULT: "16px",
      },
      spacing: {
        "1": "8px",
        "2": "16px",
        "3": "24px",
        "4": "32px",
        "5": "40px",
        "6": "48px",
      },
    },
  },
  plugins: [],
};
