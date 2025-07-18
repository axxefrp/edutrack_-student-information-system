import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Production configuration for GitHub Pages deployment
export default defineConfig({
  plugins: [react()],
  base: '/edutrack-student-information-system/', // Replace with your GitHub repository name
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Disable source maps for production
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          router: ['react-router-dom']
        }
      }
    }
  },
  define: {
    // Define environment variables for production
    'process.env.NODE_ENV': '"production"'
  }
})
