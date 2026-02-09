import { useState, useEffect } from 'react';
import { Network } from '@capacitor/network';

interface NetworkStatus {
  isOnline: boolean;
  connectionType: string;
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: true,
    connectionType: 'wifi',
  });

  useEffect(() => {
    let isMounted = true;
    let browserListeners: { remove: () => void } | null = null;

    // Get initial status
    const getStatus = async () => {
      try {
        const networkStatus = await Network.getStatus();
        if (isMounted) {
          setStatus({
            isOnline: networkStatus.connected,
            connectionType: networkStatus.connectionType || 'unknown',
          });
        }
      } catch (error) {
        console.error('[useNetworkStatus] Error getting network status:', error);
        if (isMounted) {
          // Fallback to browser API
          setStatus({
            isOnline: navigator.onLine,
            connectionType: 'unknown',
          });
        }
      }
    };

    getStatus();

    // Listen for changes
    const setupListener = async () => {
      try {
        const listener = await Network.addListener('networkStatusChange', (networkStatus) => {
          if (isMounted) {
            setStatus({
              isOnline: networkStatus.connected,
              connectionType: networkStatus.connectionType || 'unknown',
            });
          }
        });
        return listener;
      } catch (error) {
        console.error('[useNetworkStatus] Error setting up Capacitor listener:', error);
        // Fallback to browser events
        const handleOnline = () => isMounted && setStatus(prev => ({ ...prev, isOnline: true }));
        const handleOffline = () => isMounted && setStatus(prev => ({ ...prev, isOnline: false }));
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        browserListeners = {
          remove: () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
          }
        };
        
        return browserListeners;
      }
    };

    const listenerPromise = setupListener();

    return () => {
      isMounted = false;
      // Cleanup both Capacitor and browser listeners
      listenerPromise.then(listener => {
        if (listener && 'remove' in listener) {
          listener.remove();
        }
      }).catch(err => {
        console.warn('[useNetworkStatus] Error during cleanup:', err);
      });
      
      if (browserListeners) {
        browserListeners.remove();
      }
    };
  }, []);

  return status;
}
