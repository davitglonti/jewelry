import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          'firebase-vendor': ['firebase/app', 'firebase/firestore'],
          'react-vendor': ['react', 'react-dom'],
          'lucide-vendor': ['lucide-react'],
        },
      },
    },
  },
})
