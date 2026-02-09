import React, { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import * as Sentry from '@sentry/react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary - Captures JavaScript errors anywhere in the child component tree
 * Prevents the entire app from crashing when a component fails
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.debug('[ErrorBoundary] Error:', error.message);
    
    // Report to Sentry
    Sentry.captureException(error, {
      extra: {
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      },
      tags: {
        errorBoundary: 'ErrorBoundary',
      },
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default hacker-terminal style fallback
      return (
        <div className="min-h-screen bg-hacker-bg flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-hacker-bgSecondary border border-hacker-border rounded-xl p-6">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-hacker-error/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-hacker-error" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-hacker-text text-center mb-2">
              Algo salió mal
            </h2>

            {/* Error Message */}
            <div className="bg-hacker-bg rounded-lg p-4 mb-6 border border-hacker-border">
              <p className="text-hacker-textMuted text-sm mb-1">Error:</p>
              <p className="text-hacker-error font-mono text-sm break-words">
                {this.state.error?.message || 'Error desconocido'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 
                         bg-hacker-primary text-hacker-bg font-bold rounded-lg
                         hover:bg-hacker-primaryDim transition-colors
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hacker-primary"
              >
                <RefreshCw className="w-4 h-4" />
                Recargar
              </button>
              
              {this.props.onReset && (
                <button
                  onClick={this.handleReset}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3
                           bg-hacker-bgTertiary text-hacker-text font-bold rounded-lg
                           hover:bg-hacker-bgTertiary/80 transition-colors
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hacker-primary"
                >
                  <Home className="w-4 h-4" />
                  Volver al inicio
                </button>
              )}
            </div>

            {/* Debug info (only in development) */}
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-6 text-xs">
                <summary className="text-hacker-textDim cursor-pointer hover:text-hacker-text">
                  Detalles técnicos
                </summary>
                <pre className="mt-2 p-3 bg-hacker-bg rounded text-hacker-textMuted overflow-auto font-mono">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC to wrap a component with ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options?: { onReset?: () => void; fallback?: ReactNode }
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary onReset={options?.onReset} fallback={options?.fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

export default ErrorBoundary;
