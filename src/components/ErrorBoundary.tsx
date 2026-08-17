import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 m-4 bg-red-50 border border-red-200 rounded-2xl text-center space-y-3">
          <AlertTriangle className="w-10 h-10 text-red-600 mx-auto" />
          <h2 className="text-base font-bold text-red-900">
            {this.props.fallbackTitle || 'Something went wrong rendering this screen'}
          </h2>
          <p className="text-xs text-red-700 font-mono bg-red-100/70 p-3 rounded-lg text-left overflow-auto max-h-32">
            {this.state.error?.message || 'Unknown error'}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-red-700 flex items-center gap-1.5 mx-auto cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
