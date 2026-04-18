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
          DEFAULT: "#7AB640",
          dark: "#183227",
          soft: "#F5F8EA",
          accent: "#FFB938",
          mint: "#DCEFD2",
          cream: "#FFF7E8",
          ink: "#102217",
        },
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)"],
        display: ["var(--font-sora)"],
      },
      backgroundImage: {
        "hero-radial":
          "radial-gradient(circle at top left, rgba(255, 255, 255, 0.95), rgba(245, 248, 234, 0.72) 40%, rgba(220, 239, 210, 0.92) 100%)",
        "mesh-green":
          "linear-gradient(135deg, rgba(122, 182, 64, 0.18), rgba(255, 185, 56, 0.18)), radial-gradient(circle at 20% 20%, rgba(255,255,255,0.9), transparent 38%), radial-gradient(circle at 80% 0%, rgba(122,182,64,0.16), transparent 32%)",
      },
      boxShadow: {
        card: "0 20px 45px rgba(14, 31, 18, 0.08)",
        soft: "0 10px 30px rgba(16, 34, 23, 0.08)",
        glow: "0 16px 40px rgba(122, 182, 64, 0.22)",
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
