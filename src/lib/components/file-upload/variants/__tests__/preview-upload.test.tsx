import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { PreviewUpload } from '../preview-upload'
import { FileUploadProvider } from '../../file-upload-context'
import type { FileUploadConfig } from '../../file-upload.types'

// Mock the file validation utility
vi.mock('../../../../utils/file-validation', () => ({
    validateFiles: vi.fn(),
    formatFileSize: vi.fn((bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }),
    isImageFile: vi.fn((file: File) => file.type.startsWith('image/'))
}))

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockCreateObjectURL = vi.fn()
const mockRevokeObjectURL = vi.fn()
Object.defineProperty(window.URL, 'createObjectURL', {
    value: mockCreateObjectURL,
    writable: true
})
Object.defineProperty(window.URL, 'revokeObjectURL', {
    value: mockRevokeObjectURL,
    writable: true
})

// Mock canvas for thumbnail generation
const mockCanvas = {
    getContext: vi.fn(() => ({
        drawImage: vi.fn(),
    })),
    toDataURL: vi.fn(() => 'data:image/jpeg;base64,mock-thumbnail'),
    width: 0,
    height: 0
}

Object.defineProperty(document, 'createElement', {
    value: vi.fn((tagName: string) => {
        if (tagName === 'canvas') {
            return mockCanvas
        }
        return document.createElement(tagName)
    }),
    writable: true
})

// Mock Image constructor
class MockImage {
    onload: (() => void) | null = null
    onerror: (() => void) | null = null
    src = ''
    width = 100
    height = 100

    constructor() {
        setTimeout(() => {
            if (this.onload) {
                this.onload()
            }
        }, 0)
    }
}

Object.defineProperty(window, 'Image', {
    value: MockImage,
    writable: true
})

const defaultConfig: FileUploadConfig = {
    defaults: {
        variant: 'preview',
        size: 'md',
        radius: 'md',
        theme: 'light',
        multiple: true,
        disabled: false,
        accept: '*',
        maxSize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5
    },
    validation: {
        maxSize: 10 * 1024 * 1024,
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
            padding: '0.5rem',
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
        uploadText: 'Upload',
        dragText: 'Drag files here',
        dropText: 'Drop files here',
        browseText: 'Browse',
        errorText: 'Error',
        successText: 'Success',
        progressText: 'Uploading...',
        removeText: 'Remove',
        retryText: 'Retry',
        cancelText: 'Cancel',
        selectFilesText: 'Select Files',
        maxSizeText: 'Max size exceeded',
        invalidTypeText: 'Invalid file type',
        tooManyFilesText: 'Too many files'
    },
    features: {
        dragAndDrop: true,
        preview: true,
        progress: true,
        multipleFiles: true,
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

// Helper function to create mock files
const createMockFile = (name: string, size: number, type: string): File => {
    const file = new File(['mock content'], name, { type })
    Object.defineProperty(file, 'size', { value: size })
    return file
}

// Helper function to render component with provider
const renderWithProvider = (props = {}) => {
    return render(
        <FileUploadProvider config={defaultConfig}>
            <PreviewUpload {...props} />
        </FileUploadProvider>
    )
}

describe('PreviewUpload', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockCreateObjectURL.mockReturnValue('blob:mock-url')

        // Mock validateFiles to return valid files by default
        const { validateFiles } = require('../../../../utils/file-validation')
        validateFiles.mockResolvedValue({
            validFiles: [],
            rejectedFiles: [],
            totalSize: 0,
            warnings: []
        })
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('Basic Rendering', () => {
        it('renders upload button with default text', () => {
            renderWithProvider()
            expect(screen.getByRole('button', { name: /select files/i })).toBeInTheDocument()
        })

        it('renders with custom button text', () => {
            renderWithProvider({ children: 'Custom Upload Text' })
            expect(screen.getByRole('button', { name: /select files/i })).toHaveTextContent('Custom Upload Text')
        })

        it('renders hidden file input', () => {
            renderWithProvider()
            const fileInput = document.querySelector('input[type="file"]')
            expect(fileInput).toBeInTheDocument()
            expect(fileInput).toHaveClass('sr-only')
        })

        it('applies custom className', () => {
            renderWithProvider({ className: 'custom-class' })
            expect(document.querySelector('.file-upload--preview')).toHaveClass('custom-class')
        })
    })

    describe('File Selection', () => {
        it('opens file dialog when button is clicked', async () => {
            const user = userEvent.setup()
            renderWithProvider()

            const button = screen.getByRole('button', { name: /select files/i })
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
            const clickSpy = vi.spyOn(fileInput, 'click')

            await user.click(button)
            expect(clickSpy).toHaveBeenCalled()
        })

        it('calls onFileSelect when files are selected', async () => {
            const onFileSelect = vi.fn()
            const mockFiles = [createMockFile('test.jpg', 1024, 'image/jpeg')]

            const { validateFiles } = require('../../../../../utils/file-validation')
            validateFiles.mockResolvedValue({
                validFiles: mockFiles,
                rejectedFiles: [],
                totalSize: 1024,
                warnings: []
            })

            renderWithProvider({ onFileSelect })

            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

            await act(async () => {
                fireEvent.change(fileInput, { target: { files: mockFiles } })
            })

            await waitFor(() => {
                expect(onFileSelect).toHaveBeenCalledWith(mockFiles)
            })
        })

        it('calls onError when file validation fails', async () => {
            const onError = vi.fn()
            const mockFiles = [createMockFile('test.jpg', 1024, 'image/jpeg')]

            const { validateFiles } = require('../../../../../utils/file-validation')
            validateFiles.mockResolvedValue({
                validFiles: [],
                rejectedFiles: [{
                    file: mockFiles[0],
                    errors: [{ code: 'file-too-large', message: 'File too large', type: 'size' }]
                }],
                totalSize: 0,
                warnings: []
            })

            renderWithProvider({ onError })

            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

            await act(async () => {
                fireEvent.change(fileInput, { target: { files: mockFiles } })
            })

            await waitFor(() => {
                expect(onError).toHaveBeenCalledWith('test.jpg: File too large')
            })
        })
    })

    describe('File Previews', () => {
        it('displays file previews after selection', async () => {
            const mockFiles = [
                createMockFile('test.jpg', 1024, 'image/jpeg'),
                createMockFile('document.pdf', 2048, 'application/pdf')
            ]

            const { validateFiles } = require('../../../../../utils/file-validation')
            validateFiles.mockResolvedValue({
                validFiles: mockFiles,
                rejectedFiles: [],
                totalSize: 3072,
                warnings: []
            })

            renderWithProvider()

            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

            await act(async () => {
                fireEvent.change(fileInput, { target: { files: mockFiles } })
            })

            await waitFor(() => {
                expect(screen.getByText('test.jpg')).toBeInTheDocument()
                expect(screen.getByText('document.pdf')).toBeInTheDocument()
            })
        })

        it('generates image thumbnails for image files', async () => {
            const mockImageFile = createMockFile('test.jpg', 1024, 'image/jpeg')

            const { validateFiles } = require('../../../../../utils/file-validation')
            validateFiles.mockResolvedValue({
                validFiles: [mockImageFile],
                rejectedFiles: [],
                totalSize: 1024,
                warnings: []
            })

            renderWithProvider()

            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

            await act(async () => {
                fireEvent.change(fileInput, { target: { files: [mockImageFile] } })
            })

            await waitFor(() => {
                const img = screen.getByAltText('Preview of test.jpg')
                expect(img).toBeInTheDocument()
                expect(img).toHaveAttribute('src', 'data:image/jpeg;base64,mock-thumbnail')
            })
        })

        it('shows file icons for non-image files', async () => {
            const mockPdfFile = createMockFile('document.pdf', 2048, 'application/pdf')

            const { validateFiles } = require('../../../../../utils/file-validation')
            validateFiles.mockResolvedValue({
                validFiles: [mockPdfFile],
                rejectedFiles: [],
                totalSize: 2048,
                warnings: []
            })

            renderWithProvider()

            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

            await act(async () => {
                fireEvent.change(fileInput, { target: { files: [mockPdfFile] } })
            })

            await waitFor(() => {
                expect(screen.getByText('📄')).toBeInTheDocument()
            })
        })
    })

    describe('File Removal', () => {
        it('removes file when remove button is clicked', async () => {
            const user = userEvent.setup()
            const onFileRemove = vi.fn()
            const mockFile = createMockFile('test.jpg', 1024, 'image/jpeg')

            const { validateFiles } = require('../../../../../utils/file-validation')
            validateFiles.mockResolvedValue({
                validFiles: [mockFile],
                rejectedFiles: [],
                totalSize: 1024,
                warnings: []
            })

            renderWithProvider({ onFileRemove })

            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

            await act(async () => {
                fireEvent.change(fileInput, { target: { files: [mockFile] } })
            })

            await waitFor(() => {
                expect(screen.getByText('test.jpg')).toBeInTheDocument()
            })

            const removeButton = screen.getByRole('button', { name: /remove test\.jpg/i })
            await user.click(removeButton)

            await waitFor(() => {
                expect(screen.queryByText('test.jpg')).not.toBeInTheDocument()
                expect(onFileRemove).toHaveBeenCalled()
            })
        })
    })

    describe('Accessibility', () => {
        it('provides proper ARIA labels', () => {
            renderWithProvider({ ariaLabel: 'Custom upload label' })
            expect(screen.getByRole('button', { name: 'Custom upload label' })).toBeInTheDocument()
        })

        it('announces file selection to screen readers', async () => {
            const mockFile = createMockFile('test.jpg', 1024, 'image/jpeg')

            const { validateFiles } = require('../../../../../utils/file-validation')
            validateFiles.mockResolvedValue({
                validFiles: [mockFile],
                rejectedFiles: [],
                totalSize: 1024,
                warnings: []
            })

            renderWithProvider()

            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

            await act(async () => {
                fireEvent.change(fileInput, { target: { files: [mockFile] } })
            })

            await waitFor(() => {
                expect(screen.getByText(/1 file selected/)).toBeInTheDocument()
            })
        })
    })
})