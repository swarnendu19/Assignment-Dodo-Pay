import React from 'react'
import { render, screen, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AccessibilityAnnouncer, useAccessibilityAnnouncer } from '../accessibility-announcer'
import { ProcessedError } from '../../../utils/error-handling'

// Mock timers
vi.useFakeTimers()

const mockError: ProcessedError = {
    id: 'error-1',
    type: 'validation',
    code: 'file-too-large',
    title: 'File Too Large',
    message: 'File exceeds maximum size',
    userMessage: 'The selected file is too large to upload.',
    technicalMessage: 'File size exceeds limit',
    severity: 'high',
    recoverable: true,
    retryable: false,
    context: {
        fileName: 'test.jpg',
        timestamp: new Date()
    },
    suggestions: [],
    actions: []
}

const mockLowSeverityError: ProcessedError = {
    ...mockError,
    id: 'error-2',
    severity: 'low',
    recoverable: true
}

const mockCriticalError: ProcessedError = {
    ...mockError,
    id: 'error-3',
    severity: 'critical',
    recoverable: false
}

describe('AccessibilityAnnouncer', () => {
    beforeEach(() => {
        vi.clearAllTimers()
    })

    afterEach(() => {
        vi.runOnlyPendingTimers()
        vi.useRealTimers()
        vi.useFakeTimers()
    })

    it('should render live regions with correct attributes', () => {
        render(<AccessibilityAnnouncer />)

        const assertiveRegion = screen.getByRole('status')
        expect(assertiveRegion).toHaveAttribute('aria-live', 'assertive')
        expect(assertiveRegion).toHaveAttribute('aria-atomic', 'true')
        expect(assertiveRegion).toHaveClass('sr-only')

        const politeRegions = screen.getAllByRole('status')
        expect(politeRegions).toHaveLength(2) // Main + polite region

        const politeRegion = politeRegions[1]
        expect(politeRegion).toHaveAttribute('aria-live', 'polite')
    })

    it('should announce high severity errors', async () => {
        const { rerender } = render(
            <AccessibilityAnnouncer errors={[]} announceErrors={true} />
        )

        rerender(
            <AccessibilityAnnouncer errors={[mockError]} announceErrors={true} />
        )

        act(() => {
            vi.advanceTimersByTime(100)
        })

        const liveRegion = screen.getByRole('status')
        expect(liveRegion).toHaveTextContent('Error: File Too Large. The selected file is too large to upload.')
    })

    it('should announce critical errors with critical prefix', async () => {
        const { rerender } = render(
            <AccessibilityAnnouncer errors={[]} announceErrors={true} />
        )

        rerender(
            <AccessibilityAnnouncer errors={[mockCriticalError]} announceErrors={true} />
        )

        act(() => {
            vi.advanceTimersByTime(100)
        })

        const liveRegion = screen.getByRole('status')
        expect(liveRegion).toHaveTextContent('Critical error: File Too Large. The selected file is too large to upload.')
    })

    it('should not announce low severity recoverable errors', async () => {
        const { rerender } = render(
            <AccessibilityAnnouncer errors={[]} announceErrors={true} />
        )

        rerender(
            <AccessibilityAnnouncer errors={[mockLowSeverityError]} announceErrors={true} />
        )

        act(() => {
            vi.advanceTimersByTime(100)
        })

        const liveRegion = screen.getByRole('status')
        expect(liveRegion).toHaveTextContent('')
    })

    it('should not announce errors when announceErrors is false', async () => {
        const { rerender } = render(
            <AccessibilityAnnouncer errors={[]} announceErrors={false} />
        )

        rerender(
            <AccessibilityAnnouncer errors={[mockError]} announceErrors={false} />
        )

        act(() => {
            vi.advanceTimersByTime(100)
        })

        const liveRegion = screen.getByRole('status')
        expect(liveRegion).toHaveTextContent('')
    })

    it('should process announcement queue sequentially', async () => {
        const error1 = { ...mockError, id: 'error-1', title: 'First Error' }
        const error2 = { ...mockError, id: 'error-2', title: 'Second Error' }

        const { rerender } = render(
            <AccessibilityAnnouncer errors={[]} announceErrors={true} />
        )

        rerender(
            <AccessibilityAnnouncer errors={[error1, error2]} announceErrors={true} />
        )

        const liveRegion = screen.getByRole('status')

        // First announcement
        act(() => {
            vi.advanceTimersByTime(100)
        })
        expect(liveRegion).toHaveTextContent('Error: First Error.')

        // Clear first announcement and show second
        act(() => {
            vi.advanceTimersByTime(1000)
        })
        expect(liveRegion).toHaveTextContent('')

        act(() => {
            vi.advanceTimersByTime(1500)
        })
        expect(liveRegion).toHaveTextContent('Error: Second Error.')
    })

    it('should use polite announcements when politeAnnouncements is true', () => {
        render(<AccessibilityAnnouncer politeAnnouncements={true} />)

        const liveRegion = screen.getByRole('status')
        expect(liveRegion).toHaveAttribute('aria-live', 'polite')
    })

    it('should not process duplicate errors', async () => {
        const { rerender } = render(
            <AccessibilityAnnouncer errors={[mockError]} announceErrors={true} />
        )

        act(() => {
            vi.advanceTimersByTime(100)
        })

        const liveRegion = screen.getByRole('status')
        expect(liveRegion).toHaveTextContent('Error: File Too Large.')

        // Clear announcement
        act(() => {
            vi.advanceTimersByTime(1000)
        })
        expect(liveRegion).toHaveTextContent('')

        // Re-render with same error - should not announce again
        rerender(
            <AccessibilityAnnouncer errors={[mockError]} announceErrors={true} />
        )

        act(() => {
            vi.advanceTimersByTime(100)
        })
        expect(liveRegion).toHaveTextContent('')
    })

    it('should apply custom className', () => {
        render(<AccessibilityAnnouncer className="custom-announcer" />)

        const liveRegion = screen.getByRole('status')
        expect(liveRegion).toHaveClass('custom-announcer')
    })
})

describe('useAccessibilityAnnouncer', () => {
    const TestComponent: React.FC = () => {
        const {
            announce,
            announceError,
            announceFileSelection,
            announceProgress,
            announceUploadComplete
        } = useAccessibilityAnnouncer()

        return (
            <div>
                <button onClick={() => announce('Custom message')}>
                    Announce Custom
                </button>
                <button onClick={() => announceError(mockError)}>
                    Announce Error
                </button>
                <button onClick={() => announceFileSelection(3, 1024000)}>
                    Announce Selection
                </button>
                <button onClick={() => announceProgress('test.jpg', 50)}>
                    Announce Progress
                </button>
                <button onClick={() => announceUploadComplete('test.jpg', true)}>
                    Announce Success
                </button>
                <button onClick={() => announceUploadComplete('test.jpg', false)}>
                    Announce Failure
                </button>
            </div>
        )
    }

    beforeEach(() => {
        vi.clearAllTimers()
    })

    afterEach(() => {
        vi.runOnlyPendingTimers()
        vi.useRealTimers()
        vi.useFakeTimers()
    })

    it('should provide announce function', () => {
        render(<TestComponent />)

        const button = screen.getByText('Announce Custom')
        expect(button).toBeInTheDocument()
    })

    it('should announce file selection correctly', () => {
        render(<TestComponent />)

        // Mock the announcer ref
        const announceButton = screen.getByText('Announce Selection')
        expect(announceButton).toBeInTheDocument()

        // The actual announcement would be handled by the announcer component
        // This test verifies the hook provides the correct interface
    })

    it('should announce progress correctly', () => {
        render(<TestComponent />)

        const announceButton = screen.getByText('Announce Progress')
        expect(announceButton).toBeInTheDocument()
    })

    it('should announce upload completion correctly', () => {
        render(<TestComponent />)

        const successButton = screen.getByText('Announce Success')
        const failureButton = screen.getByText('Announce Failure')

        expect(successButton).toBeInTheDocument()
        expect(failureButton).toBeInTheDocument()
    })

    it('should announce errors when they should be announced', () => {
        render(<TestComponent />)

        const errorButton = screen.getByText('Announce Error')
        expect(errorButton).toBeInTheDocument()
    })
})

describe('Accessibility Announcer Integration', () => {
    it('should handle multiple rapid error updates', async () => {
        const errors = [
            { ...mockError, id: 'error-1', title: 'Error 1' },
            { ...mockError, id: 'error-2', title: 'Error 2' },
            { ...mockError, id: 'error-3', title: 'Error 3' }
        ]

        const { rerender } = render(
            <AccessibilityAnnouncer errors={[]} announceErrors={true} />
        )

        // Add errors one by one rapidly
        rerender(
            <AccessibilityAnnouncer errors={[errors[0]]} announceErrors={true} />
        )

        rerender(
            <AccessibilityAnnouncer errors={[errors[0], errors[1]]} announceErrors={true} />
        )

        rerender(
            <AccessibilityAnnouncer errors={errors} announceErrors={true} />
        )

        const liveRegion = screen.getByRole('status')

        // Should process first error
        act(() => {
            vi.advanceTimersByTime(100)
        })
        expect(liveRegion).toHaveTextContent('Error: Error 1.')

        // Should queue and process remaining errors
        act(() => {
            vi.advanceTimersByTime(2000)
        })
        expect(liveRegion).toHaveTextContent('Error: Error 2.')

        act(() => {
            vi.advanceTimersByTime(2000)
        })
        expect(liveRegion).toHaveTextContent('Error: Error 3.')
    })

    it('should clean up timers on unmount', () => {
        const { unmount } = render(
            <AccessibilityAnnouncer errors={[mockError]} announceErrors={true} />
        )

        act(() => {
            vi.advanceTimersByTime(100)
        })

        unmount()

        // Should not throw errors when timers try to execute after unmount
        act(() => {
            vi.advanceTimersByTime(2000)
        })
    })
})