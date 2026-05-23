"use client";

import React from "react";

/**
 * Error Boundary component to catch React errors
 * Wraps child components and displays error UI on crash
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // Could send to error tracking service here
    // Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <h1 className="text-3xl font-bold text-red-600 mb-4">⚠️ Oops!</h1>
            <p className="text-gray-700 mb-4">
              Terjadi kesalahan yang tidak terduga. Silakan coba lagi.
            </p>

            {process.env.NODE_ENV === "production" && (
              <details className="text-xs bg-gray-100 p-3 rounded mb-4 max-h-40 overflow-auto">
                <summary className="font-bold cursor-pointer mb-2">
                  Error Details
                </summary>
                <pre className="whitespace-pre-wrap break-words">
                  {this.state.error?.message}
                </pre>
                <pre className="whitespace-pre-wrap break-words text-xs">
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-2">
              <button
                onClick={this.reset}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Coba Lagi
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
              >
                Kembali Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
