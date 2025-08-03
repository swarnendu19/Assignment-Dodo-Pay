import React from 'react'
import { cn } from '../../../utils/cn'
import { ProgressBar } from './progress-bar'
import { LoadingSpinner } from './loading-spinner'
import type { UploadFile } from '../file-upload.types'

interface OverallProgressProps {
    files: UploadFile[]
    isUploading: boolean
    showDetails?: boolean
    className?: string
    'aria-label'?: string
}

export const OverallProgress: React.FC<OverallProgressProps> = ({
    files,
    isUploading,
    showDetails = true,
    className,
    'aria-label': ariaLabel
}) => {
    // Calculate overall progress
    const totalFiles = files.length
    const completedFiles = files.filter(f => f.status === 'success').length
    const failedFiles = files.filter(f => f.status === 'error').length
    const uploadingFiles = files.filter(f => f.status === 'uploading').length

    // Calculate weighted progress based on individual file progress
    const totalProgress = files.reduce((sum, file) => sum + file.progress, 0)
    const overallProgress = totalFiles > 0 ? totalProgress / totalFiles : 0

    if (totalFiles === 0) {
        return null
    }

    return (
        <div
            className={cn('space-y-2', className)}
            role="region"
            aria-label={ariaLabel || 'Upload progress summary'}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {isUploading && <LoadingSpinner size="sm" />}
                    <span className="text-sm font-medium">
                        {isUploading ? 'Uploading files...' : 'Upload complete'}
                    </span>
                </div>
                {showDetails && (
                    <span className="text-xs text-gray-600">
                        {completedFiles}/{totalFiles} files
                    </span>
                )}
            </div>

            <ProgressBar
                progress={overallProgress}
                variant={
                    failedFiles > 0 && !isUploading
                        ? 'error'
                        : completedFiles === totalFiles && totalFiles > 0
                            ? 'success'
                            : 'default'
                }
                showPercentage={showDetails}
                aria-label={`Overall upload progress: ${Math.round(overallProgress)}%`}
            />

            {showDetails && (
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
            )}
        </div>
    )
}