// EduTrack Service Worker Manager
// Liberia-optimized service worker registration and management

import { Workbox } from 'workbox-window';

interface ServiceWorkerStatus {
  isOnline: boolean;
  isServiceWorkerSupported: boolean;
  isServiceWorkerRegistered: boolean;
  cacheStatus: 'loading' | 'ready' | 'error';
  syncStatus: 'idle' | 'syncing' | 'error';
  lastSyncTime?: Date;
}

interface CacheStats {
  totalCacheSize: number;
  cacheHitRate: number;
  offlineCapabilities: string[];
  criticalDataCached: boolean;
}

class ServiceWorkerManager {
  private wb: Workbox | null = null;
  private status: ServiceWorkerStatus = {
    isOnline: navigator.onLine,
    isServiceWorkerSupported: 'serviceWorker' in navigator,
    isServiceWorkerRegistered: false,
    cacheStatus: 'loading',
    syncStatus: 'idle'
  };
  private listeners: ((status: ServiceWorkerStatus) => void)[] = [];
  private cacheStats: CacheStats = {
    totalCacheSize: 0,
    cacheHitRate: 0,
    offlineCapabilities: [],
    criticalDataCached: false
  };

  constructor() {
    this.setupNetworkListeners();
    this.initializeServiceWorker();
  }

  // Initialize service worker with Liberia-specific optimizations
  private async initializeServiceWorker(): Promise<void> {
    if (!this.status.isServiceWorkerSupported) {
      console.warn('🇱🇷 Service Worker not supported in this browser');
      this.updateStatus({ cacheStatus: 'error' });
      return;
    }

    try {
      // Use VitePWA generated service worker
      const swUrl = '/sw.js';

      this.wb = new Workbox(swUrl);

      // Service worker lifecycle events
      this.wb.addEventListener('installed', (event) => {
        console.log('🇱🇷 EduTrack Service Worker installed');
        if (event.isUpdate) {
          this.showUpdateAvailableNotification();
        }
      });

      this.wb.addEventListener('controlling', () => {
        console.log('🇱🇷 EduTrack Service Worker is controlling the page');
        this.updateStatus({ 
          isServiceWorkerRegistered: true,
          cacheStatus: 'ready'
        });
        this.prefetchCriticalData();
      });

      this.wb.addEventListener('waiting', () => {
        console.log('🇱🇷 New Service Worker is waiting');
        this.showUpdateAvailableNotification();
      });

      this.wb.addEventListener('externalinstalled', () => {
        console.log('🇱🇷 External Service Worker installed');
      });

      // Register the service worker
      await this.wb.register();
      
      this.updateStatus({ 
        isServiceWorkerRegistered: true,
        cacheStatus: 'ready'
      });

      // Setup periodic sync for Liberian connectivity patterns
      this.setupPeriodicSync();
      
      // Monitor cache performance
      this.monitorCachePerformance();

    } catch (error) {
      console.error('🇱🇷 Service Worker registration failed:', error);
      this.updateStatus({ cacheStatus: 'error' });
    }
  }

  // Setup network connectivity listeners
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      console.log('🇱🇷 Network connection restored');
      this.updateStatus({ isOnline: true, syncStatus: 'syncing' });
      this.triggerBackgroundSync();
    });

    window.addEventListener('offline', () => {
      console.log('🇱🇷 Network connection lost - switching to offline mode');
      this.updateStatus({ isOnline: false, syncStatus: 'idle' });
      this.showOfflineNotification();
    });
  }

  // Prefetch critical data for Liberian schools
  private async prefetchCriticalData(): Promise<void> {
    if (!this.wb) return;

    try {
      // Send message to service worker to prefetch critical data
      this.wb.messageSkipWaiting();
      this.wb.messageSW({ type: 'PREFETCH_CRITICAL' });
      
      console.log('🇱🇷 Prefetching critical data for offline access');
      
      // Update cache stats
      await this.updateCacheStats();
      
    } catch (error) {
      console.error('🇱🇷 Failed to prefetch critical data:', error);
    }
  }

  // Setup periodic sync for intermittent connectivity
  private setupPeriodicSync(): void {
    // Sync every 5 minutes when online
    setInterval(() => {
      if (this.status.isOnline) {
        this.triggerBackgroundSync();
      }
    }, 5 * 60 * 1000);

    // Aggressive sync when connection is restored
    if (this.status.isOnline) {
      this.triggerBackgroundSync();
    }
  }

  // Trigger background sync for offline operations
  private async triggerBackgroundSync(): Promise<void> {
    if (!this.wb || !this.status.isOnline) return;

    try {
      this.updateStatus({ syncStatus: 'syncing' });
      
      // Trigger sync via service worker message
      this.wb.messageSW({ type: 'TRIGGER_SYNC' });
      
      // Update last sync time
      this.updateStatus({ 
        syncStatus: 'idle',
        lastSyncTime: new Date()
      });
      
      console.log('🇱🇷 Background sync completed');
      
    } catch (error) {
      console.error('🇱🇷 Background sync failed:', error);
      this.updateStatus({ syncStatus: 'error' });
    }
  }

  // Monitor cache performance for optimization
  private async monitorCachePerformance(): Promise<void> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        this.cacheStats.totalCacheSize = estimate.usage || 0;
      }

      // Check critical data availability
      const cacheNames = await caches.keys();
      this.cacheStats.criticalDataCached = cacheNames.some(name => 
        name.includes('critical-data') || name.includes('student-records')
      );

      this.cacheStats.offlineCapabilities = [
        'Student Records',
        'Gradebook Data',
        'Attendance Records',
        'Class Schedules',
        'Basic Navigation'
      ];

      console.log('🇱🇷 Cache performance stats:', this.cacheStats);
      
    } catch (error) {
      console.error('🇱🇷 Failed to monitor cache performance:', error);
    }
  }

  // Update cache statistics
  private async updateCacheStats(): Promise<void> {
    await this.monitorCachePerformance();
  }

  // Show update available notification
  private showUpdateAvailableNotification(): void {
    // This would integrate with your notification system
    console.log('🇱🇷 App update available - will refresh on next visit');
    
    // You can dispatch a custom event here for the UI to handle
    window.dispatchEvent(new CustomEvent('sw-update-available', {
      detail: { message: 'A new version of EduTrack is available!' }
    }));
  }

  // Show offline notification
  private showOfflineNotification(): void {
    console.log('🇱🇷 App is now offline - cached data available');
    
    window.dispatchEvent(new CustomEvent('sw-offline-mode', {
      detail: { 
        message: 'You are offline. Cached data is available and changes will sync when online.',
        capabilities: this.cacheStats.offlineCapabilities
      }
    }));
  }

  // Update status and notify listeners
  private updateStatus(updates: Partial<ServiceWorkerStatus>): void {
    this.status = { ...this.status, ...updates };
    this.listeners.forEach(listener => listener(this.status));
  }

  // Public API methods
  public getStatus(): ServiceWorkerStatus {
    return { ...this.status };
  }

  public getCacheStats(): CacheStats {
    return { ...this.cacheStats };
  }

  public onStatusChange(listener: (status: ServiceWorkerStatus) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public async forceUpdate(): Promise<void> {
    if (this.wb) {
      this.wb.messageSkipWaiting();
      window.location.reload();
    }
  }

  public async clearCache(): Promise<void> {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('🇱🇷 All caches cleared');
      this.updateStatus({ cacheStatus: 'loading' });
    } catch (error) {
      console.error('🇱🇷 Failed to clear cache:', error);
    }
  }

  public async prefetchData(urls: string[]): Promise<void> {
    if (!this.wb) return;
    
    this.wb.messageSW({ 
      type: 'PREFETCH_URLS', 
      urls 
    });
  }

  // Check if app can work offline
  public canWorkOffline(): boolean {
    return this.status.isServiceWorkerRegistered && 
           this.cacheStats.criticalDataCached &&
           this.status.cacheStatus === 'ready';
  }

  // Get offline capabilities
  public getOfflineCapabilities(): string[] {
    return this.cacheStats.offlineCapabilities;
  }
}

// Singleton instance
export const serviceWorkerManager = new ServiceWorkerManager();

// Export types for use in components
export type { ServiceWorkerStatus, CacheStats };
