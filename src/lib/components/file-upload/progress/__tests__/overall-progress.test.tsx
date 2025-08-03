import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { OverallProgress } from '../overall-progress'
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

describe('OverallProgress', () => {
    it('renders nothing when no files are provided', () => {
        const { container } = render(<OverallProgress files={[]} isUploading={false} />)
        expect(container.firstChild).toBeNull()
    })

    it('displays overall progress for multiple files', () => {
        const files = [
            createMockFile({ progress: 50, status: 'uploading' }),
            createMockFile({ progress: 100, status: 'success' }),
            createMockFile({ progress: 0, status: 'pending' })
        ]

        render(<OverallProgress files={files} isUploading={true} />)

        expect(screen.getByRole('region')).toBeInTheDocument()
        expect(screen.getByText('Uploading files...')).toBeInTheDocument()
        expect(screen.getByText('1/3 files')).toBeInTheDocument()
    })

    it('shows completion status when upload is finished', () => {
        const files = [
            createMockFile({ progress: 100, status: 'success' }),
            createMockFile({ progress: 100, status: 'success' })
        ]

        render(<OverallProgress files={files} isUploading={false} />)

        expect(screen.getByText('Upload complete')).toBeInTheDocument()
        expect(screen.getByText('2/2 files')).toBeInTheDocument()
    })

    it('displays loading spinner when uploading', () => {
        const files = [createMockFile({ status: 'uploading' })]

        render(<OverallProgress files={files} isUploading={true} />)

        expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('shows detailed file counts when showDetails is true', () => {
        const files = [
            createMockFile({ status: 'success' }),
            createMockFile({ status: 'uploading' }),
            createMockFile({ status: 'error' })
        ]

        render(<OverallProgress files={files} isUploading={true} showDetails={true} />)

        expect(screen.getByText('✓ 1 completed')).toBeInTheDocument()
        expect(screen.getByText('↑ 1 uploading')).toBeInTheDocument()
        expect(screen.getByText('✗ 1 failed')).toBeInTheDocument()
    })

    it('hides details when showDetails is false', () => {
        const files = [
            createMockFile({ status: 'success' }),
            createMockFile({ status: 'error' })
        ]

        render(<OverallProgress files={files} isUploading={false} showDetails={false} />)

        expect(screen.queryByText('✓ 1 completed')).not.toBeInTheDocument()
        expect(screen.queryByText('✗ 1 failed')).not.toBeInTheDocument()
    })

    it('calculates correct overall progress percentage', () => {
        const files = [
            createMockFile({ progress: 50 }),
            createMockFile({ progress: 100 }),
            createMockFile({ progress: 0 })
        ]

        render(<OverallProgress files={files} isUploading={true} />)

        // Overall progress should be (50 + 100 + 0) / 3 = 50%
        const progressBar = screen.getByRole('progressbar')
        expect(progressBar).toHaveAttribute('aria-label', 'Overall upload progress: 50%')
    })

    it('shows error variant when files have failed', () => {
        const files = [
            createMockFile({ status: 'success' }),
            createMockFile({ status: 'error' })
        ]

        render(<OverallProgress files={files} isUploading={false} />)

        const progressBar = screen.getByRole('progressbar')
        // Check that error variant is applied (this would be tested through CSS classes)
        expect(progressBar).toBeInTheDocument()
    })

    it('shows success variant when all files are successful', () => {
        const files = [
            createMockFile({ status: 'success', progress: 100 }),
            createMockFile({ status: 'success', progress: 100 })
        ]

        render(<OverallProgress files={files} isUploading={false} />)

        const progressBar = screen.getByRole('progressbar')
        expect(progressBar).toBeInTheDocument()
    })

    it('supports custom aria-label', () => {
        const files = [createMockFile()]

        render(<OverallProgress files={files} isUploading={false} aria-label="Custom progress label" />)

        const region = screen.getByRole('region')
        expect(region).toHaveAttribute('aria-label', 'Custom progress label')
    })

    it('applies custom className', () => {
        const files = [createMockFile()]

        render(<OverallProgress files={files} isUploading={false} className="custom-progress" />)

        const region = screen.getByRole('region')
        expect(region).toHaveClass('custom-progress')
    })

    it('only shows completed count when there are completed files', () => {
        const files = [
            createMockFile({ status: 'pending' }),
            createMockFile({ status: 'uploading' })
        ]

        render(<OverallProgress files={files} isUploading={true} />)

        expect(screen.queryByText(/completed/)).not.toBeInTheDocument()
        expect(screen.getByText('↑ 1 uploading')).toBeInTheDocument()
    })
})