import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { ImageUpload } from '../image-upload'
import { FileUploadProvider } from '../../file-upload-context'
import { FileUploadConfig } from '../../file-upload.types'

// Mock the file validation utility
const mockValidateImageDimensions = vi.fn()
vi.mock('../../../utils/file-validation', () => ({
    validateImageDimensions: mockValidateImageDimensions
}))

// Mock URL.createObjectURL and revokeObjectURL
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

// Mock canvas and image for image processing tests
const mockCanvas = {
    getContext: vi.fn(() => ({
        drawImage: vi.fn()
    })),
    toBlob: vi.fn(),
    width: 0,
    height: 0
}

const mockImage = {
    onload: null as any,
    onerror: null as any,
    src: '',
    width: 800,
    height: 600
}

// Store original createElement
const originalCreateElement = document.createElement.bind(document)

Object.defineProperty(document, 'createElement', {
    value: vi.fn((tagName: string) => {
        if (tagName === 'canvas') return mockCanvas
        return originalCreateElement(tagName)
    }),
    writable: true
})

Object.defineProperty(window, 'Image', {
    value: vi.fn(() => mockImage),
    writable: true
})

// Mock default config for testing
const mockDefaultConfig: FileUploadConfig = {
    defaults: {
        variant: 'button',
        size: 'md',
        radius: 'md',
        theme: 'auto',
        multiple: false,
        disabled: false,
        accept: '*',
        maxSize: 10 * 1024 * 1024,
        maxFiles: 5
    },
    validation: {
        maxSize: 10 * 1024 * 1024,
        maxFiles: 5,
        allowedTypes: ['*'],
        allowedExtensions: ['*'],
        minSize: 0,
        validateDimensions: false,
        maxWidth: 1920,
        maxHeight: 1080,
        minWidth: 100,
        minHeight: 100
    },
    styling: {
        theme: 'auto',
        colors: {
            primary: '#3b82f6',
            secondary: '#6b7280',
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            background: '#ffffff',
            foreground: '#1f2937',
            border: '#d1d5db',
            muted: '#9ca3af'
        },
        spacing: {
            padding: '1rem',
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
        uploadText: 'Choose files to upload',
        dragText: 'Drag and drop files here',
        dropText: 'Drop files here',
        browseText: 'Browse',
        errorText: 'Upload failed',
        successText: 'Upload successful',
        progressText: 'Uploading...',
        removeText: 'Remove',
        retryText: 'Retry',
        cancelText: 'Cancel',
        selectFilesText: 'Select files',
        maxSizeText: 'File too large',
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

const TestWrapper: React.FC<{ children: React.ReactNode; config?: any }> = ({
    children,
    config = mockDefaultConfig
}) => (
    <FileUploadProvider config={config}>
        {children}
    </FileUploadProvider>
)

describe('ImageUpload', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockCreateObjectURL.mockReturnValue('mock-object-url')
        mockValidateImageDimensions.mockResolvedValue({
            isValid: true,
            errors: [],
            warnings: []
        })
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('Basic Rendering', () => {
        it('renders image upload component with default content', () => {
            render(
                <TestWrapper>
                    <ImageUpload />
                </TestWrapper>
            )

            expect(screen.getByRole('button', { name: /upload images/i })).toBeInTheDocument()
            expect(screen.getByText('Upload Images')).toBeInTheDocument()
            expect(screen.getByText('Click to select image files')).toBeInTheDocument()
            expect(screen.getByText('🖼️')).toBeInTheDocument()
        })

        it('renders with custom aria labels', () => {
            render(
                <TestWrapper>
                    <ImageUpload
                        ariaLabel="Custom upload label"
                        ariaDescribedBy="custom-description"
                    />
                </TestWrapper>
            )

            expect(screen.getByRole('button', { name: 'Custom upload label' })).toBeInTheDocument()
        })

        it('renders with custom children', () => {
            render(
                <TestWrapper>
                    <ImageUpload>
                        <div>Custom upload content</div>
                    </ImageUpload>
                </TestWrapper>
            )

            expect(screen.getByText('Custom upload content')).toBeInTheDocument()
        })

        it('applies custom className and style', () => {
            render(
                <TestWrapper>
                    <ImageUpload
                        className="custom-class"
                        style={{ backgroundColor: 'red' }}
                    />
                </TestWrapper>
            )

            const container = screen.getByRole('button').closest('.file-upload')
            expect(container).toHaveClass('custom-class')
            expect(container).toHaveStyle('background-color: red')
        })
    })

    describe('Image-Specific Features', () => {
        it('accepts only image files', () => {
            render(
                <TestWrapper>
                    <ImageUpload />
                </TestWrapper>
            )

            const input = document.querySelector('input[type="file"]') as HTMLInputElement
            expect(input).toHaveAttribute('accept', 'image/*')
        })

        it('validates image dimensions when enabled', async () => {
            mockValidateImageDimensions.mockResolvedValue({
                isValid: true,
                errors: [],
                warnings: []
            })

            render(
                <TestWrapper>
                    <ImageUpload />
                </TestWrapper>
            )

            const imageFile = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
            const input = document.querySelector('input[type="file"]') as HTMLInputElement

            Object.defineProperty(input, 'files', {
                value: [imageFile],
                writable: false
            })

            fireEvent.change(input)

            await waitFor(() => {
                expect(mockValidateImageDimensions).toHaveBeenCalledWith(
                    imageFile,
                    mockDefaultConfig.validation.maxWidth,
                    mockDefaultConfig.validation.maxHeight,
                    mockDefaultConfig.validation.minWidth,
                    mockDefaultConfig.validation.minHeight
                )
            })
        })

        it('displays validation errors for invalid images', async () => {
            mockValidateImageDimensions.mockResolvedValue({
                isValid: false,
                errors: [
                    { code: 'image-width-too-large', message: 'Image width exceeds maximum', type: 'dimensions' }
                ],
                warnings: []
            })

            render(
                <TestWrapper>
                    <ImageUpload />
                </TestWrapper>
            )

            const imageFile = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
            const input = document.querySelector('input[type="file"]') as HTMLInputElement

            Object.defineProperty(input, 'files', {
                value: [imageFile],
                writable: false
            })

            fireEvent.change(input)

            await waitFor(() => {
                expect(screen.getByText('Image Validation Errors:')).toBeInTheDocument()
                expect(screen.getByText('test.jpg:')).toBeInTheDocument()
                expect(screen.getByText('Image width exceeds maximum')).toBeInTheDocument()
            })
        })

        it('handles validation errors gracefully', async () => {
            mockValidateImageDimensions.mockRejectedValue(new Error('Validation failed'))

            render(
                <TestWrapper>
                    <ImageUpload />
                </TestWrapper>
            )

            const imageFile = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
            const input = document.querySelector('input[type="file"]') as HTMLInputElement

            Object.defineProperty(input, 'files', {
                value: [imageFile],
                writable: false
            })

            fireEvent.change(input)

            await waitFor(() => {
                expect(screen.getByText('Failed to validate image dimensions')).toBeInTheDocument()
            })
        })
    })

    describe('Image Processing', () => {
        it('processes images with crop enabled', async () => {
            mockValidateImageDimensions.mockResolvedValue({
                isValid: true,
                errors: [],
                warnings: []
            })

            // Mock canvas toBlob to simulate successful cropping
            mockCanvas.toBlob.mockImplementation((callback) => {
                const blob = new Blob(['cropped image'], { type: 'image/jpeg' })
                callback(blob)
            })

            render(
                <TestWrapper>
                    <ImageUpload cropEnabled={true} aspectRatio={16 / 9} />
                </TestWrapper>
            )

            const imageFile = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
            const input = document.querySelector('input[type="file"]') as HTMLInputElement

            Object.defineProperty(input, 'files', {
                value: [imageFile],
                writable: false
            })

            fireEvent.change(input)

            // Simulate image load
            await waitFor(() => {
                if (mockImage.onload) {
                    mockImage.onload()
                }
            })

            expect(mockCanvas.toBlob).toHaveBeenCalled()
        })

        it('processes images with resize enabled', async () => {
            mockValidateImageDimensions.mockResolvedValue({
                isValid: true,
                errors: [],
                warnings: []
            })

            const config = {
                ...mockDefaultConfig,
                validation: {
                    ...mockDefaultConfig.validation,
                    maxWidth: 800,
                    maxHeight: 600
                }
            }

            // Mock canvas toBlob to simulate successful resizing
            mockCanvas.toBlob.mockImplementation((callback) => {
                const blob = new Blob(['resized image'], { type: 'image/jpeg' })
                callback(blob)
            })

            render(
                <TestWrapper config={config}>
                    <ImageUpload resizeEnabled={true} />
                </TestWrapper>
            )

            const imageFile = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
            const input = document.querySelector('input[type="file"]') as HTMLInputElement

            Object.defineProperty(input, 'files', {
                value: [imageFile],
                writable: false
            })

            fireEvent.change(input)

            // Simulate image load
            await waitFor(() => {
                if (mockImage.onload) {
                    mockImage.onload()
                }
            })

            expect(mockCanvas.toBlob).toHaveBeenCalled()
        })

        it('uses custom quality setting for image processing', async () => {
            mockValidateImageDimensions.mockResolvedValue({
                isValid: true,
                errors: [],
                warnings: []
            })

            mockCanvas.toBlob.mockImplementation((callback, type, quality) => {
                expect(quality).toBe(0.5)
                const blob = new Blob(['processed image'], { type: 'image/jpeg' })
                callback(blob)
            })

            render(
                <TestWrapper>
                    <ImageUpload cropEnabled={true} aspectRatio={1} quality={0.5} />
                </TestWrapper>
            )

            const imageFile = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
            const input = document.querySelector('input[type="file"]') as HTMLInputElement

            Object.defineProperty(input, 'files', {
                value: [imageFile],
                writable: false
            })

            fireEvent.change(input)

            // Simulate image load
            await waitFor(() => {
                if (mockImage.onload) {
                    mockImage.onload()
                }
            })
        })
    })

    describe('Accessibility', () => {
        it('has proper ARIA attributes', () => {
            render(
                <TestWrapper>
                    <ImageUpload />
                </TestWrapper>
            )

            const uploadButton = screen.getByRole('button', { name: /upload images/i })
            expect(uploadButton).toHaveAttribute('tabIndex', '0')
            expect(uploadButton).toHaveAttribute('aria-label', 'Upload images')
        })

        it('disables interaction when disabled', () => {
            const config = {
                ...mockDefaultConfig,
                defaults: {
                    ...mockDefaultConfig.defaults,
                    disabled: true
                }
            }

            render(
                <TestWrapper config={config}>
                    <ImageUpload />
                </TestWrapper>
            )

            const uploadButton = screen.getByRole('button', { name: /upload images/i })
            expect(uploadButton).toHaveAttribute('tabIndex', '-1')
        })

        it('supports keyboard navigation', () => {
            const mockClick = vi.fn()
            const inputElement = { click: mockClick }

            vi.spyOn(React, 'useRef').mockReturnValue({ current: inputElement })

            render(
                <TestWrapper>
                    <ImageUpload />
                </TestWrapper>
            )

            const uploadButton = screen.getByRole('button', { name: /upload images/i })

            // Test Enter key
            fireEvent.keyDown(uploadButton, { key: 'Enter' })
            expect(mockClick).toHaveBeenCalled()

            mockClick.mockClear()

            // Test Space key
            fireEvent.keyDown(uploadButton, { key: ' ' })
            expect(mockClick).toHaveBeenCalled()
        })
    })

    describe('Error Handling', () => {
        it('handles image processing errors gracefully', async () => {
            mockValidateImageDimensions.mockResolvedValue({
                isValid: true,
                errors: [],
                warnings: []
            })

            // Mock canvas toBlob to fail
            mockCanvas.toBlob.mockImplementation((callback) => {
                callback(null)
            })

            render(
                <TestWrapper>
                    <ImageUpload cropEnabled={true} aspectRatio={1} />
                </TestWrapper>
            )

            const imageFile = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
            const input = document.querySelector('input[type="file"]') as HTMLInputElement

            Object.defineProperty(input, 'files', {
                value: [imageFile],
                writable: false
            })

            fireEvent.change(input)

            // Should fallback to original file when processing fails
            await waitFor(() => {
                if (mockImage.onload) {
                    mockImage.onload()
                }
            })

            // Component should still function even if processing fails
            expect(screen.getByRole('button')).toBeInTheDocument()
        })

        it('filters non-image files', async () => {
            render(
                <TestWrapper>
                    <ImageUpload />
                </TestWrapper>
            )

            const imageFile = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
            const textFile = new File(['text content'], 'test.txt', { type: 'text/plain' })

            const input = document.querySelector('input[type="file"]') as HTMLInputElement

            Object.defineProperty(input, 'files', {
                value: [imageFile, textFile],
                writable: false
            })

            fireEvent.change(input)

            // Should only validate the image file
            await waitFor(() => {
                expect(mockValidateImageDimensions).toHaveBeenCalledTimes(1)
                expect(mockValidateImageDimensions).toHaveBeenCalledWith(
                    imageFile,
                    expect.any(Number),
                    expect.any(Number),
                    expect.any(Number),
                    expect.any(Number)
                )
            })
        })
    })

    describe('Aspect Ratio and Styling', () => {
        it('applies aspect ratio when specified', () => {
            render(
                <TestWrapper>
                    <ImageUpload aspectRatio={16 / 9} />
                </TestWrapper>
            )

            // Component should render without errors when aspect ratio is specified
            expect(screen.getByRole('button')).toBeInTheDocument()
        })

        it('applies crop-specific styling when crop is enabled', () => {
            render(
                <TestWrapper>
                    <ImageUpload cropEnabled={true} />
                </TestWrapper>
            )

            // Component should render without errors when crop is enabled
            expect(screen.getByRole('button')).toBeInTheDocument()
        })

        it('applies resize-specific styling when resize is enabled', () => {
            render(
                <TestWrapper>
                    <ImageUpload resizeEnabled={true} />
                </TestWrapper>
            )

            // Component should render without errors when resize is enabled
            expect(screen.getByRole('button')).toBeInTheDocument()
        })
    })
})