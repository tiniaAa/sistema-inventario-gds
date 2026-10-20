/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#1E40AF',
          DEFAULT: '#2563EB',
          light: '#60A5FA'
        },
        stock: {
          optimal: '#059669',
          optimalBg: '#DEF7EC',
          warning: '#D97706',
          warningBg: '#FEF3C7',
          danger: '#DC2626',
          dangerBg: '#FDE8E8'
        }
      }
    },
  },
  plugins: [],
}
