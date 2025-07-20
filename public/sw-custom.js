// EduTrack Liberian SIS - Custom Service Worker
// Optimized for Liberian school infrastructure challenges

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { BackgroundSync } from 'workbox-background-sync';
import { Queue } from 'workbox-background-sync';

// Precache all static assets
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Liberia-specific constants
const LIBERIA_CACHE_NAMES = {
  CRITICAL_DATA: 'edutrack-critical-data-v1',
  STUDENT_RECORDS: 'edutrack-student-records-v1',
  GRADEBOOK_DATA: 'edutrack-gradebook-data-v1',
  ATTENDANCE_DATA: 'edutrack-attendance-data-v1',
  OFFLINE_PAGES: 'edutrack-offline-pages-v1',
  SYNC_QUEUE: 'edutrack-sync-queue-v1'
};

// Background sync queues for offline operations
const studentDataQueue = new Queue('student-data-sync', {
  onSync: async ({queue}) => {
    let entry;
    while ((entry = await queue.shiftRequest())) {
      try {
        await fetch(entry.request);
        console.log('🇱🇷 Synced offline student data operation');
      } catch (error) {
        console.error('🇱🇷 Failed to sync student data:', error);
        await queue.unshiftRequest(entry);
        throw error;
      }
    }
  }
});

const gradebookQueue = new Queue('gradebook-sync', {
  onSync: async ({queue}) => {
    let entry;
    while ((entry = await queue.shiftRequest())) {
      try {
        await fetch(entry.request);
        console.log('🇱🇷 Synced offline gradebook operation');
      } catch (error) {
        console.error('🇱🇷 Failed to sync gradebook data:', error);
        await queue.unshiftRequest(entry);
        throw error;
      }
    }
  }
});

// Critical data prefetching for Liberian schools
const prefetchCriticalData = async () => {
  try {
    const cache = await caches.open(LIBERIA_CACHE_NAMES.CRITICAL_DATA);
    
    // Prefetch essential routes during low usage
    const criticalRoutes = [
      '/#/admin/students',
      '/#/teacher/my-classes',
      '/#/teacher/attendance',
      '/#/admin/classes',
      '/#/teacher/grades'
    ];
    
    for (const route of criticalRoutes) {
      try {
        const response = await fetch(route);
        if (response.ok) {
          await cache.put(route, response.clone());
          console.log(`🇱🇷 Prefetched critical route: ${route}`);
        }
      } catch (error) {
        console.warn(`🇱🇷 Failed to prefetch ${route}:`, error);
      }
    }
  } catch (error) {
    console.error('🇱🇷 Critical data prefetch failed:', error);
  }
};

// Offline fallback pages
const offlinePages = {
  '/offline-student-records.html': `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>EduTrack - Offline Student Records</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
        .flag { font-size: 2em; margin-bottom: 20px; }
        .status { color: #BF0A30; font-weight: bold; }
        .message { color: #002868; margin: 20px 0; }
        .cached-data { background: #f0f8ff; padding: 15px; border-radius: 4px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="flag">🇱🇷</div>
        <h1>EduTrack - Student Records</h1>
        <div class="status">⚠️ Currently Offline</div>
        <div class="message">
          You're currently offline, but you can still access cached student records.
          Your changes will be synced when internet connection is restored.
        </div>
        <div class="cached-data">
          <h3>Available Offline:</h3>
          <ul>
            <li>Student roster and basic information</li>
            <li>Recent attendance records</li>
            <li>Cached gradebook entries</li>
            <li>Class assignments and schedules</li>
          </ul>
        </div>
        <button onclick="window.location.reload()" style="background: #BF0A30; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">
          Try to Reconnect
        </button>
      </div>
    </body>
    </html>
  `,
  
  '/offline-gradebook.html': `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>EduTrack - Offline Gradebook</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
        .flag { font-size: 2em; margin-bottom: 20px; }
        .status { color: #BF0A30; font-weight: bold; }
        .message { color: #002868; margin: 20px 0; }
        .sync-info { background: #e8f5e8; padding: 15px; border-radius: 4px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="flag">🇱🇷</div>
        <h1>EduTrack - Teacher Gradebook</h1>
        <div class="status">⚠️ Currently Offline</div>
        <div class="message">
          Internet connection is unavailable. You can still view cached grades and enter new ones.
          All changes will be automatically synced when connection is restored.
        </div>
        <div class="sync-info">
          <h3>Offline Capabilities:</h3>
          <ul>
            <li>View existing student grades</li>
            <li>Enter new grades (will sync later)</li>
            <li>Access attendance records</li>
            <li>Review class performance data</li>
          </ul>
        </div>
        <button onclick="window.location.reload()" style="background: #002868; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">
          Check Connection
        </button>
      </div>
    </body>
    </html>
  `
};

// Cache offline pages
const cacheOfflinePages = async () => {
  const cache = await caches.open(LIBERIA_CACHE_NAMES.OFFLINE_PAGES);
  for (const [url, html] of Object.entries(offlinePages)) {
    const response = new Response(html, {
      headers: { 'Content-Type': 'text/html' }
    });
    await cache.put(url, response);
  }
};

// Network-first strategy for critical Firestore operations
registerRoute(
  ({url}) => url.hostname === 'firestore.googleapis.com' && url.pathname.includes('/students'),
  new NetworkFirst({
    cacheName: LIBERIA_CACHE_NAMES.STUDENT_RECORDS,
    networkTimeoutSeconds: 8, // Quick timeout for 2G
    plugins: [{
      cacheKeyWillBeUsed: async ({request}) => {
        // Remove auth tokens from cache keys
        const url = new URL(request.url);
        url.searchParams.delete('access_token');
        return url.href;
      },
      requestWillBeFetched: async ({request}) => {
        // Add offline queue for failed requests
        if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
          await studentDataQueue.pushRequest({request});
        }
        return request;
      }
    }]
  })
);

// Gradebook data with background sync
registerRoute(
  ({url}) => url.hostname === 'firestore.googleapis.com' && url.pathname.includes('/grades'),
  new NetworkFirst({
    cacheName: LIBERIA_CACHE_NAMES.GRADEBOOK_DATA,
    networkTimeoutSeconds: 10,
    plugins: [{
      requestWillBeFetched: async ({request}) => {
        if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
          await gradebookQueue.pushRequest({request});
        }
        return request;
      }
    }]
  })
);

// Install event - Setup offline capabilities
self.addEventListener('install', event => {
  console.log('🇱🇷 EduTrack Service Worker installing...');
  event.waitUntil(
    Promise.all([
      cacheOfflinePages(),
      prefetchCriticalData()
    ])
  );
  self.skipWaiting();
});

// Activate event - Clean up old caches
self.addEventListener('activate', event => {
  console.log('🇱🇷 EduTrack Service Worker activated');
  event.waitUntil(self.clients.claim());
});

// Fetch event - Handle offline scenarios
self.addEventListener('fetch', event => {
  // Handle navigation requests with offline fallbacks
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const url = new URL(event.request.url);
        
        // Provide appropriate offline page based on route
        if (url.hash.includes('students') || url.hash.includes('admin')) {
          const cache = await caches.open(LIBERIA_CACHE_NAMES.OFFLINE_PAGES);
          return cache.match('/offline-student-records.html');
        } else if (url.hash.includes('grades') || url.hash.includes('teacher')) {
          const cache = await caches.open(LIBERIA_CACHE_NAMES.OFFLINE_PAGES);
          return cache.match('/offline-gradebook.html');
        }
        
        // Default offline page
        return new Response(`
          <html>
            <body style="font-family: Arial; padding: 40px; text-align: center;">
              <h1>🇱🇷 EduTrack</h1>
              <h2>Currently Offline</h2>
              <p>Please check your internet connection and try again.</p>
              <button onclick="window.location.reload()">Retry</button>
            </body>
          </html>
        `, { headers: { 'Content-Type': 'text/html' } });
      })
    );
  }
});

// Message handling for cache updates and sync status
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'PREFETCH_CRITICAL') {
    event.waitUntil(prefetchCriticalData());
  }
});

console.log('🇱🇷 EduTrack Service Worker loaded - Optimized for Liberian schools');
