// web/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Adicione aqui customizações futuras, ex:
      // colors: { primary: '#8B9BEF' },
      // fontFamily: { sans: ['Inter', 'sans-serif'] },
    },
  },
  plugins: [],
}