import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MultiFileUpload } from '../multi-file-upload'
import { FileUploadProvider } from '../../file-upload-context'
import { defaultConfig } from '../../../../config/schema'
import type { FileUploadConfig } from '../../file-upload.types'

// Mock file validation utility
vi.mock('../../../../utils/file-validation', () => ({
    validateFiles: vi.fn().mockResolvedValue({
        validFiles: [],
        rejectedFiles: [],
        totalSize: 0,
        warnings: []
    })
}))

const mockConfig: FileUploadConfig = {
    ...defaultConfig,
    defaults: {
        ...defaultConfig.defaults,
        variant: 'multi-file',
        multiple: true
    },
    features: {
        ...defaultConfig.features,
        multipleFiles: true
    }
}

const renderMultiFileUpload = (props = {}, config = mockConfig) => {
    return render(
        <FileUploadProvider config={config}>
            <MultiFileUpload {...props} />
        </FileUploadProvider>
    )
}

// Helper to create mock files
const createMockFile = (name: string, size: number, type: string) => {
    const file = new File([''], name, { type })
    Object.defineProperty(file, 'size', { value: size })
    return file
}

describe('MultiFileUpload', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('Rendering', () => {
        it('renders upload area with correct elements', () => {
            renderMultiFileUpload()

            expect(screen.getByRole('application')).toBeInTheDocument()
            expect(screen.getByText('Select files')).toBeInTheDocument()
            expect(screen.getByText('or drag and drop files here')).toBeInTheDocument()
        })

        it('renders with custom aria labels', () => {
            renderMultiFileUpload({
                ariaLabel: 'Custom upload area',
                ariaDescribedBy: 'upload-help'
            })

            const uploadArea = screen.getByRole('application')
            expect(uploadArea).toHaveAttribute('aria-label', 'Custom upload area')
            expect(uploadArea).toHaveAttribute('aria-describedby', 'upload-help')
        })

        it('applies custom className and style', () => {
            renderMultiFileUpload({
                className: 'custom-class',
                style: { backgroundColor: 'red' }
            })

            const uploadArea = screen.getByRole('application')
            expect(uploadArea).toHaveClass('custom-class')
            expect(uploadArea).toHaveStyle({ backgroundColor: 'red' })
        })
    })

    describe('File Selection', () => {
        it('handles file input change', async () => {
            const { validateFiles } = await import('../../../../utils/file-validation')
            const mockFiles = [
                createMockFile('test1.txt', 1000, 'text/plain'),
                createMockFile('test2.txt', 2000, 'text/plain')
            ]

            vi.mocked(validateFiles).mockResolvedValue({
                validFiles: mockFiles,
                rejectedFiles: [],
                totalSize: 3000,
                warnings: []
            })

            const onFileSelect = vi.fn()
            renderMultiFileUpload({ onFileSelect })

            const input = screen.getByRole('application').querySelector('input[type="file"]')
            expect(input).toBeInTheDocument()

            // Simulate file selection
            Object.defineProperty(input, 'files', {
                value: mockFiles,
                writable: false
            })

            fireEvent.change(input!)

            await waitFor(() => {
                expect(validateFiles).toHaveBeenCalledWith(
                    mockFiles,
                    expect.objectContaining({
                        validation: expect.objectContaining({
                            allowedTypes: ['*']
                        })
                    }),
                    0
                )
            })
        })

        it('handles drag and drop', async () => {
            const { validateFiles } = await import('../../../../utils/file-validation')
            const mockFiles = [createMockFile('dropped.txt', 1000, 'text/plain')]

            vi.mocked(validateFiles).mockResolvedValue({
                validFiles: mockFiles,
                rejectedFiles: [],
                totalSize: 1000,
                warnings: []
            })

            const onDrop = vi.fn()
            renderMultiFileUpload({ onDrop })

            const uploadArea = screen.getByRole('application')

            // Simulate drag enter
            fireEvent.dragEnter(uploadArea, {
                dataTransfer: { files: mockFiles }
            })

            expect(uploadArea).toHaveClass('border-blue-500', 'bg-blue-50')

            // Simulate drop
            fireEvent.drop(uploadArea, {
                dataTransfer: { files: mockFiles }
            })

            expect(onDrop).toHaveBeenCalled()
            await waitFor(() => {
                expect(validateFiles).toHaveBeenCalledWith(mockFiles, expect.any(Object), 0)
            })
        })
    })

    describe('Bulk Actions', () => {
        it('enables bulk actions by default', async () => {
            const { validateFiles } = await import('../../../../utils/file-validation')
            const mockFiles = [
                createMockFile('file1.txt', 1000, 'text/plain'),
                createMockFile('file2.txt', 2000, 'text/plain')
            ]

            vi.mocked(validateFiles).mockResolvedValue({
                validFiles: mockFiles,
                rejectedFiles: [],
                totalSize: 3000,
                warnings: []
            })

            renderMultiFileUpload()

            const input = screen.getByRole('application').querySelector('input[type="file"]')
            Object.defineProperty(input, 'files', { value: mockFiles })
            fireEvent.change(input!)

            await waitFor(() => {
                expect(screen.getByText('Select All')).toBeInTheDocument()
                expect(screen.getByText('Upload All')).toBeInTheDocument()
                expect(screen.getByText('Remove All')).toBeInTheDocument()
            })
        })

        it('can disable bulk actions', async () => {
            const { validateFiles } = await import('../../../../utils/file-validation')
            const mockFile = createMockFile('test.txt', 1000, 'text/plain')

            vi.mocked(validateFiles).mockResolvedValue({
                validFiles: [mockFile],
                rejectedFiles: [],
                totalSize: 1000,
                warnings: []
            })

            renderMultiFileUpload({ bulkActions: false })

            const input = screen.getByRole('application').querySelector('input[type="file"]')
            Object.defineProperty(input, 'files', { value: [mockFile] })
            fireEvent.change(input!)

            await waitFor(() => {
                expect(screen.getByText('test.txt')).toBeInTheDocument()
            })

            expect(screen.queryByText('Select All')).not.toBeInTheDocument()
            expect(screen.queryByText('Upload All')).not.toBeInTheDocument()
        })
    })

    describe('Keyboard Navigation', () => {
        it('handles arrow key navigation', async () => {
            const user = userEvent.setup()
            const { validateFiles } = await import('../../../../utils/file-validation')
            const mockFiles = [
                createMockFile('file1.txt', 1000, 'text/plain'),
                createMockFile('file2.txt', 2000, 'text/plain')
            ]

            vi.mocked(validateFiles).mockResolvedValue({
                validFiles: mockFiles,
                rejectedFiles: [],
                totalSize: 3000,
                warnings: []
            })

            renderMultiFileUpload()

            const input = screen.getByRole('application').querySelector('input[type="file"]')
            Object.defineProperty(input, 'files', { value: mockFiles })
            fireEvent.change(input!)

            await waitFor(() => {
                expect(screen.getByText('2 files')).toBeInTheDocument()
            })

            const uploadArea = screen.getByRole('application')
            uploadArea.focus()

            // Navigate down
            await user.keyboard('{ArrowDown}')

            // First file should be focused
            const firstFileItem = screen.getAllByRole('option')[0]
            expect(firstFileItem).toHaveClass('ring-2', 'ring-blue-500')
        })
    })

    describe('Layout Options', () => {
        it('renders in list layout by default', async () => {
            const { validateFiles } = await import('../../../../utils/file-validation')
            const mockFile = createMockFile('test.txt', 1000, 'text/plain')

            vi.mocked(validateFiles).mockResolvedValue({
                validFiles: [mockFile],
                rejectedFiles: [],
                totalSize: 1000,
                warnings: []
            })

            renderMultiFileUpload()

            const input = screen.getByRole('application').querySelector('input[type="file"]')
            Object.defineProperty(input, 'files', { value: [mockFile] })
            fireEvent.change(input!)

            await waitFor(() => {
                const fileList = screen.getByRole('listbox')
                expect(fileList).toHaveClass('space-y-2')
                expect(fileList).not.toHaveClass('grid')
            })
        })

        it('renders in grid layout when specified', async () => {
            const { validateFiles } = await import('../../../../utils/file-validation')
            const mockFile = createMockFile('test.txt', 1000, 'text/plain')

            vi.mocked(validateFiles).mockResolvedValue({
                validFiles: [mockFile],
                rejectedFiles: [],
                totalSize: 1000,
                warnings: []
            })

            renderMultiFileUpload({ listLayout: 'grid' })

            const input = screen.getByRole('application').querySelector('input[type="file"]')
            Object.defineProperty(input, 'files', { value: [mockFile] })
            fireEvent.change(input!)

            await waitFor(() => {
                const fileList = screen.getByRole('listbox')
                expect(fileList).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3')
            })
        })
    })

    describe('Accessibility', () => {
        it('provides proper ARIA attributes', () => {
            renderMultiFileUpload()

            const uploadArea = screen.getByRole('application')
            expect(uploadArea).toHaveAttribute('aria-label', 'Multi-file upload area')
            expect(uploadArea).toHaveAttribute('tabindex', '0')
        })

        it('provides keyboard shortcuts help', async () => {
            const { validateFiles } = await import('../../../../utils/file-validation')
            const mockFile = createMockFile('test.txt', 1000, 'text/plain')

            vi.mocked(validateFiles).mockResolvedValue({
                validFiles: [mockFile],
                rejectedFiles: [],
                totalSize: 1000,
                warnings: []
            })

            renderMultiFileUpload()

            const input = screen.getByRole('application').querySelector('input[type="file"]')
            Object.defineProperty(input, 'files', { value: [mockFile] })
            fireEvent.change(input!)

            await waitFor(() => {
                expect(screen.getByText(/Navigate.*Select.*Select All.*Remove/)).toBeInTheDocument()
            })
        })
    })
})