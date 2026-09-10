import type { Config } from 'tailwindcss';

// Tailwind v4 keeps design tokens in CSS. Colours, fonts and spacing
// live in the @theme block in src/app/globals.css, not here.
// This file only declares which files to scan for class names.
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  plugins: [],
};

export default config;