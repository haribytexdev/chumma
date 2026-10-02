/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Friendly, trust-green palette (PhonePe/GPay-inspired) — light, warm, familiar
        bg: "#F5F7F6",          // page background
        card: "#FFFFFF",
        line: "#E6EAE8",        // borders
        primary: "#0E9F7E",     // trust green — buttons, links, primary actions
        primaryDark: "#0B7D63", // hover/darker accents, headings on green
        primarySoft: "#E2F6EF", // soft green backgrounds (pills, selected states)
        ink: "#1F2937",         // main text
        ink2: "#5B6472",        // secondary text
        ink3: "#8B93A0",        // muted/placeholder text
        warn: "#D97706",        // pending/warning
        warnSoft: "#FEF3E2",
        danger: "#DC2626",
        dangerSoft: "#FDECEC",
      },
      fontFamily: {
        // System font stack - fast load, no external font dependency
        display: ["-apple-system", "'Segoe UI'", "Roboto", "sans-serif"],
        body: ["-apple-system", "'Segoe UI'", "Roboto", "Helvetica", "Arial", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
      },
      boxShadow: {
        card: "0 2px 10px rgba(31,41,55,0.06), 0 1px 2px rgba(31,41,55,0.04)",
        cardMd: "0 8px 24px rgba(31,41,55,0.10)",
      },
    },
  },
  plugins: [],
};
