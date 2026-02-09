import { useEffect, useState, useRef } from 'react';
import { codeExecutor } from '../tools/CodeExecutor';

export interface UsePyodidePreloadReturn {
  isPreloaded: boolean;
  isPreloading: boolean;
  preloadError: Error | null;
}

export function usePyodidePreload(delayMs = 2000): UsePyodidePreloadReturn {
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadError, setPreloadError] = useState<Error | null>(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    // Prevent double initialization
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    // Pre-cargar Pyodide silenciosamente después del delay
    const timer = setTimeout(async () => {
      setIsPreloading(true);
      console.log('[Pyodide] Starting background preload...');
      
      try {
        await codeExecutor.initialize();
        console.log('[Pyodide] Preload complete');
        setIsPreloaded(true);
        setPreloadError(null);
      } catch (error) {
        console.warn('[Pyodide] Preload failed (will retry on first use):', error);
        setPreloadError(error instanceof Error ? error : new Error('Unknown error'));
      } finally {
        setIsPreloading(false);
      }
    }, delayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [delayMs]);

  return { isPreloaded, isPreloading, preloadError };
}
