// Workbox Configuration for EduTrack Liberian SIS
// Optimized for 2G networks and intermittent connectivity

module.exports = {
  globDirectory: 'dist/',
  globPatterns: [
    '**/*.{html,js,css,png,jpg,jpeg,svg,ico,woff,woff2,ttf,eot}'
  ],
  swDest: 'dist/sw.js',
  
  // Liberia-specific optimizations
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB max for large files
  
  // Runtime caching strategies optimized for poor connectivity
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
        },
        cacheKeyWillBeUsed: async ({request}) => {
          // Custom cache key to avoid auth token issues
          const url = new URL(request.url);
          url.searchParams.delete('access_token');
          return url.href;
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
    },
    
    // Images and fonts - Long-term caching
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff|woff2|ttf|eot)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-fonts-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        }
      }
    },
    
    // CDN resources (if any)
    {
      urlPattern: /^https:\/\/cdn\./,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'cdn-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        }
      }
    },
    
    // Google Fonts - Essential for UI consistency
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'google-fonts-stylesheets',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        }
      }
    },
    
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-webfonts',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        }
      }
    }
  ],
  
  // Skip waiting for immediate activation
  skipWaiting: true,
  clientsClaim: true,
  
  // Ignore URL parameters that don't affect content
  ignoreURLParametersMatching: [/^utm_/, /^fbclid$/, /^gclid$/],
  
  // Manifest transformations for better caching
  manifestTransforms: [
    (manifestEntries) => {
      // Add revision info for better cache busting
      const manifest = manifestEntries.map(entry => {
        if (entry.url.endsWith('.html')) {
          entry.revision = Date.now().toString();
        }
        return entry;
      });
      return { manifest };
    }
  ]
};
