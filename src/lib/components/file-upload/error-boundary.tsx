import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, X } from 'lucide-react'
import { cn } from '../../utils/theme'

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
    errorInfo: ErrorInfo | null
    errorId: string
}

interface ErrorBoundaryProps {
    children: ReactNode
    fallback?: ReactNode
    onError?: (error: Error, errorInfo: ErrorInfo) => void
    showErrorDetails?: boolean
    className?: string
}

export class FileUploadErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)

        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: ''
        }
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        // Generate unique error ID for tracking
        const errorId = `error_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`

        return {
            hasError: true,
            error,
            errorId
        }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({
            error,
            errorInfo
        })

        // Call the onError callback if provided
        this.props.onError?.(error, errorInfo)

        // Log error for debugging
        console.error('FileUpload Error Boundary caught an error:', error, errorInfo)
    }

    handleRetry = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: ''
        })
    }

    handleDismiss = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: ''
        })
    }

    render() {
        if (this.state.hasError) {
            // If a custom fallback is provided, use it
            if (this.props.fallback) {
                return this.props.fallback
            }

            // Default error UI
            return (
                <div
                    className={cn(
                        'file-upload-error-boundary',
                        'border border-red-200 rounded-lg p-6 bg-red-50',
                        'text-red-900 space-y-4',
                        this.props.className
                    )}
                    role="alert"
                    aria-live="assertive"
                    aria-labelledby={`error-title-${this.state.errorId}`}
                    aria-describedby={`error-description-${this.state.errorId}`}
                >
                    <div className="flex items-start gap-3">
                        <AlertTriangle
                            className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                            aria-hidden="true"
                        />
                        <div className="flex-1 min-w-0">
                            <h3
                                id={`error-title-${this.state.errorId}`}
                                className="text-sm font-medium text-red-800"
                            >
                                Something went wrong with the file upload component
                            </h3>
                            <p
                                id={`error-description-${this.state.errorId}`}
                                className="mt-1 text-sm text-red-700"
                            >
                                An unexpected error occurred. You can try refreshing the component or contact support if the problem persists.
                            </p>

                            {this.props.showErrorDetails && this.state.error && (
                                <details className="mt-3">
                                    <summary className="text-sm font-medium text-red-800 cursor-pointer hover:text-red-900">
                                        Technical Details
                                    </summary>
                                    <div className="mt-2 p-3 bg-red-100 rounded border text-xs font-mono text-red-800 overflow-auto">
                                        <div className="mb-2">
                                            <strong>Error:</strong> {this.state.error.message}
                                        </div>
                                        <div className="mb-2">
                                            <strong>Stack:</strong>
                                            <pre className="whitespace-pre-wrap mt-1">{this.state.error.stack}</pre>
                                        </div>
                                        {this.state.errorInfo && (
                                            <div>
                                                <strong>Component Stack:</strong>
                                                <pre className="whitespace-pre-wrap mt-1">{this.state.errorInfo.componentStack}</pre>
                                            </div>
                                        )}
                                    </div>
                                </details>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={this.handleDismiss}
                            className="text-red-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                            aria-label="Dismiss error"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={this.handleRetry}
                            className={cn(
                                'inline-flex items-center gap-2 px-3 py-2 text-sm font-medium',
                                'text-red-700 bg-red-100 border border-red-300 rounded-md',
                                'hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
                                'transition-colors duration-200'
                            )}
                        >
                            <RefreshCw className="w-4 h-4" />
                            Try Again
                        </button>

                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className={cn(
                                'inline-flex items-center px-3 py-2 text-sm font-medium',
                                'text-red-700 bg-transparent border border-red-300 rounded-md',
                                'hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
                                'transition-colors duration-200'
                            )}
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

// Hook to create error boundary wrapper
export const withErrorBoundary = <P extends object>(
    Component: React.ComponentType<P>,
    errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) => {
    const WrappedComponent = (props: P) => (
        <FileUploadErrorBoundary {...errorBoundaryProps}>
            <Component {...props} />
        </FileUploadErrorBoundary>
    )

    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

    return WrappedComponent
}