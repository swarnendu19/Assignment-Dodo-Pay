import React, { useCallback } from 'react'
import { useFileUpload } from '../file-upload-context'
import { ErrorDisplay } from '../error-display'
import { AccessibilityAnnouncer } from '../accessibility-announcer'
import { ErrorAction, ProcessedError } from '../../../utils/error-handling'
import { cn } from '../../../utils/theme'

interface ErrorFeedbackProps {
    className?: string
    compact?: boolean
    showTechnicalDetails?: boolean
    maxErrors?: number
    groupByType?: boolean
    showAccessibilityAnnouncer?: boolean
}

export const ErrorFeedback: React.FC<ErrorFeedbackProps> = ({
    className,
    compact = false,
    showTechnicalDetails = false,
    maxErrors = 5,
    groupByType = false,
    showAccessibilityAnnouncer = true
}) => {
    const { processedErrors, actions, config } = useFileUpload()

    const handleErrorAction = useCallback((action: ErrorAction, error: ProcessedError) => {
        switch (action.type) {
            case 'retry':
                if (error.context.fileName) {
                    // Find the file by name and retry
                    const fileToRetry = actions.state?.files.find(f => f.name === error.context.fileName)
                    if (fileToRetry) {
                        actions.retryUpload(fileToRetry.id)
                    }
                } else {
                    // Retry all failed uploads
                    actions.retryFailedUploads()
                }
                actions.dismissError(error.id)
                break

            case 'remove':
                if (error.context.fileName) {
                    // Find the file by name and remove
                    const fileToRemove = actions.state?.files.find(f => f.name === error.context.fileName)
                    if (fileToRemove) {
                        actions.removeFile(fileToRemove.id)
                    }
                }
                actions.dismissError(error.id)
                break

            case 'clear':
                actions.clearFailedUploads()
                actions.dismissAllErrors()
                break

            case 'refresh':
                window.location.reload()
                break

            case 'contact':
                // In a real application, this might open a support modal or redirect to support
                console.log('Contact support for error:', error.id)
                break

            default:
                // Handle custom actions
                if (action.handler) {
                    action.handler()
                }
                break
        }
    }, [actions])

    const handleDismissError = useCallback((errorId: string) => {
        actions.dismissError(errorId)
    }, [actions])

    const handleDismissAllErrors = useCallback(() => {
        actions.dismissAllErrors()
    }, [actions])

    if (processedErrors.length === 0) {
        return showAccessibilityAnnouncer ? (
            <AccessibilityAnnouncer
                errors={processedErrors}
                announceErrors={config.accessibility.announceErrors}
                announceProgress={config.accessibility.announceProgress}
                announceFileSelection={config.accessibility.announceFileSelection}
            />
        ) : null
    }

    return (
        <div className={cn('error-feedback-container', className)}>
            {showAccessibilityAnnouncer && (
                <AccessibilityAnnouncer
                    errors={processedErrors}
                    announceErrors={config.accessibility.announceErrors}
                    announceProgress={config.accessibility.announceProgress}
                    announceFileSelection={config.accessibility.announceFileSelection}
                />
            )}

            <ErrorDisplay
                errors={processedErrors}
                onAction={handleErrorAction}
                onDismiss={handleDismissError}
                onDismissAll={handleDismissAllErrors}
                compact={compact}
                showTechnicalDetails={showTechnicalDetails}
                maxErrors={maxErrors}
                groupByType={groupByType}
            />
        </div>
    )
}

ErrorFeedback.displayName = 'ErrorFeedback'