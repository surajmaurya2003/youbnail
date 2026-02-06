import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  readonly props: ErrorBoundaryProps;
  state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };
  
  setState: (
    state: ErrorBoundaryState | ((prevState: ErrorBoundaryState) => ErrorBoundaryState),
    callback?: () => void
  ) => void;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
    this.setState = super.setState.bind(this);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Only log in development, use secure logging in production
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    } else {
      // In production, log minimal info without sensitive details
      console.error('Application error occurred:', {
        message: error.message,
        hasStack: !!error.stack,
        component: 'ErrorBoundary'
      });
    }
    
    // In production, send to error tracking service (Sentry, LogRocket, etc.)
    if (import.meta.env.PROD) {
      // TODO: Send to error tracking service
      // Example: Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{background: 'var(--bg-primary)'}}>
          <div className="card p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" 
                 style={{background: 'rgba(239, 68, 68, 0.1)', border: '2px solid var(--accent-primary)'}}>
              <svg className="w-8 h-8" style={{color: 'var(--accent-primary)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2" style={{color: 'var(--text-primary)'}}>
              Something went wrong
            </h2>
            <p className="text-sm mb-6" style={{color: 'var(--text-secondary)'}}>
              We encountered an unexpected error. Don't worry, your data is safe.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 p-4 rounded-lg text-left text-xs overflow-auto max-h-40" 
                   style={{background: 'var(--bg-secondary)', color: 'var(--text-muted)'}}>
                <div className="font-semibold mb-2" style={{color: 'var(--accent-primary)'}}>{this.state.error.name}</div>
                <div>{this.state.error.message}</div>
              </div>
            )}
            <button 
              onClick={this.handleReset}
              className="btn-primary w-full"
            >
              Return to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
