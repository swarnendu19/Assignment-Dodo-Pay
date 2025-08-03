import React, { useEffect, useRef } from 'react'
import type { UploadFile, FileUploadStatus } from '../file-upload.types'

interface AccessibilityAnnouncerProps {
    files: UploadFile[]
    isUploading: boolean
    announceProgress?: boolean
    announceStatus?: boolean
    announceErrors?: boolean
    className?: string
}

export const AccessibilityAnnouncer: React.FC<AccessibilityAnnouncerProps> = ({
    files,
    isUploading,
    announceProgress = true,
    announceStatus = true,
    announceErrors = true,
    className
}) => {
    const liveRegionRef = useRef<HTMLDivElement>(null)
    const previousFilesRef = useRef<UploadFile[]>([])
    const announcementTimeoutRef = useRef<NodeJS.Timeout>()

    const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
        if (liveRegionRef.current) {
            // Clear any existing timeout
            if (announcementTimeoutRef.current) {
                clearTimeout(announcementTimeoutRef.current)
            }

            // Set the aria-live attribute based on priority
            liveRegionRef.current.setAttribute('aria-live', priority)

            // Clear the region first to ensure the announcement is heard
            liveRegionRef.current.textContent = ''

            // Add the message after a brief delay
            announcementTimeoutRef.current = setTimeout(() => {
                if (liveRegionRef.current) {
                    liveRegionRef.current.textContent = message
                }
            }, 100)
        }
    }

    useEffect(() => {
        const previousFiles = previousFilesRef.current
        const currentFiles = files

        // Announce file selection
        if (currentFiles.length > previousFiles.length && announceStatus) {
            const newFilesCount = currentFiles.length - previousFiles.length
            announce(
                `${newFilesCount} file${newFilesCount === 1 ? '' : 's'} selected for upload`,
                'polite'
            )
        }

        // Announce upload start
        if (!previousFiles.some(f => f.status === 'uploading') &&
            currentFiles.some(f => f.status === 'uploading') &&
            announceStatus) {
            announce('Upload started', 'polite')
        }

        // Announce individual file status changes
        currentFiles.forEach(currentFile => {
            const previousFile = previousFiles.find(f => f.id === currentFile.id)

            if (previousFile && previousFile.status !== currentFile.status) {
                if (currentFile.status === 'success' && announceStatus) {
                    announce(`${currentFile.name} uploaded successfully`, 'polite')
                } else if (currentFile.status === 'error' && announceErrors) {
                    const errorMessage = currentFile.error || 'Upload failed'
                    announce(`${currentFile.name} upload failed: ${errorMessage}`, 'assertive')
                }
            }

            // Announce progress milestones (every 25%)
            if (previousFile &&
                announceProgress &&
                currentFile.status === 'uploading' &&
                currentFile.progress > 0) {
                const currentMilestone = Math.floor(currentFile.progress / 25) * 25
                const previousMilestone = Math.floor(previousFile.progress / 25) * 25

                if (currentMilestone > previousMilestone && currentMilestone > 0) {
                    announce(`${currentFile.name} ${currentMilestone}% uploaded`, 'polite')
                }
            }
        })

        // Announce overall completion
        const allCompleted = currentFiles.length > 0 &&
            currentFiles.every(f => f.status === 'success' || f.status === 'error')
        const wasUploading = previousFiles.some(f => f.status === 'uploading')

        if (allCompleted && wasUploading && announceStatus) {
            const successCount = currentFiles.filter(f => f.status === 'success').length
            const errorCount = currentFiles.filter(f => f.status === 'error').length

            if (errorCount === 0) {
                announce(`All ${successCount} files uploaded successfully`, 'polite')
            } else {
                announce(
                    `Upload complete: ${successCount} successful, ${errorCount} failed`,
                    'assertive'
                )
            }
        }

        // Update previous files reference
        previousFilesRef.current = [...currentFiles]
    }, [files, announceProgress, announceStatus, announceErrors])

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (announcementTimeoutRef.current) {
                clearTimeout(announcementTimeoutRef.current)
            }
        }
    }, [])

    return (
        <div
            ref={liveRegionRef}
            className={className}
            role="status"
            aria-live="polite"
            aria-atomic="true"
            style={{
                position: 'absolute',
                left: '-10000px',
                width: '1px',
                height: '1px',
                overflow: 'hidden'
            }}
        />
    )
}