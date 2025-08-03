import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ErrorDisplay } from '../error-display'
import { ProcessedError, ErrorAction } from '../../../utils/error-handling'

const mockProcessedError: ProcessedError = {
    id: 'error-1',
    type: 'validation',
    code: 'file-too-large',
    title: 'File Too Large',
    message: 'File exceeds maximum size',
    userMessage: 'The selected file is too large to upload.',
    technicalMessage: 'File size 15MB exceeds limit of 10MB',
    severity: 'medium',
    recoverable: true,
    retryable: false,
    context: {
        fileName: 'large-file.jpg',
        fileSize: 15728640,
        timestamp: new Date('2023-01-01T12:00:00Z')
    },
    suggestions: [
        'Try compressing the file before uploading',
        'Choose a smaller file'
    ],
    actions: [
        {
            id: 'remove',
            label: 'Remove File',
            type: 'remove',
            primary: false
        },
        {
            id: 'clear',
            label: 'Clear All',
            type: 'clear',
            primary: false
        }
    ]
}

const mockCriticalError: ProcessedError = {
    ...mockProcessedError,
    id: 'error-2',
    type: 'network',
    code: 'server-error',
    title: 'Server Error',
    userMessage: 'The server encountered an error.',
    severity: 'critical',
    retryable: true,
    actions: [
        {
            id: 'retry',
            label: 'Try Again',
            type: 'retry',
            primary: true
        },
        {
            id: 'contact',
            label: 'Contact Support',
            type: 'contact',
            primary: false
        }
    ]
}

describe('ErrorDisplay', () => {
    const mockOnAction = vi.fn()
    const mockOnDismiss = vi.fn()
    const mockOnDismissAll = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should render nothing when no errors are provided', () => {
        const { container } = render(
            <ErrorDisplay
                errors={[]}
                onAction={mockOnAction}
                onDismiss={mockOnDismiss}
            />
        )

        expect(container.firstChild).toBeNull()
    })

    it('should render single error correctly', () => {
        render(
            <ErrorDisplay
                errors={[mockProcessedError]}
                onAction={mockOnAction}
                onDismiss={mockOnDismiss}
            />
        )

        expect(screen.getByText('File Too Large')).toBeInTheDocument()
        expect(screen.getByText('The selected file is too large to upload. (large-file.jpg)')).toBeInTheDocument()
        expect(screen.getByText('Suggestions:')).toBeInTheDocument()
        expect(screen.getByText('Try compressing the file before uploading')).toBeInTheDocument()
        expect(screen.getByText('Choose a smaller file')).toBeInTheDocument()
    })

    it('should render multiple errors with header', () => {
        render(
            <ErrorDisplay
                errors={[mockProcessedError, mockCriticalError]}
                onAction={mockOnAction}
                onDismiss={mockOnDismiss}
                onDismissAll={mockOnDismissAll}
            />
        )

        expect(screen.getByText('2 Errors Occurred')).toBeInTheDocument()
        expect(screen.getByText('Dismiss All')).toBeInTheDocument()
        expect(screen.getByText('File Too Large')).toBeInTheDocument()
        expect(screen.getByText('Server Error')).toBeInTheDocument()
    })

    it('should handle error action clicks', () => {
        render(
            <ErrorDisplay
                errors={[mockProcessedError]}
                onAction={mockOnAction}
                onDismiss={mockOnDismiss}
            />
        )

        const removeButton = screen.getByText('Remove File')
        fireEvent.click(removeButton)

        expect(mockOnAction).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'remove',
                type: 'remove',
                label: 'Remove File'
            }),
            mockProcessedError
        )
    })

    it('should handle error dismissal', () => {
        render(
            <ErrorDisplay
                errors={[mockProcessedError]}
                onAction={mockOnAction}
                onDismiss={mockOnDismiss}
            />
        )

        const dismissButton = screen.getByLabelText('Dismiss error')
        fireEvent.click(dismissButton)

        expect(mockOnDismiss).toHaveBeenCalledWith('error-1')
    })

    it('should handle dismiss all', () => {
        render(
            <ErrorDisplay
                errors={[mockProcessedError, mockCriticalError]}
                onAction={mockOnAction}
                onDismiss={mockOnDismiss}
                onDismissAll={mockOnDismissAll}
            />
        )

        const dismissAllButton = screen.getByText('Dismiss All')
        fireEvent.click(dismissAllButton)

        expect(mockOnDismissAll).toHaveBeenCalled()
    })

    it('should render in compact mode', () => {
        render(
            <ErrorDisplay
                errors={[mockProcessedError]}
                onAction={mockOnAction}
                compact={true}
            />
        )

        // In compact mode, suggestions should not be shown
        expect(screen.queryByText('Suggestions:')).not.toBeInTheDocument()
        expect(screen.getByText('File Too Large')).toBeInTheDocument()
    })

    it('should show technical details when enabled', () => {
        render(
            <ErrorDisplay
                errors={[mockProcessedError]}
                onAction={mockOnAction}
                showTechnicalDetails={true}
            />
        )

        const detailsToggle = screen.getByText('Technical Details')
        expect(detailsToggle).toBeInTheDocument()

        fireEvent.click(detailsToggle)

        expect(screen.getByText('error-1')).toBeInTheDocument()
        expect(screen.getByText('file-too-large')).toBeInTheDocument()
        expect(screen.getByText('validation')).toBeInTheDocument()
    })

    it('should limit displayed errors based on maxErrors', () => {
        const manyErrors = Array.from({ length: 10 }, (_, i) => ({
            ...mockProcessedError,
            id: `error-${i}`,
            title: `Error ${i}`
        }))

        render(
            <ErrorDisplay
                errors={manyErrors}
                onAction={mockOnAction}
                maxErrors={3}
            />
        )

        expect(screen.getByText('Error 0')).toBeInTheDocument()
        expect(screen.getByText('Error 1')).toBeInTheDocument()
        expect(screen.getByText('Error 2')).toBeInTheDocument()
        expect(screen.queryByText('Error 3')).not.toBeInTheDocument()
        expect(screen.getByText('Showing 3 of 10 errors')).toBeInTheDocument()
    })

    it('should group errors by type when enabled', () => {
        const validationError = { ...mockProcessedError, type: 'validation' as const }
        const networkError = { ...mockCriticalError, type: 'network' as const }

        render(
            <ErrorDisplay
                errors={[validationError, networkError]}
                onAction={mockOnAction}
                groupByType={true}
            />
        )

        expect(screen.getByText('Validation Errors (1)')).toBeInTheDocument()
        expect(screen.getByText('Network Errors (1)')).toBeInTheDocument()
    })

    it('should render different severity icons', () => {
        const lowError = { ...mockProcessedError, severity: 'low' as const }
        const highError = { ...mockProcessedError, severity: 'high' as const }
        const criticalError = { ...mockProcessedError, severity: 'critical' as const }

        render(
            <ErrorDisplay
                errors={[lowError, highError, criticalError]}
                onAction={mockOnAction}
            />
        )

        // Check that different severity classes are applied
        const errorContainers = screen.getAllByRole('alert')
        expect(errorContainers).toHaveLength(3)
    })

    it('should handle disabled actions', () => {
        const errorWithDisabledAction: ProcessedError = {
            ...mockProcessedError,
            actions: [
                {
                    id: 'retry',
                    label: 'Try Again',
                    type: 'retry',
                    disabled: true,
                    primary: true
                }
            ]
        }

        render(
            <ErrorDisplay
                errors={[errorWithDisabledAction]}
                onAction={mockOnAction}
            />
        )

        const retryButton = screen.getByText('Try Again')
        expect(retryButton).toBeDisabled()

        fireEvent.click(retryButton)
        expect(mockOnAction).not.toHaveBeenCalled()
    })

    it('should handle custom action handlers', () => {
        const customHandler = vi.fn()
        const errorWithCustomAction: ProcessedError = {
            ...mockProcessedError,
            actions: [
                {
                    id: 'custom',
                    label: 'Custom Action',
                    type: 'custom',
                    handler: customHandler
                }
            ]
        }

        render(
            <ErrorDisplay
                errors={[errorWithCustomAction]}
                onAction={mockOnAction}
            />
        )

        const customButton = screen.getByText('Custom Action')
        fireEvent.click(customButton)

        expect(customHandler).toHaveBeenCalled()
        expect(mockOnAction).not.toHaveBeenCalled()
    })

    it('should have proper accessibility attributes', () => {
        render(
            <ErrorDisplay
                errors={[mockProcessedError]}
                onAction={mockOnAction}
                onDismiss={mockOnDismiss}
            />
        )

        const errorAlert = screen.getByRole('alert')
        expect(errorAlert).toHaveAttribute('aria-live', 'polite')
        expect(errorAlert).toHaveAttribute('aria-atomic', 'true')
        expect(errorAlert).toHaveAttribute('aria-labelledby')
        expect(errorAlert).toHaveAttribute('aria-describedby')

        const actionButton = screen.getByText('Remove File')
        expect(actionButton).toHaveAttribute('aria-label', 'Remove File for large-file.jpg')
    })

    it('should apply custom className', () => {
        render(
            <ErrorDisplay
                errors={[mockProcessedError]}
                onAction={mockOnAction}
                className="custom-error-display"
            />
        )

        const container = screen.getByRole('region')
        expect(container).toHaveClass('custom-error-display')
    })

    describe('Error severity styling', () => {
        it('should apply correct classes for critical errors', () => {
            render(
                <ErrorDisplay
                    errors={[{ ...mockProcessedError, severity: 'critical' }]}
                    onAction={mockOnAction}
                />
            )

            const errorContainer = screen.getByRole('alert')
            expect(errorContainer).toHaveClass('border-red-300', 'bg-red-50', 'text-red-900')
        })

        it('should apply correct classes for high severity errors', () => {
            render(
                <ErrorDisplay
                    errors={[{ ...mockProcessedError, severity: 'high' }]}
                    onAction={mockOnAction}
                />
            )

            const errorContainer = screen.getByRole('alert')
            expect(errorContainer).toHaveClass('border-red-200', 'bg-red-50', 'text-red-800')
        })

        it('should apply correct classes for medium severity errors', () => {
            render(
                <ErrorDisplay
                    errors={[{ ...mockProcessedError, severity: 'medium' }]}
                    onAction={mockOnAction}
                />
            )

            const errorContainer = screen.getByRole('alert')
            expect(errorContainer).toHaveClass('border-orange-200', 'bg-orange-50', 'text-orange-800')
        })

        it('should apply correct classes for low severity errors', () => {
            render(
                <ErrorDisplay
                    errors={[{ ...mockProcessedError, severity: 'low' }]}
                    onAction={mockOnAction}
                />
            )

            const errorContainer = screen.getByRole('alert')
            expect(errorContainer).toHaveClass('border-blue-200', 'bg-blue-50', 'text-blue-800')
        })
    })
})