import React, { useState, useEffect, memo } from 'react';
import { serviceWorkerManager, ServiceWorkerStatus, CacheStats } from '../../utils/serviceWorkerManager';

interface OfflineStatusIndicatorProps {
  showDetails?: boolean;
  position?: 'top' | 'bottom';
  className?: string;
}

const OfflineStatusIndicator: React.FC<OfflineStatusIndicatorProps> = memo(({ 
  showDetails = false, 
  position = 'top',
  className = ''
}) => {
  const [status, setStatus] = useState<ServiceWorkerStatus>(serviceWorkerManager.getStatus());
  const [cacheStats, setCacheStats] = useState<CacheStats>(serviceWorkerManager.getCacheStats());
  const [showDetailedInfo, setShowDetailedInfo] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Subscribe to status changes
    const unsubscribe = serviceWorkerManager.onStatusChange((newStatus) => {
      setStatus(newStatus);
      setCacheStats(serviceWorkerManager.getCacheStats());
    });

    // Listen for service worker events
    const handleUpdateAvailable = () => setUpdateAvailable(true);
    const handleOfflineMode = (event: CustomEvent) => {
      console.log('🇱🇷 Offline mode activated:', event.detail);
    };

    window.addEventListener('sw-update-available', handleUpdateAvailable);
    window.addEventListener('sw-offline-mode', handleOfflineMode as EventListener);

    return () => {
      unsubscribe();
      window.removeEventListener('sw-update-available', handleUpdateAvailable);
      window.removeEventListener('sw-offline-mode', handleOfflineMode as EventListener);
    };
  }, []);

  const getStatusColor = () => {
    if (!status.isOnline) return 'bg-red-600';
    if (status.syncStatus === 'syncing') return 'bg-yellow-500';
    if (status.cacheStatus === 'ready') return 'bg-green-600';
    return 'bg-gray-500';
  };

  const getStatusText = () => {
    if (!status.isOnline) return 'Offline Mode';
    if (status.syncStatus === 'syncing') return 'Syncing...';
    if (status.cacheStatus === 'ready') return 'Online';
    return 'Connecting...';
  };

  const getStatusIcon = () => {
    if (!status.isOnline) return '📡';
    if (status.syncStatus === 'syncing') return '🔄';
    if (status.cacheStatus === 'ready') return '🇱🇷';
    return '⏳';
  };

  const formatCacheSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleForceUpdate = async () => {
    await serviceWorkerManager.forceUpdate();
  };

  const handleClearCache = async () => {
    if (window.confirm('Clear all cached data? This will require re-downloading content.')) {
      await serviceWorkerManager.clearCache();
    }
  };

  if (!status.isServiceWorkerSupported) {
    return (
      <div className={`bg-yellow-100 border-l-4 border-yellow-500 p-2 ${className}`}>
        <div className="flex items-center">
          <span className="text-yellow-700 text-sm">
            ⚠️ Offline features not supported in this browser
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Main Status Indicator */}
      <div 
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-300 ${getStatusColor()} text-white`}
        onClick={() => setShowDetailedInfo(!showDetailedInfo)}
        title="Click for connection details"
      >
        <span className="text-sm animate-pulse">{getStatusIcon()}</span>
        <span className="text-sm font-medium">{getStatusText()}</span>
        {!status.isOnline && (
          <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
            Cached data available
          </span>
        )}
        {status.syncStatus === 'syncing' && (
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
        )}
      </div>

      {/* Update Available Banner */}
      {updateAvailable && (
        <div className="mt-2 bg-blue-600 text-white p-2 rounded-lg flex items-center justify-between">
          <span className="text-sm">🆕 App update available!</span>
          <button 
            onClick={handleForceUpdate}
            className="bg-white text-blue-600 px-3 py-1 rounded text-xs font-medium hover:bg-blue-50"
          >
            Update Now
          </button>
        </div>
      )}

      {/* Detailed Information Panel */}
      {showDetailedInfo && (
        <div className="mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-lg">
          <div className="space-y-3">
            {/* Connection Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Connection Status:
              </span>
              <span className={`text-sm font-semibold ${status.isOnline ? 'text-green-600' : 'text-red-600'}`}>
                {status.isOnline ? '🟢 Online' : '🔴 Offline'}
              </span>
            </div>

            {/* Service Worker Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Offline Support:
              </span>
              <span className={`text-sm font-semibold ${status.isServiceWorkerRegistered ? 'text-green-600' : 'text-yellow-600'}`}>
                {status.isServiceWorkerRegistered ? '✅ Active' : '⏳ Loading'}
              </span>
            </div>

            {/* Cache Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Cache Status:
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {formatCacheSize(cacheStats.totalCacheSize)}
              </span>
            </div>

            {/* Last Sync Time */}
            {status.lastSyncTime && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Last Sync:
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {status.lastSyncTime.toLocaleTimeString()}
                </span>
              </div>
            )}

            {/* Offline Capabilities */}
            {cacheStats.offlineCapabilities.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  Available Offline:
                </span>
                <div className="grid grid-cols-2 gap-1">
                  {cacheStats.offlineCapabilities.map((capability, index) => (
                    <span 
                      key={index}
                      className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded"
                    >
                      ✓ {capability}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Liberia-Specific Message */}
            {!status.isOnline && (
              <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded border-l-4 border-blue-400">
                <div className="flex items-start">
                  <span className="text-blue-400 mr-2">🇱🇷</span>
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Liberian School Mode
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                      EduTrack is optimized for intermittent connectivity. 
                      Your work is saved locally and will sync when internet returns.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <button 
                onClick={() => window.location.reload()}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-xs font-medium hover:bg-blue-700"
              >
                Refresh App
              </button>
              <button 
                onClick={handleClearCache}
                className="flex-1 bg-gray-600 text-white px-3 py-2 rounded text-xs font-medium hover:bg-gray-700"
              >
                Clear Cache
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

OfflineStatusIndicator.displayName = 'OfflineStatusIndicator';

export default OfflineStatusIndicator;
