/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./styles/**/*.css",
  ],
  theme: { extend: {} },
  plugins: [],
  safelist: [
    "animate-pharmacie-ping",
    "animate-pharmacie-bounce",
    "animate-pharmacie-pulse",
  ],
};