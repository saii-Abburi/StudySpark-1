import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-4 text-white">
          <div className="w-full max-w-2xl bg-dark-800 border-t-4 border-t-red-500 border-r border-r-dark-700 border-b border-b-dark-700 border-l border-l-dark-700 p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-red-500/10 rounded-full blur-3xl"></div>
            
            <div className="flex items-center space-x-4 mb-6 relative z-10">
              <div className="w-12 h-12 bg-red-500/20 border border-red-500/30 text-red-500 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tight text-white mb-1">Application Error</h1>
                <p className="text-slate-200 text-xs font-bold uppercase tracking-widest">A component crashed while rendering</p>
              </div>
            </div>
            
            <div className="bg-dark-900 border border-dark-700 p-4 mb-8 overflow-auto max-h-64 relative z-10 text-left w-full">
               <p className="text-red-400 font-mono text-sm font-bold mb-2">{this.state.error && this.state.error.toString()}</p>
               <pre className="text-slate-300 font-mono text-xs whitespace-pre-wrap">{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 relative z-10">
              <button 
                onClick={() => window.location.reload()}
                className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload Page
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                className="flex-1 px-6 py-3 bg-dark-900 hover:bg-dark-700 text-slate-300 border border-dark-700 font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center"
              >
                <Home className="w-4 h-4 mr-2" />
                Return Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
