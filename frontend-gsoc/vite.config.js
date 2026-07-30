import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Proxies API + uploaded images to the Express backend (port 5050 — macOS
// Control Center squats on 5000). The frontend uses same-origin '/api'.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      "/api": { target: "http://localhost:5050", changeOrigin: true },
      "/uploads": { target: "http://localhost:5050", changeOrigin: true },
    },
  },
});
