/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "primary-color": "#3246d3", // Primary color
        "logout-color": "#FF2121", // Logout color
        "select-color": "#70758C",
        "select-background": "#D9D9D9",
      },
      screens: {
        md: "768px", // Default 'md' breakpoint
        lg: "1024px", // Default 'lg' breakpoint
        xl: "1280px", // Default 'xl' breakpoint
        sm: "535px", // Add a custom breakpoint for 890px
      },
    },
  },
  plugins: [],
};
