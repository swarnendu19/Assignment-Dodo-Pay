import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FileUploadErrorBoundary, withErrorBoundary } from '../error-boundary'

// Mock console.error to avoid noise in tests
const mockConsoleError = vi.fn()
vi.stubGlobal('console', { ...console, error: mockConsoleError })

// Component that throws an error for testing
const ThrowError: React.FC<{ shouldThrow?: boolean; errorMessage?: string }> = ({
    shouldThrow = false,
    errorMessage = 'Test error'
}) => {
    if (shouldThrow) {
        throw new Error(errorMessage)
    }
    return <div>No error</div>
}

describe('FileUploadErrorBoundary', () => {
    beforeEach(() => {
        mockConsoleError.mockClear()
    })

    it('should render children when there is no error', () => {
        render(
            <FileUploadErrorBoundary>
                <div>Test content</div>
            </FileUploadErrorBoundary>
        )

        expect(screen.getByText('Test content')).toBeInTheDocument()
    })

    it('should catch and display error when child component throws', () => {
        render(
            <FileUploadErrorBoundary>
                <ThrowError shouldThrow={true} errorMessage="Component crashed" />
            </FileUploadErrorBoundary>
        )

        expect(screen.getByText('Something went wrong with the file upload component')).toBeInTheDocument()
        expect(screen.getByText(/An unexpected error occurred/)).toBeInTheDocument()
        expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('should call onError callback when error occurs', () => {
        const onError = vi.fn()

        render(
            <FileUploadErrorBoundary onError={onError}>
                <ThrowError shouldThrow={true} errorMessage="Test error" />
            </FileUploadErrorBoundary>
        )

        expect(onError).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'Test error' }),
            expect.objectContaining({ componentStack: expect.any(String) })
        )
    })

    it('should show technical details when showErrorDetails is true', () => {
        render(
            <FileUploadErrorBoundary showErrorDetails={true}>
                <ThrowError shouldThrow={true} errorMessage="Detailed error" />
            </FileUploadErrorBoundary>
        )

        const detailsElement = screen.getByText('Technical Details')
        expect(detailsElement).toBeInTheDocument()

        // Click to expand details
        fireEvent.click(detailsElement)

        expect(screen.getByText('Detailed error')).toBeInTheDocument()
        expect(screen.getByText(/Error:/)).toBeInTheDocument()
        expect(screen.getByText(/Stack:/)).toBeInTheDocument()
    })

    it('should not show technical details when showErrorDetails is false', () => {
        render(
            <FileUploadErrorBoundary showErrorDetails={false}>
                <ThrowError shouldThrow={true} errorMessage="Hidden error" />
            </FileUploadErrorBoundary>
        )

        expect(screen.queryByText('Technical Details')).not.toBeInTheDocument()
    })

    it('should render custom fallback when provided', () => {
        const customFallback = <div>Custom error message</div>

        render(
            <FileUploadErrorBoundary fallback={customFallback}>
                <ThrowError shouldThrow={true} />
            </FileUploadErrorBoundary>
        )

        expect(screen.getByText('Custom error message')).toBeInTheDocument()
        expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
    })

    it('should reset error state when Try Again button is clicked', () => {
        const { rerender } = render(
            <FileUploadErrorBoundary>
                <ThrowError shouldThrow={true} />
            </FileUploadErrorBoundary>
        )

        expect(screen.getByText('Something went wrong with the file upload component')).toBeInTheDocument()

        const tryAgainButton = screen.getByText('Try Again')
        fireEvent.click(tryAgainButton)

        // Re-render with no error
        rerender(
            <FileUploadErrorBoundary>
                <ThrowError shouldThrow={false} />
            </FileUploadErrorBoundary>
        )

        expect(screen.getByText('No error')).toBeInTheDocument()
        expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
    })

    it('should dismiss error when dismiss button is clicked', () => {
        render(
            <FileUploadErrorBoundary>
                <ThrowError shouldThrow={true} />
            </FileUploadErrorBoundary>
        )

        const dismissButton = screen.getByLabelText('Dismiss error')
        fireEvent.click(dismissButton)

        expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
    })

    it('should have proper accessibility attributes', () => {
        render(
            <FileUploadErrorBoundary>
                <ThrowError shouldThrow={true} />
            </FileUploadErrorBoundary>
        )

        const errorContainer = screen.getByRole('alert')
        expect(errorContainer).toHaveAttribute('aria-live', 'assertive')
        expect(errorContainer).toHaveAttribute('aria-labelledby')
        expect(errorContainer).toHaveAttribute('aria-describedby')
    })

    it('should apply custom className', () => {
        render(
            <FileUploadErrorBoundary className="custom-error-class">
                <ThrowError shouldThrow={true} />
            </FileUploadErrorBoundary>
        )

        const errorContainer = screen.getByRole('alert')
        expect(errorContainer).toHaveClass('custom-error-class')
    })

    it('should log error to console', () => {
        render(
            <FileUploadErrorBoundary>
                <ThrowError shouldThrow={true} errorMessage="Console test error" />
            </FileUploadErrorBoundary>
        )

        expect(mockConsoleError).toHaveBeenCalledWith(
            'FileUpload Error Boundary caught an error:',
            expect.objectContaining({ message: 'Console test error' }),
            expect.objectContaining({ componentStack: expect.any(String) })
        )
    })

    describe('withErrorBoundary HOC', () => {
        it('should wrap component with error boundary', () => {
            const TestComponent = () => <div>Test component</div>
            const WrappedComponent = withErrorBoundary(TestComponent)

            render(<WrappedComponent />)

            expect(screen.getByText('Test component')).toBeInTheDocument()
        })

        it('should catch errors in wrapped component', () => {
            const WrappedThrowError = withErrorBoundary(ThrowError)

            render(<WrappedThrowError shouldThrow={true} />)

            expect(screen.getByText('Something went wrong with the file upload component')).toBeInTheDocument()
        })

        it('should pass error boundary props to wrapper', () => {
            const onError = vi.fn()
            const WrappedThrowError = withErrorBoundary(ThrowError, {
                onError,
                showErrorDetails: true
            })

            render(<WrappedThrowError shouldThrow={true} />)

            expect(onError).toHaveBeenCalled()
            expect(screen.getByText('Technical Details')).toBeInTheDocument()
        })

        it('should set correct display name', () => {
            const TestComponent = () => <div>Test</div>
            TestComponent.displayName = 'TestComponent'

            const WrappedComponent = withErrorBoundary(TestComponent)

            expect(WrappedComponent.displayName).toBe('withErrorBoundary(TestComponent)')
        })

        it('should handle component without display name', () => {
            const TestComponent = () => <div>Test</div>
            const WrappedComponent = withErrorBoundary(TestComponent)

            expect(WrappedComponent.displayName).toBe('withErrorBoundary(TestComponent)')
        })
    })

    describe('Error recovery', () => {
        it('should allow multiple retry attempts', () => {
            const { rerender } = render(
                <FileUploadErrorBoundary>
                    <ThrowError shouldThrow={true} />
                </FileUploadErrorBoundary>
            )

            // First error
            expect(screen.getByText('Something went wrong with the file upload component')).toBeInTheDocument()

            // Try again
            fireEvent.click(screen.getByText('Try Again'))

            // Re-render with different error
            rerender(
                <FileUploadErrorBoundary>
                    <ThrowError shouldThrow={true} errorMessage="Second error" />
                </FileUploadErrorBoundary>
            )

            // Should show error again
            expect(screen.getByText('Something went wrong with the file upload component')).toBeInTheDocument()
        })

        it('should handle refresh page button', () => {
            // Mock window.location.reload
            const mockReload = vi.fn()
            Object.defineProperty(window, 'location', {
                value: { reload: mockReload },
                writable: true
            })

            render(
                <FileUploadErrorBoundary>
                    <ThrowError shouldThrow={true} />
                </FileUploadErrorBoundary>
            )

            fireEvent.click(screen.getByText('Refresh Page'))

            expect(mockReload).toHaveBeenCalled()
        })
    })
})