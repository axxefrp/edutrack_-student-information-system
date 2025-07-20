import React, { useState, useEffect, memo } from 'react';

interface ServiceWorkerInfo {
  isSupported: boolean;
  isRegistered: boolean;
  registration: ServiceWorkerRegistration | null;
  activeWorker: ServiceWorker | null;
  scope: string;
  updateAvailable: boolean;
  error: string | null;
}

const ServiceWorkerVerification: React.FC = memo(() => {
  const [swInfo, setSwInfo] = useState<ServiceWorkerInfo>({
    isSupported: 'serviceWorker' in navigator,
    isRegistered: false,
    registration: null,
    activeWorker: null,
    scope: '',
    updateAvailable: false,
    error: null
  });

  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const checkServiceWorker = async () => {
      if (!('serviceWorker' in navigator)) {
        setSwInfo(prev => ({
          ...prev,
          error: 'Service Worker not supported in this browser'
        }));
        return;
      }

      try {
        // Check if service worker is already registered
        const registration = await navigator.serviceWorker.getRegistration();
        
        if (registration) {
          setSwInfo(prev => ({
            ...prev,
            isRegistered: true,
            registration,
            activeWorker: registration.active,
            scope: registration.scope,
            updateAvailable: !!registration.waiting
          }));

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setSwInfo(prev => ({ ...prev, updateAvailable: true }));
                }
              });
            }
          });
        } else {
          setSwInfo(prev => ({
            ...prev,
            error: 'Service Worker not registered yet'
          }));
        }

        // Listen for service worker messages
        navigator.serviceWorker.addEventListener('message', (event) => {
          console.log('🇱🇷 Service Worker message:', event.data);
        });

        // Check for controller changes
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('🇱🇷 Service Worker controller changed');
          window.location.reload();
        });

      } catch (error) {
        setSwInfo(prev => ({
          ...prev,
          error: `Service Worker check failed: ${error}`
        }));
      }
    };

    checkServiceWorker();

    // Recheck every 5 seconds
    const interval = setInterval(checkServiceWorker, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdate = async () => {
    if (swInfo.registration?.waiting) {
      swInfo.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  const handleUnregister = async () => {
    if (swInfo.registration) {
      const success = await swInfo.registration.unregister();
      if (success) {
        setSwInfo(prev => ({
          ...prev,
          isRegistered: false,
          registration: null,
          activeWorker: null,
          scope: '',
          updateAvailable: false
        }));
        console.log('🇱🇷 Service Worker unregistered successfully');
      }
    }
  };

  const getStatusColor = () => {
    if (swInfo.error) return 'bg-red-100 border-red-400 text-red-700';
    if (swInfo.updateAvailable) return 'bg-yellow-100 border-yellow-400 text-yellow-700';
    if (swInfo.isRegistered) return 'bg-green-100 border-green-400 text-green-700';
    return 'bg-gray-100 border-gray-400 text-gray-700';
  };

  const getStatusIcon = () => {
    if (swInfo.error) return '❌';
    if (swInfo.updateAvailable) return '🔄';
    if (swInfo.isRegistered) return '✅';
    return '⏳';
  };

  const getStatusText = () => {
    if (swInfo.error) return 'Service Worker Error';
    if (swInfo.updateAvailable) return 'Update Available';
    if (swInfo.isRegistered) return 'Service Worker Active';
    return 'Service Worker Loading';
  };

  if (!swInfo.isSupported) {
    return (
      <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-yellow-400">⚠️</span>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Service Workers are not supported in this browser. Offline functionality will not be available.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div 
        className={`border-l-4 p-4 cursor-pointer transition-all duration-200 ${getStatusColor()}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-lg mr-2">{getStatusIcon()}</span>
            <div>
              <h3 className="font-medium">🇱🇷 EduTrack Service Worker Status</h3>
              <p className="text-sm">{getStatusText()}</p>
            </div>
          </div>
          <span className="text-sm">
            {isExpanded ? '▼' : '▶'}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="bg-white border border-gray-200 p-4 mt-2 rounded-b-lg">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Supported:</strong> {swInfo.isSupported ? '✅ Yes' : '❌ No'}
              </div>
              <div>
                <strong>Registered:</strong> {swInfo.isRegistered ? '✅ Yes' : '❌ No'}
              </div>
              <div>
                <strong>Active Worker:</strong> {swInfo.activeWorker ? '✅ Yes' : '❌ No'}
              </div>
              <div>
                <strong>Update Available:</strong> {swInfo.updateAvailable ? '🔄 Yes' : '✅ No'}
              </div>
            </div>

            {swInfo.scope && (
              <div className="text-sm">
                <strong>Scope:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{swInfo.scope}</code>
              </div>
            )}

            {swInfo.error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                <strong>Error:</strong> {swInfo.error}
              </div>
            )}

            {swInfo.activeWorker && (
              <div className="text-sm">
                <strong>Worker State:</strong> 
                <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                  {swInfo.activeWorker.state}
                </span>
              </div>
            )}

            <div className="flex space-x-2 pt-2 border-t">
              {swInfo.updateAvailable && (
                <button 
                  onClick={handleUpdate}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  Update Now
                </button>
              )}
              {swInfo.isRegistered && (
                <button 
                  onClick={handleUnregister}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  Unregister
                </button>
              )}
              <button 
                onClick={() => window.location.reload()}
                className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
              >
                Refresh Page
              </button>
            </div>

            <div className="text-xs text-gray-500 pt-2 border-t">
              <p>🇱🇷 EduTrack Service Worker provides offline capabilities for Liberian schools with poor connectivity.</p>
              <p>Check browser DevTools → Application → Service Workers for more details.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ServiceWorkerVerification.displayName = 'ServiceWorkerVerification';

export default ServiceWorkerVerification;
