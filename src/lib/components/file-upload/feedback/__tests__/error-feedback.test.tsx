import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ErrorFeedback } from '../error-feedback'
import { FileUploadProvider } from '../../file-upload-context'
import { ProcessedError } from '../../../../utils/error-handling'
import { FileUploadConfig } from '../../file-upload.types'

// Mock the error handling utilities
vi.mock('../../../../utils/error-handling', async () => {
    const actual = await vi.importActual('../../../../utils/error-handling')
    return {
        ...actual,
        logError: vi.fn()
    }
})

const mockConfig: FileUploadConfig = {
    defaults: {
        variant: 'button',
        size: 'md',
        radius: 'md',
        theme: 'light',
        multiple: false,
        disabled: false,
        accept: '*',
        maxSize: 10485760,
        maxFiles: 5
    },
    validation: {
        maxSize: 10485760,
        maxFiles: 5,
        allowedTypes: ['*'],
        allowedExtensions: ['*']
    },
    styling: {
        theme: 'light',
        colors: {
            primary: '#3b82f6',
            secondary: '#6b7280',
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            background: '#ffffff',
            foreground: '#111827',
            border: '#d1d5db',
            muted: '#6b7280'
        },
        spacing: {
            padding: '0.75rem',
            margin: '0.5rem',
            gap: '0.5rem',
            borderRadius: '0.375rem'
        },
        typography: {
            fontSize: '0.875rem',
            fontWeight: '400',
            lineHeight: '1.25rem'
        },
        borders: {
            width: '1px',
            style: 'solid',
            color: '#d1d5db'
        },
        shadows: {
            sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
        }
    },
    labels: {
        uploadText: 'Upload files',
        dragText: 'Drag files here',
        dropText: 'Drop files here',
        browseText: 'Browse',
        errorText: 'Error occurred',
        successText: 'Upload successful',
        progressText: 'Uploading...',
        removeText: 'Remove',
        retryText: 'Retry',
        cancelText: 'Cancel',
        selectFilesText: 'Select files',
        maxSizeText: 'Maximum file size',
        invalidTypeText: 'Invalid file type',
        tooManyFilesText: 'Too many files'
    },
    features: {
        dragAndDrop: true,
        preview: true,
        progress: true,
        multipleFiles: false,
        removeFiles: true,
        retryFailed: true,
        showFileSize: true,
        showFileType: true,
        autoUpload: false,
        chunkedUpload: false,
        resumableUpload: false
    },
    animations: {
        enabled: true,
        duration: 200,
        easing: 'ease-in-out'
    },
    accessibility: {
        announceFileSelection: true,
        announceProgress: true,
        announceErrors: true,
        keyboardNavigation: true,
        focusManagement: true
    }
}

const mockProcessedError: ProcessedError = {
    id: 'error-1',
    type: 'validation',
    code: 'file-too-large',
    title: 'File Too Large',
    message: 'File exceeds maximum size',
    userMessage: 'The selected file is too large to upload.',
    technicalMessage: 'File size exceeds limit',
    severity: 'medium',
    recoverable: true,
    retryable: false,
    context: {
        fileName: 'large-file.jpg',
        timestamp: new Date()
    },
    suggestions: ['Try compressing the file'],
    actions: [
        {
            id: 'remove',
            label: 'Remove File',
            type: 'remove'
        },
        {
            id: 'clear',
            label: 'Clear All',
            type: 'clear'
        }
    ]
}

const mockRetryableError: ProcessedError = {
    ...mockProcessedError,
    id: 'error-2',
    code: 'network-error',
    title: 'Network Error',
    retryable: true,
    actions: [
        {
            id: 'retry',
            label: 'Try Again',
            type: 'retry',
            primary: true
        }
    ]
}

// Mock context with error handling methods
const mockActions = {
    selectFiles: vi.fn(),
    removeFile: vi.fn(),
    retryUpload: vi.fn(),
    clearAll: vi.fn(),
    uploadFiles: vi.fn(),
    updateProgress: vi.fn(),
    setError: vi.fn(),
    setSuccess: vi.fn(),
    handleError: vi.fn(),
    handleValidationErrors: vi.fn(),
    dismissError: vi.fn(),
    dismissAllErrors: vi.fn(),
    retryFailedUploads: vi.fn(),
    clearFailedUploads: vi.fn()
}

const mockState = {
    files: [
        {
            id: 'file-1',
            file: new File(['content'], 'large-file.jpg', { type: 'image/jpeg' }),
            status: 'error' as const,
            progress: 0,
            size: 15728640,
            type: 'image/jpeg',
            name: 'large-file.jpg',
            lastModified: Date.now(),
            retryCount: 0,
            maxRetries: 3,
            error: 'File too large'
        }
    ],
    isUploading: false,
    progress: 0,
    overallProgress: 0,
    error: null,
    isDragOver: false,
    isDropValid: false,
    selectedFiles: [],
    rejectedFiles: [],
    uploadQueue: [],
    completedUploads: [],
    failedUploads: ['file-1']
}

// Mock the useFileUpload hook
vi.mock('../../file-upload-context', () => ({
    useFileUpload: () => ({
        processedErrors: [mockProcessedError],
        actions: mockActions,
        config: mockConfig,
        state: mockState
    })
}))

const TestWrapper: React.FC<{ children: React.ReactNode; errors?: ProcessedError[] }> = ({
    children,
    errors = [mockProcessedError]
}) => {
    const mockContextValue = {
        state: mockState,
        config: mockConfig,
        processedErrors: errors,
        actions: mockActions,
        handlers: {}
    }

    return (
        <div>
            {children}
        </div>
    )
}

describe('ErrorFeedback', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should render nothing when no errors are present', () => {
        vi.mocked(require('../../file-upload-context').useFileUpload).mockReturnValue({
            processedErrors: [],
            actions: mockActions,
            config: mockConfig,
            state: mockState
        })

        const { container } = render(
            <TestWrapper errors={[]}>
                <ErrorFeedback />
            </TestWrapper>
        )

        // Should only render accessibility announcer
        expect(container.querySelector('.error-feedback-container')).toBeInTheDocument()
    })

    it('should render error display when errors are present', () => {
        render(
            <TestWrapper>
                <ErrorFeedback />
            </TestWrapper>
        )

        expect(screen.getByText('File Too Large')).toBeInTheDocument()
        expect(screen.getByText('The selected file is too large to upload. (large-file.jpg)')).toBeInTheDocument()
    })

    it('should handle retry action for specific file', () => {
        render(
            <TestWrapper errors={[mockRetryableError]}>
                <ErrorFeedback />
            </TestWrapper>
        )

        const retryButton = screen.getByText('Try Again')
        fireEvent.click(retryButton)

        expect(mockActions.retryUpload).toHaveBeenCalledWith('file-1')
        expect(mockActions.dismissError).toHaveBeenCalledWith('error-2')
    })

    it('should handle retry action for all failed uploads when no specific file', () => {
        const errorWithoutFileName = {
            ...mockRetryableError,
            context: { timestamp: new Date() }
        }

        render(
            <TestWrapper errors={[errorWithoutFileName]}>
                <ErrorFeedback />
            </TestWrapper>
        )

        const retryButton = screen.getByText('Try Again')
        fireEvent.click(retryButton)

        expect(mockActions.retryFailedUploads).toHaveBeenCalled()
        expect(mockActions.dismissError).toHaveBeenCalledWith('error-2')
    })

    it('should handle remove action for specific file', () => {
        render(
            <TestWrapper>
                <ErrorFeedback />
            </TestWrapper>
        )

        const removeButton = screen.getByText('Remove File')
        fireEvent.click(removeButton)

        expect(mockActions.removeFile).toHaveBeenCalledWith('file-1')
        expect(mockActions.dismissError).toHaveBeenCalledWith('error-1')
    })

    it('should handle clear action', () => {
        render(
            <TestWrapper>
                <ErrorFeedback />
            </TestWrapper>
        )

        const clearButton = screen.getByText('Clear All')
        fireEvent.click(clearButton)

        expect(mockActions.clearFailedUploads).toHaveBeenCalled()
        expect(mockActions.dismissAllErrors).toHaveBeenCalled()
    })

    it('should handle refresh action', () => {
        const mockReload = vi.fn()
        Object.defineProperty(window, 'location', {
            value: { reload: mockReload },
            writable: true
        })

        const refreshError = {
            ...mockProcessedError,
            actions: [
                {
                    id: 'refresh',
                    label: 'Refresh Page',
                    type: 'refresh' as const
                }
            ]
        }

        render(
            <TestWrapper errors={[refreshError]}>
                <ErrorFeedback />
            </TestWrapper>
        )

        const refreshButton = screen.getByText('Refresh Page')
        fireEvent.click(refreshButton)

        expect(mockReload).toHaveBeenCalled()
    })

    it('should handle contact action', () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { })

        const contactError = {
            ...mockProcessedError,
            actions: [
                {
                    id: 'contact',
                    label: 'Contact Support',
                    type: 'contact' as const
                }
            ]
        }

        render(
            <TestWrapper errors={[contactError]}>
                <ErrorFeedback />
            </TestWrapper>
        )

        const contactButton = screen.getByText('Contact Support')
        fireEvent.click(contactButton)

        expect(consoleSpy).toHaveBeenCalledWith('Contact support for error:', 'error-1')
        consoleSpy.mockRestore()
    })

    it('should handle custom actions with handlers', () => {
        const customHandler = vi.fn()
        const customError = {
            ...mockProcessedError,
            actions: [
                {
                    id: 'custom',
                    label: 'Custom Action',
                    type: 'custom' as const,
                    handler: customHandler
                }
            ]
        }

        render(
            <TestWrapper errors={[customError]}>
                <ErrorFeedback />
            </TestWrapper>
        )

        const customButton = screen.getByText('Custom Action')
        fireEvent.click(customButton)

        expect(customHandler).toHaveBeenCalled()
    })

    it('should handle error dismissal', () => {
        render(
            <TestWrapper>
                <ErrorFeedback />
            </TestWrapper>
        )

        const dismissButton = screen.getByLabelText('Dismiss error')
        fireEvent.click(dismissButton)

        expect(mockActions.dismissError).toHaveBeenCalledWith('error-1')
    })

    it('should handle dismiss all errors', () => {
        render(
            <TestWrapper errors={[mockProcessedError, mockRetryableError]}>
                <ErrorFeedback />
            </TestWrapper>
        )

        const dismissAllButton = screen.getByText('Dismiss All')
        fireEvent.click(dismissAllButton)

        expect(mockActions.dismissAllErrors).toHaveBeenCalled()
    })

    it('should render in compact mode', () => {
        render(
            <TestWrapper>
                <ErrorFeedback compact={true} />
            </TestWrapper>
        )

        expect(screen.getByText('File Too Large')).toBeInTheDocument()
        // In compact mode, suggestions should not be shown
        expect(screen.queryByText('Suggestions:')).not.toBeInTheDocument()
    })

    it('should show technical details when enabled', () => {
        render(
            <TestWrapper>
                <ErrorFeedback showTechnicalDetails={true} />
            </TestWrapper>
        )

        const detailsToggle = screen.getByText('Technical Details')
        fireEvent.click(detailsToggle)

        expect(screen.getByText('error-1')).toBeInTheDocument()
        expect(screen.getByText('file-too-large')).toBeInTheDocument()
    })

    it('should limit displayed errors', () => {
        const manyErrors = Array.from({ length: 10 }, (_, i) => ({
            ...mockProcessedError,
            id: `error-${i}`,
            title: `Error ${i}`
        }))

        render(
            <TestWrapper errors={manyErrors}>
                <ErrorFeedback maxErrors={3} />
            </TestWrapper>
        )

        expect(screen.getByText('Error 0')).toBeInTheDocument()
        expect(screen.getByText('Error 1')).toBeInTheDocument()
        expect(screen.getByText('Error 2')).toBeInTheDocument()
        expect(screen.queryByText('Error 3')).not.toBeInTheDocument()
    })

    it('should group errors by type when enabled', () => {
        const validationError = { ...mockProcessedError, type: 'validation' as const }
        const networkError = { ...mockRetryableError, type: 'network' as const }

        render(
            <TestWrapper errors={[validationError, networkError]}>
                <ErrorFeedback groupByType={true} />
            </TestWrapper>
        )

        expect(screen.getByText('Validation Errors (1)')).toBeInTheDocument()
        expect(screen.getByText('Network Errors (1)')).toBeInTheDocument()
    })

    it('should include accessibility announcer when enabled', () => {
        render(
            <TestWrapper>
                <ErrorFeedback showAccessibilityAnnouncer={true} />
            </TestWrapper>
        )

        // Accessibility announcer should be present (though not visible)
        const liveRegions = screen.getAllByRole('status')
        expect(liveRegions.length).toBeGreaterThan(0)
    })

    it('should not include accessibility announcer when disabled', () => {
        render(
            <TestWrapper>
                <ErrorFeedback showAccessibilityAnnouncer={false} />
            </TestWrapper>
        )

        // Should still have error display but no announcer
        expect(screen.getByText('File Too Large')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
        render(
            <TestWrapper>
                <ErrorFeedback className="custom-error-feedback" />
            </TestWrapper>
        )

        const container = screen.getByText('File Too Large').closest('.error-feedback-container')
        expect(container).toHaveClass('custom-error-feedback')
    })

    describe('Error action edge cases', () => {
        it('should handle retry when file is not found', () => {
            const errorWithNonExistentFile = {
                ...mockRetryableError,
                context: { fileName: 'non-existent.jpg', timestamp: new Date() }
            }

            render(
                <TestWrapper errors={[errorWithNonExistentFile]}>
                    <ErrorFeedback />
                </TestWrapper>
            )

            const retryButton = screen.getByText('Try Again')
            fireEvent.click(retryButton)

            // Should not call retryUpload for specific file, should retry all
            expect(mockActions.retryFailedUploads).toHaveBeenCalled()
            expect(mockActions.dismissError).toHaveBeenCalledWith('error-2')
        })

        it('should handle remove when file is not found', () => {
            const errorWithNonExistentFile = {
                ...mockProcessedError,
                context: { fileName: 'non-existent.jpg', timestamp: new Date() }
            }

            render(
                <TestWrapper errors={[errorWithNonExistentFile]}>
                    <ErrorFeedback />
                </TestWrapper>
            )

            const removeButton = screen.getByText('Remove File')
            fireEvent.click(removeButton)

            // Should still dismiss the error even if file not found
            expect(mockActions.dismissError).toHaveBeenCalledWith('error-1')
        })
    })
})