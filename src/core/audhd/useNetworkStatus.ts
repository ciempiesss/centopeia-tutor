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
    // Get initial status
    const getStatus = async () => {
      try {
        const networkStatus = await Network.getStatus();
        setStatus({
          isOnline: networkStatus.connected,
          connectionType: networkStatus.connectionType || 'unknown',
        });
      } catch (error) {
        console.error('Error getting network status:', error);
        // Fallback to browser API
        setStatus({
          isOnline: navigator.onLine,
          connectionType: 'unknown',
        });
      }
    };

    getStatus();

    // Listen for changes
    const setupListener = async () => {
      try {
        Network.addListener('networkStatusChange', (networkStatus) => {
          setStatus({
            isOnline: networkStatus.connected,
            connectionType: networkStatus.connectionType || 'unknown',
          });
        });
      } catch (error) {
        console.error('Error setting up network listener:', error);
        // Fallback to browser events
        const handleOnline = () => setStatus(prev => ({ ...prev, isOnline: true }));
        const handleOffline = () => setStatus(prev => ({ ...prev, isOnline: false }));
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
        };
      }
    };

    const cleanupPromise = setupListener();

    return () => {
      cleanupPromise.then(cleanup => cleanup?.());
    };
  }, []);

  return status;
}
