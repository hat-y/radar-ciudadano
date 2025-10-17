import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Only proxy API endpoints, not frontend routes
      '/auth/request-login': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/auth/verify-login': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/auth/logout': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/incidents': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
