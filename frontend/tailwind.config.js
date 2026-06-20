/** @type {import("tailwindcss").Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
    "./src/providers/**/*.{js,jsx}",
    "./src/store/**/*.{js,jsx}",
    "./src/lib/**/*.{js,jsx}",
    "./src/hooks/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#2D66D7",
          dark: "#163C92",
          soft: "#F5F7FF",
          accent: "#FFC75A",
          mint: "#DCE7FF",
          cream: "#FFF4E8",
          ink: "#112B63",
        },
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)"],
        display: ["var(--font-sora)"],
      },
      backgroundImage: {
        "hero-radial":
          "radial-gradient(circle at top left, rgba(255, 255, 255, 0.97), rgba(245, 247, 255, 0.86) 40%, rgba(220, 231, 255, 0.94) 100%)",
        "mesh-green":
          "linear-gradient(135deg, rgba(45, 102, 215, 0.14), rgba(255, 199, 90, 0.18)), radial-gradient(circle at 20% 20%, rgba(255,255,255,0.94), transparent 38%), radial-gradient(circle at 80% 0%, rgba(66,160,238,0.14), transparent 32%)",
      },
      boxShadow: {
        card: "0 24px 52px rgba(21, 50, 117, 0.1)",
        soft: "0 12px 34px rgba(17, 43, 99, 0.1)",
        glow: "0 18px 42px rgba(45, 102, 215, 0.22)",
      },
      borderRadius: {
        card: "1.5rem",
        pill: "999px",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 1.8s infinite",
      },
    },
  },
  plugins: [],
};
