import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // Dev proxy to avoid CORS preflight 403 from server
      "/spring-api": {
        target: process.env.VITE_REACT_URL || "https://kimanhome.duckdns.org",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
