import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Fallback to local IP if .env is missing or not configured
  const backendUrl = env.VITE_API_BASE_URL;

  return {
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
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
        // Proxy image requests to avoid CORS/403 on <img> tags.
        // /img/path/to/image.png  →  http://192.168.1.16:8000/public/path/to/image.png
        "/img": {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/img/, "/public"),
        },
      },
    },
  };
});
