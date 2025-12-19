/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Must match the "family" name in the URL exactly
        sans: ["Manrope", "sans-serif"],
        instrument: ["Instrument Sans", "sans-serif"],
        jetbrainsMono: ["JetBrains Mono", "monospace"], // Added space and monospace fallback
      },
    },
  },
  plugins: [],
};
