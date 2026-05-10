import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  // If we are building for production (GitHub), use /fatima-amer/
  // If we are running locally (npm run dev), use /
  base: command === 'build' ? "/fatima-amer/" : "/",
  server: {
    host: "0.0.0.0",
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  dedupe: ["react", "react-dom"],
}));