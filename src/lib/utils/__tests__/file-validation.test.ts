import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
    validateFileType,
    validateFileSize,
    validateFileCount,
    validateImageDimensions,
    validateFile,
    validateFiles,
    formatFileSize,
    getFileExtension,
    isImageFile,
    isVideoFile,
    isAudioFile,
    isDocumentFile,
    createValidationError,
    validateAcceptAttribute
} from '../file-validation'
import { FileUploadConfig } from '../../components/file-upload/file-upload.types'

// Mock File constructor for testing
class MockFile implements File {
    name: string
    size: number
    type: string
    lastModified: number
    webkitRelativePath: string = ''

    constructor(name: string, size: number, type: string) {
        this.name = name
        this.size = size
        this.type = type
        this.lastModified = Date.now()
    }

    arrayBuffer(): Promise<ArrayBuffer> {
        return Promise.resolve(new ArrayBuffer(this.size))
    }

    slice(): Blob {
        return new Blob()
    }

    stream(): ReadableStream<Uint8Array> {
        return new ReadableStream()
    }

    text(): Promise<string> {
        return Promise.resolve('')
    }
}

// Mock configuration for testing
const mockConfig: FileUploadConfig = {
    defaults: {
        variant: 'button',
        size: 'md',
        radius: 'md',
        theme: 'auto',
        multiple: false,
        disabled: false,
        accept: '*',
        maxSize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5
    },
    validation: {
        maxSize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5,
        allowedTypes: ['image/*', 'application/pdf'],
        allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'pdf'],
        minSize: 1024, // 1KB
        validateDimensions: true,
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
describe('File Validation Utilities', () => {
    describe('validateFileType', () => {
        it('should allow all types when wildcard is used', () => {
            const file = new MockFile('test.txt', 1000, 'text/plain')
            const result = validateFileType(file, ['*'], ['*'])

            expect(result.isValid).toBe(true)
            expect(result.errors).toHaveLength(0)
        })

        it('should validate exact MIME type matches', () => {
            const file = new MockFile('test.jpg', 1000, 'image/jpeg')
            const result = validateFileType(file, ['image/jpeg'], ['jpg'])

            expect(result.isValid).toBe(true)
            expect(result.errors).toHaveLength(0)
        })

        it('should validate wildcard MIME type patterns', () => {
            const file = new MockFile('test.jpg', 1000, 'image/jpeg')
            const result = validateFileType(file, ['image/*'], ['jpg'])

            expect(result.isValid).toBe(true)
            expect(result.errors).toHaveLength(0)
        })

        it('should reject invalid MIME types', () => {
            const file = new MockFile('test.txt', 1000, 'text/plain')
            const result = validateFileType(file, ['image/*'], ['jpg'])

            expect(result.isValid).toBe(false)
            expect(result.errors).toHaveLength(2) // Both MIME type and extension fail
            expect(result.errors[0].code).toBe('invalid-file-type')
            expect(result.errors[1].code).toBe('invalid-file-extension')
        })

        it('should validate file extensions', () => {
            const file = new MockFile('test.jpg', 1000, 'image/jpeg')
            const result = validateFileType(file, ['*'], ['jpg', 'png'])

            expect(result.isValid).toBe(true)
            expect(result.errors).toHaveLength(0)
        })

        it('should reject invalid file extensions', () => {
            const file = new MockFile('test.txt', 1000, 'text/plain')
            const result = validateFileType(file, ['*'], ['jpg', 'png'])

            expect(result.isValid).toBe(false)
            expect(result.errors).toHaveLength(1)
            expect(result.errors[0].code).toBe('invalid-file-extension')
        })

        it('should warn about files without extensions', () => {
            const file = new MockFile('test', 1000, 'text/plain')
            const result = validateFileType(file, ['*'], ['*'])

            expect(result.isValid).toBe(true)
            expect(result.warnings).toContain('File has no extension, type validation may be unreliable')
        })

        it('should handle case insensitive extension matching', () => {
            const file = new MockFile('test.JPG', 1000, 'image/jpeg')
            const result = validateFileType(file, ['*'], ['jpg'])

            expect(result.isValid).toBe(true)
            expect(result.errors).toHaveLength(0)
        })
    })

    describe('validateFileSize', () => {
        it('should accept files within size limits', () => {
            const file = new MockFile('test.jpg', 5000, 'image/jpeg')
            const result = validateFileSize(file, 10000, 1000)

            expect(result.isValid).toBe(true)
            expect(result.errors).toHaveLength(0)
        })

        it('should reject files that are too large', () => {
            const file = new MockFile('test.jpg', 15000, 'image/jpeg')
            const result = validateFileSize(file, 10000)

            expect(result.isValid).toBe(false)
            expect(result.errors).toHaveLength(1)
            expect(result.errors[0].code).toBe('file-too-large')
        })

        it('should reject files that are too small', () => {
            const file = new MockFile('test.jpg', 500, 'image/jpeg')
            const result = validateFileSize(file, 10000, 1000)

            expect(result.isValid).toBe(false)
            expect(result.errors).toHaveLength(1)
            expect(result.errors[0].code).toBe('file-too-small')
        })

        it('should warn about files approaching size limit', () => {
            const file = new MockFile('test.jpg', 9000, 'image/jpeg')
            const result = validateFileSize(file, 10000)

            expect(result.isValid).toBe(true)
            expect(result.warnings).toContain('File is approaching the maximum size limit')
        })

        it('should warn about empty files', () => {
            const file = new MockFile('test.jpg', 0, 'image/jpeg')
            const result = validateFileSize(file, 10000)

            expect(result.isValid).toBe(true)
            expect(result.warnings).toContain('File appears to be empty')
        })
    })

    describe('validateFileCount', () => {
        it('should accept file count within limits', () => {
            const files = [
                new MockFile('test1.jpg', 1000, 'image/jpeg'),
                new MockFile('test2.jpg', 1000, 'image/jpeg')
            ]
            const result = validateFileCount(files, 5, 0)

            expect(result.isValid).toBe(true)
            expect(result.errors).toHaveLength(0)
        })

        it('should reject too many files', () => {
            const files = [
                new MockFile('test1.jpg', 1000, 'image/jpeg'),
                new MockFile('test2.jpg', 1000, 'image/jpeg'),
                new MockFile('test3.jpg', 1000, 'image/jpeg')
            ]
            const result = validateFileCount(files, 2, 0)

            expect(result.isValid).toBe(false)
            expect(result.errors).toHaveLength(1)
            expect(result.errors[0].code).toBe('too-many-files')
        })

        it('should consider current file count', () => {
            const files = [
                new MockFile('test1.jpg', 1000, 'image/jpeg'),
                new MockFile('test2.jpg', 1000, 'image/jpeg')
            ]
            const result = validateFileCount(files, 3, 2)

            expect(result.isValid).toBe(false)
            expect(result.errors).toHaveLength(1)
            expect(result.errors[0].code).toBe('too-many-files')
        })

        it('should warn when approaching file limit', () => {
            const files = [
                new MockFile('test1.jpg', 1000, 'image/jpeg'),
                new MockFile('test2.jpg', 1000, 'image/jpeg'),
                new MockFile('test3.jpg', 1000, 'image/jpeg'),
                new MockFile('test4.jpg', 1000, 'image/jpeg'),
                new MockFile('test5.jpg', 1000, 'image/jpeg')
            ]
            const result = validateFileCount(files, 6, 0)

            expect(result.isValid).toBe(true)
            expect(result.warnings).toContain('Approaching file limit (5/6)')
        })
    })

    describe('validateImageDimensions', () => {
        beforeEach(() => {
            // Mock Image constructor
            global.Image = class {
                onload: (() => void) | null = null
                onerror: (() => void) | null = null
                src: string = ''
                width: number = 800
                height: number = 600

                constructor() {
                    setTimeout(() => {
                        if (this.onload) this.onload()
                    }, 0)
                }
            } as any

            // Mock URL.createObjectURL and revokeObjectURL
            global.URL.createObjectURL = vi.fn(() => 'mock-url')
            global.URL.revokeObjectURL = vi.fn()
        })

        it('should skip validation for non-image files', async () => {
            const file = new MockFile('test.pdf', 1000, 'application/pdf')
            const result = await validateImageDimensions(file, 1000, 1000)

            expect(result.isValid).toBe(true)
            expect(result.errors).toHaveLength(0)
        })

        it('should accept images within dimension limits', async () => {
            const file = new MockFile('test.jpg', 1000, 'image/jpeg')
            const result = await validateImageDimensions(file, 1000, 1000, 100, 100)

            expect(result.isValid).toBe(true)
            expect(result.errors).toHaveLength(0)
        })

        it('should reject images that are too wide', async () => {
            global.Image = class {
                onload: (() => void) | null = null
                onerror: (() => void) | null = null
                src: string = ''
                width: number = 1200
                height: number = 600

                constructor() {
                    setTimeout(() => {
                        if (this.onload) this.onload()
                    }, 0)
                }
            } as any

            const file = new MockFile('test.jpg', 1000, 'image/jpeg')
            const result = await validateImageDimensions(file, 1000, 1000)

            expect(result.isValid).toBe(false)
            expect(result.errors).toHaveLength(1)
            expect(result.errors[0].code).toBe('image-width-too-large')
        })

        it('should reject images that are too tall', async () => {
            global.Image = class {
                onload: (() => void) | null = null
                onerror: (() => void) | null = null
                src: string = ''
                width: number = 800
                height: number = 1200

                constructor() {
                    setTimeout(() => {
                        if (this.onload) this.onload()
                    }, 0)
                }
            } as any

            const file = new MockFile('test.jpg', 1000, 'image/jpeg')
            const result = await validateImageDimensions(file, 1000, 1000)

            expect(result.isValid).toBe(false)
            expect(result.errors).toHaveLength(1)
            expect(result.errors[0].code).toBe('image-height-too-large')
        })

        it('should handle image loading errors', async () => {
            global.Image = class {
                onload: (() => void) | null = null
                onerror: (() => void) | null = null
                src: string = ''
                width: number = 800
                height: number = 600

                constructor() {
                    setTimeout(() => {
                        if (this.onerror) this.onerror()
                    }, 0)
                }
            } as any

            const file = new MockFile('test.jpg', 1000, 'image/jpeg')
            const result = await validateImageDimensions(file, 1000, 1000)

            expect(result.isValid).toBe(false)
            expect(result.errors).toHaveLength(1)
            expect(result.errors[0].code).toBe('invalid-image')
        })
    })

    describe('validateFile', () => {
        it('should validate a file against all rules', async () => {
            const file = new MockFile('test.jpg', 5000, 'image/jpeg')
            const result = await validateFile(file, mockConfig)

            expect(result.isValid).toBe(false) // Will fail dimension validation due to mock
            expect(result.errors.length).toBeGreaterThan(0)
        })

        it('should pass validation for valid files', async () => {
            const config = {
                ...mockConfig,
                validation: {
                    ...mockConfig.validation,
                    validateDimensions: false
                }
            }
            const file = new MockFile('test.jpg', 5000, 'image/jpeg')
            const result = await validateFile(file, config)

            expect(result.isValid).toBe(true)
            expect(result.errors).toHaveLength(0)
        })
    })

    describe('validateFiles', () => {
        it('should validate multiple files and separate valid/rejected', async () => {
            const files = [
                new MockFile('test.jpg', 5000, 'image/jpeg'),
                new MockFile('test.txt', 1000, 'text/plain'), // Should be rejected
                new MockFile('test.pdf', 3000, 'application/pdf')
            ]

            const config = {
                ...mockConfig,
                validation: {
                    ...mockConfig.validation,
                    validateDimensions: false
                }
            }

            const result = await validateFiles(files, config)

            expect(result.validFiles).toHaveLength(2) // jpg and pdf should be valid
            expect(result.rejectedFiles).toHaveLength(1) // txt should be rejected
            expect(result.rejectedFiles[0].file.name).toBe('test.txt')
        })

        it('should reject all files if count exceeds limit', async () => {
            const files = Array.from({ length: 6 }, (_, i) =>
                new MockFile(`test${i}.jpg`, 1000, 'image/jpeg')
            )

            const result = await validateFiles(files, mockConfig)

            expect(result.validFiles).toHaveLength(0)
            expect(result.rejectedFiles).toHaveLength(6)
            expect(result.rejectedFiles[0].errors[0].code).toBe('too-many-files')
        })
    })

    describe('Utility Functions', () => {
        describe('formatFileSize', () => {
            it('should format bytes correctly', () => {
                expect(formatFileSize(0)).toBe('0 Bytes')
                expect(formatFileSize(1024)).toBe('1 KB')
                expect(formatFileSize(1024 * 1024)).toBe('1 MB')
                expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB')
                expect(formatFileSize(1536)).toBe('1.5 KB')
            })
        })

        describe('getFileExtension', () => {
            it('should extract file extensions correctly', () => {
                expect(getFileExtension('test.jpg')).toBe('jpg')
                expect(getFileExtension('test.PDF')).toBe('pdf')
                expect(getFileExtension('test.tar.gz')).toBe('gz')
                expect(getFileExtension('test')).toBe('')
            })
        })

        describe('File Type Checkers', () => {
            it('should identify image files', () => {
                const imageFile = new MockFile('test.jpg', 1000, 'image/jpeg')
                const textFile = new MockFile('test.txt', 1000, 'text/plain')

                expect(isImageFile(imageFile)).toBe(true)
                expect(isImageFile(textFile)).toBe(false)
            })

            it('should identify video files', () => {
                const videoFile = new MockFile('test.mp4', 1000, 'video/mp4')
                const textFile = new MockFile('test.txt', 1000, 'text/plain')

                expect(isVideoFile(videoFile)).toBe(true)
                expect(isVideoFile(textFile)).toBe(false)
            })

            it('should identify audio files', () => {
                const audioFile = new MockFile('test.mp3', 1000, 'audio/mpeg')
                const textFile = new MockFile('test.txt', 1000, 'text/plain')

                expect(isAudioFile(audioFile)).toBe(true)
                expect(isAudioFile(textFile)).toBe(false)
            })

            it('should identify document files', () => {
                const pdfFile = new MockFile('test.pdf', 1000, 'application/pdf')
                const docFile = new MockFile('test.docx', 1000, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
                const textFile = new MockFile('test.txt', 1000, 'text/plain')
                const imageFile = new MockFile('test.jpg', 1000, 'image/jpeg')

                expect(isDocumentFile(pdfFile)).toBe(true)
                expect(isDocumentFile(docFile)).toBe(true)
                expect(isDocumentFile(textFile)).toBe(true)
                expect(isDocumentFile(imageFile)).toBe(false)
            })
        })

        describe('createValidationError', () => {
            it('should create validation error objects', () => {
                const error = createValidationError('test-code', 'Test message', 'size')

                expect(error.code).toBe('test-code')
                expect(error.message).toBe('Test message')
                expect(error.type).toBe('size')
            })
        })

        describe('validateAcceptAttribute', () => {
            it('should validate accept attribute formats', () => {
                expect(validateAcceptAttribute('*')).toBe(true)
                expect(validateAcceptAttribute('.jpg,.png')).toBe(true)
                expect(validateAcceptAttribute('image/*,application/pdf')).toBe(true)
                expect(validateAcceptAttribute('image/jpeg')).toBe(true)
                expect(validateAcceptAttribute('')).toBe(true)

                expect(validateAcceptAttribute('invalid')).toBe(false)
                expect(validateAcceptAttribute('.jpg,invalid')).toBe(false)
                expect(validateAcceptAttribute('image/,application/pdf')).toBe(false)
            })
        })
    })
})