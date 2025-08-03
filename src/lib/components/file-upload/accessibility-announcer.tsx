import React, { useEffect, useRef, useState, useCallback } from 'react'
import { ProcessedError, createErrorAnnouncement, shouldAnnounceError } from '../../utils/error-handling'

interface AccessibilityAnnouncerProps {
    errors?: ProcessedError[]
    announceErrors?: boolean
    announceProgress?: boolean
    announceFileSelection?: boolean
    politeAnnouncements?: boolean
    className?: string
}

interface AnnouncementQueue {
    id: string
    message: string
    priority: 'polite' | 'assertive'
    timestamp: Date
}

export const AccessibilityAnnouncer: React.FC<AccessibilityAnnouncerProps> = ({
    errors = [],
    announceErrors = true,
    announceProgress = true,
    announceFileSelection = true,
    politeAnnouncements = false,
    className = ''
}) => {
    const [announcements, setAnnouncements] = useState<AnnouncementQueue[]>([])
    const [currentAnnouncement, setCurrentAnnouncement] = useState<string>('')
    const announcementTimeoutRef = useRef<NodeJS.Timeout>()
    const processedErrorsRef = useRef<Set<string>>(new Set())

    // Process new errors for announcements
    useEffect(() => {
        if (!announceErrors || errors.length === 0) return

        const newErrors = errors.filter(error =>
            !processedErrorsRef.current.has(error.id) && shouldAnnounceError(error)
        )

        if (newErrors.length === 0) return

        const newAnnouncements: AnnouncementQueue[] = newErrors.map(error => ({
            id: `error-${error.id}`,
            message: createErrorAnnouncement(error),
            priority: error.severity === 'critical' || error.severity === 'high' ? 'assertive' : 'polite',
            timestamp: new Date()
        }))

        // Mark errors as processed
        newErrors.forEach(error => {
            processedErrorsRef.current.add(error.id)
        })

        // Add to announcement queue
        setAnnouncements(prev => [...prev, ...newAnnouncements])
    }, [errors, announceErrors])

    // Process announcement queue
    useEffect(() => {
        if (announcements.length === 0) return

        const processNextAnnouncement = () => {
            const nextAnnouncement = announcements[0]
            if (!nextAnnouncement) return

            setCurrentAnnouncement(nextAnnouncement.message)
            setAnnouncements(prev => prev.slice(1))

            // Clear the announcement after a delay to allow screen readers to process it
            announcementTimeoutRef.current = setTimeout(() => {
                setCurrentAnnouncement('')
            }, 1000)
        }

        // Process immediately if no current announcement, otherwise wait
        if (!currentAnnouncement) {
            processNextAnnouncement()
        } else {
            const timeout = setTimeout(processNextAnnouncement, 1500)
            return () => clearTimeout(timeout)
        }
    }, [announcements, currentAnnouncement])

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (announcementTimeoutRef.current) {
                clearTimeout(announcementTimeoutRef.current)
            }
        }
    }, [])

    // Public method to announce custom messages
    const announce = useCallback((
        message: string,
        priority: 'polite' | 'assertive' = 'polite'
    ) => {
        const announcement: AnnouncementQueue = {
            id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            message,
            priority,
            timestamp: new Date()
        }

        setAnnouncements(prev => [...prev, announcement])
    }, [])

    // Expose announce method via ref (for parent components)
    React.useImperativeHandle(React.forwardRef(() => null), () => ({
        announce
    }))

    const liveRegionProps = {
        'aria-live': politeAnnouncements ? 'polite' as const : 'assertive' as const,
        'aria-atomic': true,
        role: 'status' as const,
        className: `sr-only ${className}`.trim()
    }

    return (
        <>
            {/* Main announcement region */}
            <div {...liveRegionProps}>
                {currentAnnouncement}
            </div>

            {/* Polite announcements region (for less critical updates) */}
            <div
                aria-live="polite"
                aria-atomic="true"
                role="status"
                className="sr-only"
            >
                {/* This will be used for progress updates and file selection announcements */}
            </div>
        </>
    )
}

// Hook to use the announcer in components
export const useAccessibilityAnnouncer = () => {
    const announcerRef = useRef<{ announce: (message: string, priority?: 'polite' | 'assertive') => void }>()

    const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
        announcerRef.current?.announce(message, priority)
    }, [])

    const announceError = useCallback((error: ProcessedError) => {
        if (shouldAnnounceError(error)) {
            const message = createErrorAnnouncement(error)
            const priority = error.severity === 'critical' || error.severity === 'high' ? 'assertive' : 'polite'
            announce(message, priority)
        }
    }, [announce])

    const announceFileSelection = useCallback((fileCount: number, totalSize?: number) => {
        let message = `${fileCount} file${fileCount !== 1 ? 's' : ''} selected`
        if (totalSize) {
            const sizeMB = (totalSize / 1024 / 1024).toFixed(1)
            message += `, total size ${sizeMB} MB`
        }
        announce(message, 'polite')
    }, [announce])

    const announceProgress = useCallback((fileName: string, progress: number) => {
        const message = `${fileName} upload ${progress}% complete`
        announce(message, 'polite')
    }, [announce])

    const announceUploadComplete = useCallback((fileName: string, success: boolean) => {
        const message = success
            ? `${fileName} uploaded successfully`
            : `${fileName} upload failed`
        announce(message, success ? 'polite' : 'assertive')
    }, [announce])

    return {
        announcerRef,
        announce,
        announceError,
        announceFileSelection,
        announceProgress,
        announceUploadComplete
    }
}

AccessibilityAnnouncer.displayName = 'AccessibilityAnnouncer'