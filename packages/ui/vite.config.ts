import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import topLevelAwait from "vite-plugin-top-level-await";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), topLevelAwait(), tailwindcss()],
  resolve: {
    alias: {
      "@": "/src",
      "@swarmbotics/protos": path.resolve(__dirname, "../../protos/src"),
    },
  },
  server: {
    host: "0.0.0.0", // Change to 0.0.0.0 to expose to all network interfaces
    port: 3000,
    strictPort: true, // This forces Vite to use the specified port or fail
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
  preview: {
    host: "0.0.0.0", // Same here
    port: 3000,
    strictPort: true,
  },
  optimizeDeps: {
    include: ["channel-ts"],
  },
  build: {
    target: "esnext",
  },
});
