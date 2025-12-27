const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
  theme: {
    extend: {
      fontFamily: {
        jetbrains: ["var(--font-jetbrains-mono)"],
      },
    },
  },
};

export default config;
