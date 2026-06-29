import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.API_URL || "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  define: {
    global: 'window',
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(process.env.API_URL || 'http://localhost:8080')
  },
})
