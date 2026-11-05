import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: { colors: {
    midnight: "#030a10", cyan: "#69e9ff", cobalt: "#357bff", pearl: "#e9f1f3", muted: "#8198a6"
  }, fontFamily: { sans: ["Arial", "Helvetica", "sans-serif"] } } }, plugins: []
};
export default config;
