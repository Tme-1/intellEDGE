/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'edx-blue': '#2B2B2B',
        'edx-light-blue': '#0075B4',
        'edx-gray': '#F5F5F5',
        background: '#F1F5F9',
        primary: '#60A5FA',
        secondary: '#93C5FD',
        accent: '#818CF8',
        text: '#1E3A8A',
      },
    },
  },
  plugins: [],
} 