import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { UploadFeedback } from '../upload-feedback'
import type { UploadFile } from '../../file-upload.types'

const createMockFile = (overrides: Partial<UploadFile> = {}): UploadFile => ({
    id: `file-${Math.random()}`,
    file: new File(['content'], 'test.txt', { type: 'text/plain' }),
    status: 'pending',
    progress: 0,
    size: 1024 * 1024, // 1MB
    type: 'text/plain',
    name: 'test.txt',
    lastModified: Date.now(),
    retryCount: 0,
    maxRetries: 3,
    ...overrides
})

describe('UploadFeedback', () => {
    it('renders nothing when no files are provided', () => {
        const { container } = render(<UploadFeedback files={[]} isUploading={false} />)
        expect(container.firstChild).toBeNull()
    })

    it('displays overall progress for multiple files', () => {
        const files = [
            createMockFile({ name: 'file1.txt', progress: 50, status: 'uploading' }),
            createMockFile({ name: 'file2.txt', progress: 100, status: 'success' })
        ]

        render(<UploadFeedback files={files} isUploading={true} />)

        expect(screen.getByText('Uploading files...')).toBeInTheDocument()
        expect(screen.getByText('1/2 files')).toBeInTheDocument()
    })

    it('displays individual file progress', () => {
        const files = [
            createMockFile({
                name: 'document.pdf',
                progress: 75,
                status: 'uploading',
                size: 2 * 1024 * 1024 // 2MB
            })
        ]

        render(<UploadFeedback files={files} isUploading={true} />)

        expect(screen.getByText('document.pdf')).toBeInTheDocument()
        expect(screen.getByText('2.0 MB')).toBeInTheDocument()
    })

    it('shows error message for failed files', () => {
        const files = [
            createMockFile({
                name: 'failed.txt',
                status: 'error',
                error: 'File too large'
            })
        ]

        render(<UploadFeedback files={files} isUploading={false} />)

        expect(screen.getByText('failed.txt')).toBeInTheDocument()
        expect(screen.getByText('File too large')).toBeInTheDocument()
    })

    it('displays retry button for failed files', () => {
        const onRetry = vi.fn()
        const files = [
            createMockFile({
                id: 'failed-file',
                name: 'failed.txt',
                status: 'error'
            })
        ]

        render(<UploadFeedback files={files} isUploading={false} onRetry={onRetry} />)

        const retryButton = screen.getByRole('button', { name: /retry upload for failed.txt/i })
        expect(retryButton).toBeInTheDocument()

        fireEvent.click(retryButton)
        expect(onRetry).toHaveBeenCalledWith('failed-file')
    })

    it('displays remove button for non-uploading files', () => {
        const onRemove = vi.fn()
        const files = [
            createMockFile({
                id: 'completed-file',
                name: 'completed.txt',
                status: 'success'
            })
        ]

        render(<UploadFeedback files={files} isUploading={false} onRemove={onRemove} />)

        const removeButton = screen.getByRole('button', { name: /remove completed.txt/i })
        expect(removeButton).toBeInTheDocument()

        fireEvent.click(removeButton)
        expect(onRemove).toHaveBeenCalledWith('completed-file')
    })

    it('does not show remove button for uploading files', () => {
        const onRemove = vi.fn()
        const files = [
            createMockFile({
                name: 'uploading.txt',
                status: 'uploading'
            })
        ]

        render(<UploadFeedback files={files} isUploading={true} onRemove={onRemove} />)

        expect(screen.queryByRole('button', { name: /remove uploading.txt/i })).not.toBeInTheDocument()
    })

    it('hides overall progress when showOverallProgress is false', () => {
        const files = [
            createMockFile({ status: 'uploading' }),
            createMockFile({ status: 'success' })
        ]

        render(<UploadFeedback files={files} isUploading={true} showOverallProgress={false} />)

        expect(screen.queryByText('Uploading files...')).not.toBeInTheDocument()
    })

    it('hides individual progress when showIndividualProgress is false', () => {
        const files = [
            createMockFile({ name: 'test.txt', status: 'uploading' })
        ]

        render(<UploadFeedback files={files} isUploading={true} showIndividualProgress={false} />)

        expect(screen.queryByText('test.txt')).not.toBeInTheDocument()
    })

    it('hides status indicators when showStatusIndicators is false', () => {
        const files = [
            createMockFile({ name: 'test.txt', status: 'success' })
        ]

        render(<UploadFeedback files={files} isUploading={false} showStatusIndicators={false} enableAccessibilityAnnouncements={false} />)

        // Status indicator should not be present
        expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    it('hides file names when showFileNames is false', () => {
        const files = [
            createMockFile({ name: 'hidden-name.txt', status: 'uploading' })
        ]

        render(<UploadFeedback files={files} isUploading={true} showFileNames={false} />)

        expect(screen.queryByText('hidden-name.txt')).not.toBeInTheDocument()
    })

    it('limits visible files based on maxVisibleFiles', () => {
        const files = Array.from({ length: 5 }, (_, i) =>
            createMockFile({ name: `file${i + 1}.txt` })
        )

        render(<UploadFeedback files={files} isUploading={false} maxVisibleFiles={3} />)

        expect(screen.getByText('file1.txt')).toBeInTheDocument()
        expect(screen.getByText('file2.txt')).toBeInTheDocument()
        expect(screen.getByText('file3.txt')).toBeInTheDocument()
        expect(screen.queryByText('file4.txt')).not.toBeInTheDocument()
        expect(screen.queryByText('file5.txt')).not.toBeInTheDocument()
        expect(screen.getByText('... and 2 more files')).toBeInTheDocument()
    })

    it('shows singular form for one hidden file', () => {
        const files = Array.from({ length: 2 }, (_, i) =>
            createMockFile({ name: `file${i + 1}.txt` })
        )

        render(<UploadFeedback files={files} isUploading={false} maxVisibleFiles={1} />)

        expect(screen.getByText('... and 1 more file')).toBeInTheDocument()
    })

    it('displays completion status correctly', () => {
        const files = [
            createMockFile({ status: 'success' }),
            createMockFile({ status: 'success' })
        ]

        render(<UploadFeedback files={files} isUploading={false} />)

        expect(screen.getByText('Upload complete')).toBeInTheDocument()
        expect(screen.getByText('✓ 2 completed')).toBeInTheDocument()
    })

    it('shows mixed status counts', () => {
        const files = [
            createMockFile({ status: 'success' }),
            createMockFile({ status: 'uploading' }),
            createMockFile({ status: 'error' })
        ]

        render(<UploadFeedback files={files} isUploading={true} />)

        expect(screen.getByText('✓ 1 completed')).toBeInTheDocument()
        expect(screen.getByText('↑ 1 uploading')).toBeInTheDocument()
        expect(screen.getByText('✗ 1 failed')).toBeInTheDocument()
    })

    it('applies custom className', () => {
        const files = [createMockFile()]

        render(<UploadFeedback files={files} isUploading={false} className="custom-feedback" />)

        const container = screen.getByText('test.txt').closest('.custom-feedback')
        expect(container).toBeInTheDocument()
    })

    it('includes accessibility announcer when enabled', () => {
        const files = [createMockFile()]

        render(<UploadFeedback files={files} isUploading={false} enableAccessibilityAnnouncements={true} />)

        // The accessibility announcer creates a hidden live region
        const statusElements = screen.getAllByRole('status')
        const hiddenLiveRegion = statusElements.find(el =>
            el.style.position === 'absolute' && el.style.left === '-10000px'
        )
        expect(hiddenLiveRegion).toBeInTheDocument()
    })

    it('excludes accessibility announcer when disabled', () => {
        const files = [createMockFile()]

        render(<UploadFeedback files={files} isUploading={false} enableAccessibilityAnnouncements={false} />)

        // Should not have the hidden live region (accessibility announcer)
        const statusElements = screen.getAllByRole('status')
        const hiddenLiveRegion = statusElements.find(el =>
            el.style.position === 'absolute' && el.style.left === '-10000px'
        )
        expect(hiddenLiveRegion).toBeUndefined()
    })

    it('shows progress percentage for uploading files', () => {
        const files = [
            createMockFile({
                name: 'uploading.txt',
                status: 'uploading',
                progress: 65
            })
        ]

        render(<UploadFeedback files={files} isUploading={true} />)

        expect(screen.getByText('65%')).toBeInTheDocument()
    })
})