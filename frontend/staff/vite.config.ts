import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
declare const process: any;

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  server: {
    proxy: {
      "/api": {
        target: process.env.API_URL || "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  define: {
    global: 'globalThis',
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(process.env.API_URL || 'http://localhost:8080')
  },
});
