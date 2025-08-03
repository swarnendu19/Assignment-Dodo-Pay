import React from 'react'
import { cn } from '../../../utils/theme'
import { ProgressBar } from '../progress/progress-bar'
import { StatusIndicator } from '../progress/status-indicator'
import { LoadingSpinner } from '../progress/loading-spinner'
import { AccessibilityAnnouncer } from '../progress/accessibility-announcer'
import { ErrorFeedback } from './error-feedback'
import type { UploadFile } from '../file-upload.types'

interface UploadFeedbackProps {
    files: UploadFile[]
    isUploading: boolean
    showIndividualProgress?: boolean
    showOverallProgress?: boolean
    showStatusIndicators?: boolean
    showFileNames?: boolean
    enableAccessibilityAnnouncements?: boolean
    showErrorFeedback?: boolean
    showAccessibilityAnnouncer?: boolean
    layout?: 'default' | 'compact'
    progressSize?: 'sm' | 'md' | 'lg'
    statusSize?: 'sm' | 'md' | 'lg'
    maxVisibleFiles?: number
    className?: string
    onRetry?: (fileId: string) => void
    onRemove?: (fileId: string) => void
}

export const UploadFeedback: React.FC<UploadFeedbackProps> = ({
    files = [],
    isUploading,
    showIndividualProgress = true,
    showOverallProgress = true,
    showStatusIndicators = true,
    showFileNames = true,
    enableAccessibilityAnnouncements = true,
    showErrorFeedback = true,
    showAccessibilityAnnouncer = true,
    layout = 'default',
    progressSize = 'md',
    statusSize = 'md',
    maxVisibleFiles = 10,
    className,
    onRetry,
    onRemove
}) => {
    if (!files || files.length === 0) {
        return null
    }

    // Calculate overall progress
    const totalProgress = files.reduce((sum, file) => sum + file.progress, 0)
    const overallProgress = files.length > 0 ? totalProgress / files.length : 0

    const completedFiles = files.filter(f => f.status === 'success').length
    const failedFiles = files.filter(f => f.status === 'error').length
    const uploadingFiles = files.filter(f => f.status === 'uploading').length

    // Determine overall status
    const overallStatus = failedFiles > 0 && !isUploading
        ? 'error'
        : completedFiles === files.length && files.length > 0
            ? 'success'
            : 'default'

    const visibleFiles = files.slice(0, maxVisibleFiles)
    const hiddenFilesCount = Math.max(0, files.length - maxVisibleFiles)

    return (
        <div className={cn('space-y-4', className)}>
            {/* Error Feedback */}
            {showErrorFeedback && (
                <ErrorFeedback
                    compact={layout === 'compact'}
                    showAccessibilityAnnouncer={showAccessibilityAnnouncer}
                />
            )}

            {enableAccessibilityAnnouncements && (
                <AccessibilityAnnouncer
                    files={files}
                    isUploading={isUploading}
                    announceProgress={true}
                    announceStatus={true}
                    announceErrors={true}
                />
            )}

            {/* Overall Progress */}
            {showOverallProgress && files.length > 1 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {isUploading && <LoadingSpinner size="sm" />}
                            <span className="text-sm font-medium">
                                {isUploading ? 'Uploading files...' : 'Upload complete'}
                            </span>
                        </div>
                        <span className="text-xs text-gray-600">
                            {completedFiles}/{files.length} files
                        </span>
                    </div>

                    <ProgressBar
                        progress={overallProgress}
                        variant={overallStatus}
                        showPercentage={true}
                        aria-label={`Overall upload progress: ${Math.round(overallProgress)}%`}
                    />

                    <div className="flex justify-between text-xs text-gray-600">
                        <div className="flex gap-4">
                            {completedFiles > 0 && (
                                <span className="text-green-600">
                                    ✓ {completedFiles} completed
                                </span>
                            )}
                            {uploadingFiles > 0 && (
                                <span className="text-blue-600">
                                    ↑ {uploadingFiles} uploading
                                </span>
                            )}
                            {failedFiles > 0 && (
                                <span className="text-red-600">
                                    ✗ {failedFiles} failed
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Individual File Progress */}
            {showIndividualProgress && (
                <div className="space-y-3">
                    {visibleFiles.map((file) => (
                        <div
                            key={file.id}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                            {/* Status Indicator */}
                            {showStatusIndicators && (
                                <StatusIndicator
                                    status={file.status}
                                    size="sm"
                                    aria-label={`${file.name} status: ${file.status}`}
                                />
                            )}

                            {/* File Info */}
                            <div className="flex-1 min-w-0">
                                {showFileNames && (
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium truncate">
                                            {file.name}
                                        </span>
                                        <span className="text-xs text-gray-500 ml-2">
                                            {(file.size / 1024 / 1024).toFixed(1)} MB
                                        </span>
                                    </div>
                                )}

                                {/* Progress Bar for individual file */}
                                {(file.status === 'uploading' || file.progress > 0) && (
                                    <ProgressBar
                                        progress={file.progress}
                                        size="sm"
                                        variant={
                                            file.status === 'error'
                                                ? 'error'
                                                : file.status === 'success'
                                                    ? 'success'
                                                    : 'default'
                                        }
                                        showPercentage={file.status === 'uploading'}
                                        aria-label={`${file.name} upload progress: ${file.progress}%`}
                                    />
                                )}

                                {/* Error Message */}
                                {file.status === 'error' && file.error && (
                                    <div className="mt-1 text-xs text-red-600">
                                        {file.error}
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                                {file.status === 'error' && onRetry && (
                                    <button
                                        onClick={() => onRetry(file.id)}
                                        className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded border border-blue-200 hover:border-blue-300"
                                        aria-label={`Retry upload for ${file.name}`}
                                    >
                                        Retry
                                    </button>
                                )}

                                {onRemove && file.status !== 'uploading' && (
                                    <button
                                        onClick={() => onRemove(file.id)}
                                        className="text-xs text-gray-600 hover:text-red-600 px-2 py-1 rounded border border-gray-200 hover:border-red-300"
                                        aria-label={`Remove ${file.name}`}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Hidden Files Indicator */}
                    {hiddenFilesCount > 0 && (
                        <div className="text-center text-sm text-gray-600 py-2">
                            ... and {hiddenFilesCount} more file{hiddenFilesCount === 1 ? '' : 's'}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}