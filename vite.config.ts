import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    // Determine if we're building for GitHub Pages
    const isGitHubPages = env.VITE_GITHUB_PAGES === 'true' || process.env.VITE_GITHUB_PAGES === 'true';

    return {
      // Set base URL for GitHub Pages deployment
      base: isGitHubPages ? '/edutrack_-student-information-system/' : '/',

      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          devOptions: {
            enabled: true, // Enable service worker in development
            type: 'module'
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,gif,webp,woff,woff2,ttf,eot}'],
            runtimeCaching: [
              // Firebase Firestore API - Critical for offline functionality
              {
                urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'firestore-api-cache',
                  networkTimeoutSeconds: 10, // Quick timeout for 2G
                  expiration: {
                    maxEntries: 100,
                    maxAgeSeconds: 24 * 60 * 60, // 24 hours
                  }
                }
              },
              // Firebase Auth API
              {
                urlPattern: /^https:\/\/identitytoolkit\.googleapis\.com\/.*/,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'firebase-auth-cache',
                  networkTimeoutSeconds: 8,
                  expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 12 * 60 * 60, // 12 hours
                  }
                }
              },
              // Static assets - Aggressive caching for 2G optimization
              {
                urlPattern: /\.(?:js|css|html)$/,
                handler: 'StaleWhileRevalidate',
                options: {
                  cacheName: 'static-assets-cache',
                  expiration: {
                    maxEntries: 200,
                    maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
                  }
                }
              }
            ]
          },
          manifest: {
            name: 'EduTrack - Liberian Student Information System',
            short_name: 'EduTrack',
            description: 'Student Information System optimized for Liberian schools with offline capabilities',
            theme_color: '#BF0A30',
            background_color: '#002868',
            display: 'standalone',
            orientation: 'portrait',
            scope: '/',
            start_url: '/',
            icons: [
              {
                src: '/favicon.svg',
                sizes: 'any',
                type: 'image/svg+xml',
                purpose: 'any maskable'
              }
            ]
          }
        })
      ],

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
