/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.html"
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light"]
  }
}
