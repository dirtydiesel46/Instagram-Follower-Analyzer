import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // Set base path for GitHub Pages repo deployment
  base: '/Instagram-Follower-Analyzer/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    // Improve HMR connection handling
    hmr: {
      protocol: 'ws',
      timeout: 5000,
      overlay: true,
      clientPort: 5173,
      host: 'localhost'
    },
    // Watch for file changes more aggressively
    watch: {
      usePolling: true,
      interval: 1000,
    },
    // Handle CORS and host settings
    cors: true,
    strictPort: true,
    port: 5173,
    host: true // Listen on all addresses
  }
})
