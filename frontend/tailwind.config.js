/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0c', // Pure dark, almost black
        surface: '#121216', // Slightly lighter dark surface (panels, sidebar)
        'surface-accent': '#1c1c21', // Slightly lighter still
        primary: {
          DEFAULT: '#7C3AED', // Main purple
          hover: '#6D28D9',
        },
        text: {
          primary: '#e3e3e3',
          secondary: '#8d8d8d',
        },
        accent: {
          DEFAULT: '#f9f9f9', // Bright text
          icon: '#8d8d8d', // Dim icons
        },
      },
      borderRadius: {
        'panel': '12px',
        'button': '8px',
      }
    },
  },
  plugins: [],
}