/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 0 8px 2px rgba(168, 85, 247, 0.7)", // violet glow
      },
    },
  },
  plugins: [],
};
