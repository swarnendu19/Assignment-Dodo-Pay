import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AccessibilityAnnouncer } from '../accessibility-announcer'
import type { UploadFile } from '../../file-upload.types'

const createMockFile = (overrides: Partial<UploadFile> = {}): UploadFile => ({
    id: `file-${Math.random()}`,
    file: new File(['content'], 'test.txt', { type: 'text/plain' }),
    status: 'pending',
    progress: 0,
    size: 1024,
    type: 'text/plain',
    name: 'test.txt',
    lastModified: Date.now(),
    retryCount: 0,
    maxRetries: 3,
    ...overrides
})

describe('AccessibilityAnnouncer', () => {
    it('renders a live region with proper attributes', () => {
        render(<AccessibilityAnnouncer files={[]} isUploading={false} />)

        const liveRegion = screen.getByRole('status', { hidden: true })
        expect(liveRegion).toBeInTheDocument()
        expect(liveRegion).toHaveAttribute('aria-live', 'polite')
        expect(liveRegion).toHaveAttribute('aria-atomic', 'true')
    })

    it('is visually hidden but accessible to screen readers', () => {
        render(<AccessibilityAnnouncer files={[]} isUploading={false} />)

        const liveRegion = screen.getByRole('status', { hidden: true })
        expect(liveRegion).toHaveStyle({
            position: 'absolute',
            left: '-10000px',
            width: '1px',
            height: '1px',
            overflow: 'hidden'
        })
    })

    it('applies custom className when provided', () => {
        render(<AccessibilityAnnouncer files={[]} isUploading={false} className="custom-announcer" />)

        const liveRegion = screen.getByRole('status', { hidden: true })
        expect(liveRegion).toHaveClass('custom-announcer')
    })

    it('renders with default props', () => {
        const files = [createMockFile({ name: 'test.txt' })]

        render(<AccessibilityAnnouncer files={files} isUploading={false} />)

        const liveRegion = screen.getByRole('status', { hidden: true })
        expect(liveRegion).toBeInTheDocument()
    })

    it('accepts announceProgress prop', () => {
        const files = [createMockFile()]

        render(<AccessibilityAnnouncer files={files} isUploading={false} announceProgress={false} />)

        const liveRegion = screen.getByRole('status', { hidden: true })
        expect(liveRegion).toBeInTheDocument()
    })

    it('accepts announceStatus prop', () => {
        const files = [createMockFile()]

        render(<AccessibilityAnnouncer files={files} isUploading={false} announceStatus={false} />)

        const liveRegion = screen.getByRole('status', { hidden: true })
        expect(liveRegion).toBeInTheDocument()
    })

    it('accepts announceErrors prop', () => {
        const files = [createMockFile()]

        render(<AccessibilityAnnouncer files={files} isUploading={false} announceErrors={false} />)

        const liveRegion = screen.getByRole('status', { hidden: true })
        expect(liveRegion).toBeInTheDocument()
    })

    it('handles empty files array', () => {
        render(<AccessibilityAnnouncer files={[]} isUploading={false} />)

        const liveRegion = screen.getByRole('status', { hidden: true })
        expect(liveRegion).toBeInTheDocument()
        expect(liveRegion).toHaveTextContent('')
    })

    it('handles multiple files', () => {
        const files = [
            createMockFile({ name: 'file1.txt' }),
            createMockFile({ name: 'file2.txt' })
        ]

        render(<AccessibilityAnnouncer files={files} isUploading={false} />)

        const liveRegion = screen.getByRole('status', { hidden: true })
        expect(liveRegion).toBeInTheDocument()
    })

    it('handles files with different statuses', () => {
        const files = [
            createMockFile({ status: 'success' }),
            createMockFile({ status: 'error' }),
            createMockFile({ status: 'uploading' })
        ]

        render(<AccessibilityAnnouncer files={files} isUploading={true} />)

        const liveRegion = screen.getByRole('status', { hidden: true })
        expect(liveRegion).toBeInTheDocument()
    })
})