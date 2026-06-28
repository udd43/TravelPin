import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('react-dom') || id.includes('react-router-dom') || id.includes('framer-motion')) {
            return 'vendor';
          }
          if (id.includes('react') && !id.includes('react-dom') && !id.includes('react-router-dom')) {
            return 'vendor';
          }
          if (id.includes('@react-google-maps/api')) {
            return 'maps';
          }
        },
      },
    },
  },
})
