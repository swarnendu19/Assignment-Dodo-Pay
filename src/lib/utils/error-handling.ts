import { FileError, FileUploadConfig } from '../components/file-upload/file-upload.types'

export type ErrorType =
    | 'validation'
    | 'network'
    | 'upload'
    | 'file-system'
    | 'permission'
    | 'quota'
    | 'timeout'
    | 'unknown'

export interface ErrorContext {
    fileName?: string
    fileSize?: number
    fileType?: string
    operation?: string
    timestamp?: Date
    userAgent?: string
    retryCount?: number
    maxRetries?: number
}

export interface ProcessedError {
    id: string
    type: ErrorType
    code: string
    title: string
    message: string
    userMessage: string
    technicalMessage: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    recoverable: boolean
    retryable: boolean
    context: ErrorContext
    suggestions: string[]
    actions: ErrorAction[]
}

export interface ErrorAction {
    id: string
    label: string
    type: 'retry' | 'remove' | 'clear' | 'refresh' | 'contact' | 'custom'
    handler?: () => void | Promise<void>
    disabled?: boolean
    primary?: boolean
}

/**
 * Maps common error codes to user-friendly messages
 */
const ERROR_MESSAGES: Record<string, {
    title: string
    userMessage: string
    severity: ProcessedError['severity']
    recoverable: boolean
    retryable: boolean
    suggestions: string[]
}> = {
    // File validation errors
    'file-too-large': {
        title: 'File Too Large',
        userMessage: 'The selected file is too large to upload.',
        severity: 'medium',
        recoverable: true,
        retryable: false,
        suggestions: [
            'Try compressing the file before uploading',
            'Choose a smaller file',
            'Contact support if you need to upload larger files'
        ]
    },
    'file-too-small': {
        title: 'File Too Small',
        userMessage: 'The selected file is too small.',
        severity: 'low',
        recoverable: true,
        retryable: false,
        suggestions: [
            'Make sure the file contains content',
            'Choose a different file'
        ]
    },
    'invalid-file-type': {
        title: 'Invalid File Type',
        userMessage: 'This file type is not supported.',
        severity: 'medium',
        recoverable: true,
        retryable: false,
        suggestions: [
            'Check the list of supported file types',
            'Convert your file to a supported format',
            'Choose a different file'
        ]
    },
    'invalid-file-extension': {
        title: 'Invalid File Extension',
        userMessage: 'This file extension is not allowed.',
        severity: 'medium',
        recoverable: true,
        retryable: false,
        suggestions: [
            'Rename the file with a supported extension',
            'Convert your file to a supported format'
        ]
    },
    'too-many-files': {
        title: 'Too Many Files',
        userMessage: 'You have selected too many files.',
        severity: 'medium',
        recoverable: true,
        retryable: false,
        suggestions: [
            'Remove some files and try again',
            'Upload files in smaller batches'
        ]
    },
    'image-width-too-large': {
        title: 'Image Too Wide',
        userMessage: 'The image width exceeds the maximum allowed size.',
        severity: 'medium',
        recoverable: true,
        retryable: false,
        suggestions: [
            'Resize the image to a smaller width',
            'Use an image editing tool to reduce dimensions'
        ]
    },
    'image-height-too-large': {
        title: 'Image Too Tall',
        userMessage: 'The image height exceeds the maximum allowed size.',
        severity: 'medium',
        recoverable: true,
        retryable: false,
        suggestions: [
            'Resize the image to a smaller height',
            'Use an image editing tool to reduce dimensions'
        ]
    },
    'invalid-image': {
        title: 'Invalid Image',
        userMessage: 'The image file appears to be corrupted or invalid.',
        severity: 'high',
        recoverable: true,
        retryable: false,
        suggestions: [
            'Try opening the image in an image viewer to verify it works',
            'Choose a different image file',
            'Re-save the image in a different format'
        ]
    },

    // Network and upload errors
    'network-error': {
        title: 'Network Error',
        userMessage: 'Unable to connect to the server.',
        severity: 'high',
        recoverable: true,
        retryable: true,
        suggestions: [
            'Check your internet connection',
            'Try again in a few moments',
            'Contact support if the problem persists'
        ]
    },
    'upload-timeout': {
        title: 'Upload Timeout',
        userMessage: 'The upload took too long and was cancelled.',
        severity: 'medium',
        recoverable: true,
        retryable: true,
        suggestions: [
            'Try uploading a smaller file',
            'Check your internet connection speed',
            'Try again when your connection is more stable'
        ]
    },
    'server-error': {
        title: 'Server Error',
        userMessage: 'The server encountered an error while processing your upload.',
        severity: 'high',
        recoverable: true,
        retryable: true,
        suggestions: [
            'Try again in a few minutes',
            'Contact support if the error continues'
        ]
    },
    'quota-exceeded': {
        title: 'Storage Quota Exceeded',
        userMessage: 'You have reached your storage limit.',
        severity: 'high',
        recoverable: false,
        retryable: false,
        suggestions: [
            'Delete some existing files to free up space',
            'Upgrade your storage plan',
            'Contact support for assistance'
        ]
    },
    'permission-denied': {
        title: 'Permission Denied',
        userMessage: 'You do not have permission to upload files.',
        severity: 'high',
        recoverable: false,
        retryable: false,
        suggestions: [
            'Contact your administrator for access',
            'Make sure you are logged in with the correct account'
        ]
    },

    // File system errors
    'file-read-error': {
        title: 'Cannot Read File',
        userMessage: 'Unable to read the selected file.',
        severity: 'high',
        recoverable: true,
        retryable: false,
        suggestions: [
            'Make sure the file is not corrupted',
            'Try selecting the file again',
            'Choose a different file'
        ]
    },
    'file-access-denied': {
        title: 'File Access Denied',
        userMessage: 'Cannot access the selected file.',
        severity: 'medium',
        recoverable: true,
        retryable: false,
        suggestions: [
            'Make sure the file is not open in another application',
            'Check file permissions',
            'Try copying the file to a different location first'
        ]
    },

    // Generic errors
    'unknown-error': {
        title: 'Unknown Error',
        userMessage: 'An unexpected error occurred.',
        severity: 'medium',
        recoverable: true,
        retryable: true,
        suggestions: [
            'Try the operation again',
            'Refresh the page if the problem persists',
            'Contact support if you continue to experience issues'
        ]
    }
}

/**
 * Processes a raw error into a user-friendly format
 */
export const processError = (
    error: Error | FileError | string,
    context: ErrorContext = {},
    config?: FileUploadConfig
): ProcessedError => {
    const timestamp = new Date()
    const errorId = `error_${timestamp.getTime()}_${Math.random().toString(36).substring(2, 11)}`

    let code: string
    let technicalMessage: string
    let type: ErrorType = 'unknown'

    // Extract error information based on error type
    if (typeof error === 'string') {
        code = 'unknown-error'
        technicalMessage = error
    } else if (error && typeof error === 'object' && 'code' in error && 'type' in error) {
        // FileError from validation
        code = error.code
        technicalMessage = error.message || 'Validation error occurred'
        type = error.type === 'size' ? 'validation' :
            error.type === 'type' ? 'validation' :
                error.type === 'count' ? 'validation' :
                    error.type === 'dimensions' ? 'validation' :
                        error.type === 'network' ? 'network' :
                            'validation'
    } else if (error && typeof error === 'object' && 'code' in error) {
        // Malformed FileError with only code
        code = error.code as string
        technicalMessage = (error as any).message || 'Error occurred'
    } else if (error instanceof Error) {
        // Standard JavaScript Error
        code = error.name.toLowerCase().replace(/error$/, '') || 'unknown-error'
        technicalMessage = error.message

        // Determine error type based on error properties
        if (error.message.includes('network') || error.message.includes('fetch')) {
            type = 'network'
        } else if (error.message.includes('timeout')) {
            type = 'timeout'
        } else if (error.message.includes('permission') || error.message.includes('denied')) {
            type = 'permission'
        } else if (error.message.includes('quota') || error.message.includes('storage')) {
            type = 'quota'
        }
    } else if (error === null || error === undefined) {
        code = 'unknown-error'
        technicalMessage = 'Unknown error occurred'
    } else {
        code = 'unknown-error'
        technicalMessage = 'Unknown error occurred'
    }

    // Get error details from the mapping
    const errorDetails = ERROR_MESSAGES[code] || ERROR_MESSAGES['unknown-error']

    // Create user message with context
    let userMessage = errorDetails.userMessage
    if (context.fileName) {
        userMessage = `${userMessage} (File: ${context.fileName})`
    }

    // Generate suggestions based on context and config
    const suggestions = [...errorDetails.suggestions]
    if (config && context.fileName) {
        if (code === 'file-too-large' && config.validation.maxSize) {
            const maxSizeMB = (config.validation.maxSize / 1024 / 1024).toFixed(1)
            suggestions.unshift(`Maximum file size is ${maxSizeMB} MB`)
        }
        if (code === 'invalid-file-type' && config.validation.allowedTypes.length > 0) {
            suggestions.unshift(`Supported types: ${config.validation.allowedTypes.join(', ')}`)
        }
    }

    // Generate recovery actions
    const actions: ErrorAction[] = []

    if (errorDetails.retryable) {
        actions.push({
            id: 'retry',
            label: config?.labels.retryText || 'Try Again',
            type: 'retry',
            primary: true
        })
    }

    if (errorDetails.recoverable) {
        actions.push({
            id: 'remove',
            label: config?.labels.removeText || 'Remove File',
            type: 'remove'
        })
    }

    actions.push({
        id: 'clear',
        label: 'Clear All',
        type: 'clear'
    })

    if (errorDetails.severity === 'high' || errorDetails.severity === 'critical') {
        actions.push({
            id: 'contact',
            label: 'Contact Support',
            type: 'contact'
        })
    }

    return {
        id: errorId,
        type,
        code,
        title: errorDetails.title,
        message: technicalMessage,
        userMessage,
        technicalMessage,
        severity: errorDetails.severity,
        recoverable: errorDetails.recoverable,
        retryable: errorDetails.retryable,
        context: {
            ...context,
            timestamp,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
        },
        suggestions,
        actions
    }
}

/**
 * Processes multiple errors and groups them by type
 */
export const processErrors = (
    errors: (Error | FileError | string)[],
    context: ErrorContext = {},
    config?: FileUploadConfig
): {
    errors: ProcessedError[]
    summary: {
        total: number
        byType: Record<ErrorType, number>
        bySeverity: Record<ProcessedError['severity'], number>
        retryable: number
        recoverable: number
    }
} => {
    const processedErrors = errors.map(error => processError(error, context, config))

    const summary = {
        total: processedErrors.length,
        byType: {} as Record<ErrorType, number>,
        bySeverity: {} as Record<ProcessedError['severity'], number>,
        retryable: 0,
        recoverable: 0
    }

    processedErrors.forEach(error => {
        // Count by type
        summary.byType[error.type] = (summary.byType[error.type] || 0) + 1

        // Count by severity
        summary.bySeverity[error.severity] = (summary.bySeverity[error.severity] || 0) + 1

        // Count retryable and recoverable
        if (error.retryable) summary.retryable++
        if (error.recoverable) summary.recoverable++
    })

    return {
        errors: processedErrors,
        summary
    }
}

/**
 * Creates a user-friendly error message for display
 */
export const formatErrorForUser = (
    error: ProcessedError,
    includeContext: boolean = true
): string => {
    let message = error.userMessage

    if (includeContext && error.context.fileName) {
        message += ` (${error.context.fileName})`
    }

    if (error.suggestions.length > 0) {
        message += `\n\nSuggestions:\n${error.suggestions.map(s => `• ${s}`).join('\n')}`
    }

    return message
}

/**
 * Determines if an error should trigger an accessibility announcement
 */
export const shouldAnnounceError = (error: ProcessedError): boolean => {
    return error.severity === 'high' || error.severity === 'critical' || !error.recoverable
}

/**
 * Creates an accessibility-friendly error announcement
 */
export const createErrorAnnouncement = (error: ProcessedError): string => {
    const severity = error.severity === 'critical' ? 'Critical error: ' :
        error.severity === 'high' ? 'Error: ' : ''

    return `${severity}${error.title}. ${error.userMessage}`
}

/**
 * Logs error for debugging and monitoring
 */
export const logError = (
    error: ProcessedError,
    additionalContext?: Record<string, any>
): void => {
    const logData = {
        errorId: error.id,
        type: error.type,
        code: error.code,
        severity: error.severity,
        message: error.technicalMessage,
        context: error.context,
        ...additionalContext
    }

    if (error.severity === 'critical') {
        console.error('Critical FileUpload Error:', logData)
    } else if (error.severity === 'high') {
        console.error('FileUpload Error:', logData)
    } else {
        console.warn('FileUpload Warning:', logData)
    }

    // In a real application, you might want to send this to an error tracking service
    // Example: errorTrackingService.captureError(logData)
}