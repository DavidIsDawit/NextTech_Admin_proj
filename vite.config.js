import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import eslint from "vite-plugin-eslint2";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    // Temporarily disabled to prevent build errors with shadcn components
    // eslint(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://192.168.1.16:8000/",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
