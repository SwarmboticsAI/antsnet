import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
    plugins: [react(), wasm(), topLevelAwait(), tailwindcss()],
    resolve: {
        alias: {
            "@": "/src",
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
        include: ["channel-ts", "@eclipse-zenoh/zenoh-ts", "zenoh-wasm"],
    },
    build: {
        target: "esnext",
    },
});
