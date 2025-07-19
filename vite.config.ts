import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    // Determine if we're building for GitHub Pages
    const isGitHubPages = env.VITE_GITHUB_PAGES === 'true' || process.env.VITE_GITHUB_PAGES === 'true';

    return {
      // Set base URL for GitHub Pages deployment
      base: isGitHubPages ? '/edutrack_-student-information-system/' : '/',

      plugins: [react()],

      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },

      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },

      // Build configuration for production
      build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false, // Disable sourcemaps for production
        minify: 'terser',
        rollupOptions: {
          output: {
            manualChunks: {
              // Separate vendor chunks for better caching
              vendor: ['react', 'react-dom'],
              router: ['react-router-dom'],
              charts: ['recharts'],
              firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore']
            }
          }
        }
      },

      // Development server configuration
      server: {
        port: 5174,
        host: true,
        open: true
      },

      // Preview server configuration
      preview: {
        port: 4173,
        host: true
      }
    };
});
