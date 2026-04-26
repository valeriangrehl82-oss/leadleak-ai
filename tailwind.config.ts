import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#07111f",
          900: "#0b1728",
          800: "#102033",
          700: "#18314c",
        },
        swiss: {
          green: "#25a56a",
          mint: "#e7f7ef",
          line: "#d8e0e8",
        },
      },
      boxShadow: {
        soft: "0 18px 50px rgba(7, 17, 31, 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
