import React, { useCallback, useMemo } from 'react'
import { AlertTriangle, AlertCircle, Info, X, RefreshCw, Trash2, HelpCircle } from 'lucide-react'
import { ProcessedError, ErrorAction, formatErrorForUser } from '../../utils/error-handling'
import { cn } from '../../utils/theme'

interface ErrorDisplayProps {
    errors: ProcessedError[]
    onAction?: (action: ErrorAction, error: ProcessedError) => void
    onDismiss?: (errorId: string) => void
    onDismissAll?: () => void
    className?: string
    compact?: boolean
    showTechnicalDetails?: boolean
    maxErrors?: number
    groupByType?: boolean
}

const ErrorIcon: React.FC<{ severity: ProcessedError['severity']; className?: string }> = ({
    severity,
    className
}) => {
    const iconProps = { className: cn('w-5 h-5 flex-shrink-0', className), 'aria-hidden': true }

    switch (severity) {
        case 'critical':
            return <AlertTriangle {...iconProps} className={cn(iconProps.className, 'text-red-600')} />
        case 'high':
            return <AlertCircle {...iconProps} className={cn(iconProps.className, 'text-red-500')} />
        case 'medium':
            return <AlertCircle {...iconProps} className={cn(iconProps.className, 'text-orange-500')} />
        case 'low':
            return <Info {...iconProps} className={cn(iconProps.className, 'text-blue-500')} />
        default:
            return <AlertCircle {...iconProps} className={cn(iconProps.className, 'text-gray-500')} />
    }
}

const ErrorActionButton: React.FC<{
    action: ErrorAction
    error: ProcessedError
    onAction: (action: ErrorAction, error: ProcessedError) => void
    compact?: boolean
}> = ({ action, error, onAction, compact }) => {
    const handleClick = useCallback(() => {
        if (action.handler) {
            action.handler()
        } else {
            onAction(action, error)
        }
    }, [action, error, onAction])

    const getActionIcon = () => {
        switch (action.type) {
            case 'retry':
                return <RefreshCw className="w-4 h-4" />
            case 'remove':
            case 'clear':
                return <Trash2 className="w-4 h-4" />
            case 'contact':
                return <HelpCircle className="w-4 h-4" />
            default:
                return null
        }
    }

    const getButtonClasses = () => {
        const baseClasses = [
            'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200',
            action.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        ]

        if (compact) {
            baseClasses.push('px-2 py-1 text-xs')
        }

        if (action.primary) {
            baseClasses.push(
                'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
                action.disabled ? '' : 'hover:bg-blue-700'
            )
        } else {
            baseClasses.push(
                'text-gray-700 bg-gray-100 border border-gray-300 hover:bg-gray-200 focus:ring-gray-500',
                action.disabled ? '' : 'hover:bg-gray-200'
            )
        }

        return cn(...baseClasses)
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={action.disabled}
            className={getButtonClasses()}
            aria-label={`${action.label} for ${error.context.fileName || 'file'}`}
        >
            {getActionIcon()}
            {action.label}
        </button>
    )
}

const SingleErrorDisplay: React.FC<{
    error: ProcessedError
    onAction?: (action: ErrorAction, error: ProcessedError) => void
    onDismiss?: (errorId: string) => void
    compact?: boolean
    showTechnicalDetails?: boolean
}> = ({ error, onAction, onDismiss, compact, showTechnicalDetails }) => {
    const getSeverityClasses = () => {
        switch (error.severity) {
            case 'critical':
                return 'border-red-300 bg-red-50 text-red-900'
            case 'high':
                return 'border-red-200 bg-red-50 text-red-800'
            case 'medium':
                return 'border-orange-200 bg-orange-50 text-orange-800'
            case 'low':
                return 'border-blue-200 bg-blue-50 text-blue-800'
            default:
                return 'border-gray-200 bg-gray-50 text-gray-800'
        }
    }

    const containerClasses = cn(
        'border rounded-lg p-4 space-y-3',
        getSeverityClasses(),
        compact && 'p-3 space-y-2'
    )

    return (
        <div
            className={containerClasses}
            role="alert"
            aria-live="polite"
            aria-labelledby={`error-title-${error.id}`}
            aria-describedby={`error-description-${error.id}`}
        >
            <div className="flex items-start gap-3">
                <ErrorIcon severity={error.severity} />

                <div className="flex-1 min-w-0">
                    <h4
                        id={`error-title-${error.id}`}
                        className={cn(
                            'font-medium',
                            compact ? 'text-sm' : 'text-base'
                        )}
                    >
                        {error.title}
                    </h4>

                    <p
                        id={`error-description-${error.id}`}
                        className={cn(
                            'mt-1 text-sm',
                            compact ? 'text-xs' : 'text-sm'
                        )}
                    >
                        {formatErrorForUser(error, true)}
                    </p>

                    {error.suggestions.length > 0 && !compact && (
                        <div className="mt-2">
                            <p className="text-sm font-medium mb-1">Suggestions:</p>
                            <ul className="text-sm space-y-1 list-disc list-inside">
                                {error.suggestions.map((suggestion, index) => (
                                    <li key={index}>{suggestion}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {showTechnicalDetails && (
                        <details className="mt-3">
                            <summary className="text-sm font-medium cursor-pointer hover:underline">
                                Technical Details
                            </summary>
                            <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono overflow-auto">
                                <div><strong>Error ID:</strong> {error.id}</div>
                                <div><strong>Code:</strong> {error.code}</div>
                                <div><strong>Type:</strong> {error.type}</div>
                                <div><strong>Message:</strong> {error.technicalMessage}</div>
                                {error.context.timestamp && (
                                    <div><strong>Time:</strong> {error.context.timestamp.toISOString()}</div>
                                )}
                                {error.context.fileName && (
                                    <div><strong>File:</strong> {error.context.fileName}</div>
                                )}
                                {error.context.fileSize && (
                                    <div><strong>Size:</strong> {error.context.fileSize} bytes</div>
                                )}
                            </div>
                        </details>
                    )}
                </div>

                {onDismiss && (
                    <button
                        type="button"
                        onClick={() => onDismiss(error.id)}
                        className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded"
                        aria-label="Dismiss error"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {error.actions.length > 0 && onAction && (
                <div className="flex flex-wrap gap-2 pt-2">
                    {error.actions.map((action) => (
                        <ErrorActionButton
                            key={action.id}
                            action={action}
                            error={error}
                            onAction={onAction}
                            compact={compact}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
    errors,
    onAction,
    onDismiss,
    onDismissAll,
    className,
    compact = false,
    showTechnicalDetails = false,
    maxErrors = 5,
    groupByType = false
}) => {
    const displayErrors = useMemo(() => {
        if (errors.length <= maxErrors) {
            return errors
        }
        return errors.slice(0, maxErrors)
    }, [errors, maxErrors])

    const groupedErrors = useMemo(() => {
        if (!groupByType) {
            return { ungrouped: displayErrors }
        }

        return displayErrors.reduce((groups, error) => {
            const key = error.type
            if (!groups[key]) {
                groups[key] = []
            }
            groups[key].push(error)
            return groups
        }, {} as Record<string, ProcessedError[]>)
    }, [displayErrors, groupByType])

    const hasMoreErrors = errors.length > maxErrors

    if (errors.length === 0) {
        return null
    }

    return (
        <div className={cn('space-y-4', className)} role="region" aria-label="Error messages">
            {/* Header with dismiss all button */}
            {errors.length > 1 && onDismissAll && (
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                        {errors.length} Error{errors.length !== 1 ? 's' : ''} Occurred
                    </h3>
                    <button
                        type="button"
                        onClick={onDismissAll}
                        className="text-sm text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded"
                    >
                        Dismiss All
                    </button>
                </div>
            )}

            {/* Error groups */}
            {Object.entries(groupedErrors).map(([groupKey, groupErrors]) => (
                <div key={groupKey} className="space-y-3">
                    {groupByType && groupKey !== 'ungrouped' && (
                        <h4 className="text-md font-medium text-gray-800 capitalize">
                            {groupKey.replace('-', ' ')} Errors ({groupErrors.length})
                        </h4>
                    )}

                    {groupErrors.map((error) => (
                        <SingleErrorDisplay
                            key={error.id}
                            error={error}
                            onAction={onAction}
                            onDismiss={onDismiss}
                            compact={compact}
                            showTechnicalDetails={showTechnicalDetails}
                        />
                    ))}
                </div>
            ))}

            {/* Show more indicator */}
            {hasMoreErrors && (
                <div className="text-center py-2">
                    <p className="text-sm text-gray-500">
                        Showing {maxErrors} of {errors.length} errors
                    </p>
                </div>
            )}
        </div>
    )
}

ErrorDisplay.displayName = 'ErrorDisplay'