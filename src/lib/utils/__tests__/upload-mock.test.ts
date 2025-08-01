import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
    MockUploadService,
    mockUpload,
    mockUploadMultiple,
    createUploadFile,
    updateUploadFileStatus
} from '../upload-mock'
import type { FileUploadStatus } from '../../components/file-upload/file-upload.types'

// Mock File constructor for testing
const createMockFile = (name: string, size: number, type: string): File => {
    const file = new File([''], name, { type })
    Object.defineProperty(file, 'size', { value: size })
    return file
}

describe('MockUploadService', () => {
    let uploadService: MockUploadService
    let mockFile: File

    beforeEach(() => {
        uploadService = new MockUploadService({
            delay: 100,
            successRate: 1.0,
            simulateProgress: true,
            progressInterval: 20
        })
        mockFile = createMockFile('test.jpg', 1024 * 1024, 'image/jpeg')
    })

    describe('uploadFile', () => {
        it('should successfully upload a file', async () => {
            const response = await uploadService.uploadFile(mockFile)

            expect(response.success).toBe(true)
            expect(response.fileId).toMatch(/^mock_\d+_[a-z0-9]+$/)
            expect(response.url).toContain('mock-storage.example.com')
            expect(response.thumbnailUrl).toContain('thumbnails')
            expect(response.metadata?.format).toBe('image/jpeg')
        })

        it('should simulate upload progress', async () => {
            const progressCallback = vi.fn()

            await uploadService.uploadFile(mockFile, progressCallback)

            expect(progressCallback).toHaveBeenCalled()
            expect(progressCallback).toHaveBeenCalledWith(100)

            // Check that progress was called with increasing values
            const calls = progressCallback.mock.calls
            expect(calls.length).toBeGreaterThan(1)
            expect(calls[0][0]).toBe(0)
            expect(calls[calls.length - 1][0]).toBe(100)
        })

        it('should handle upload failures', async () => {
            const failingService = new MockUploadService({
                delay: 50,
                successRate: 0.0 // Always fail
            })

            const response = await failingService.uploadFile(mockFile)

            expect(response.success).toBe(false)
            expect(response.error).toBeDefined()
            expect(typeof response.error).toBe('string')
        })

        it('should not generate thumbnail for non-image files', async () => {
            const textFile = createMockFile('document.txt', 1024, 'text/plain')
            const response = await uploadService.uploadFile(textFile)

            expect(response.success).toBe(true)
            expect(response.thumbnailUrl).toBeUndefined()
        })
    })

    describe('uploadFiles', () => {
        it('should upload multiple files successfully', async () => {
            const files = [
                createMockFile('image1.jpg', 1024, 'image/jpeg'),
                createMockFile('image2.png', 2048, 'image/png'),
                createMockFile('document.pdf', 4096, 'application/pdf')
            ]

            const responses = await uploadService.uploadFiles(files)

            expect(responses).toHaveLength(3)
            responses.forEach(response => {
                expect(response.success).toBe(true)
                expect(response.fileId).toBeDefined()
                expect(response.url).toBeDefined()
            })
        })

        it('should call progress callback for each file', async () => {
            const files = [
                createMockFile('file1.jpg', 1024, 'image/jpeg'),
                createMockFile('file2.jpg', 1024, 'image/jpeg')
            ]
            const progressCallback = vi.fn()
            const completeCallback = vi.fn()

            await uploadService.uploadFiles(files, progressCallback, completeCallback)

            expect(progressCallback).toHaveBeenCalled()
            expect(completeCallback).toHaveBeenCalledTimes(2)
        })

        it('should handle mixed success and failure scenarios', async () => {
            const mixedService = new MockUploadService({
                delay: 50,
                successRate: 0.5 // 50% success rate
            })

            const files = Array.from({ length: 10 }, (_, i) =>
                createMockFile(`file${i}.jpg`, 1024, 'image/jpeg')
            )

            const responses = await mixedService.uploadFiles(files)

            expect(responses).toHaveLength(10)

            const successCount = responses.filter(r => r.success).length
            const failureCount = responses.filter(r => !r.success).length

            expect(successCount + failureCount).toBe(10)
            expect(failureCount).toBeGreaterThan(0) // With 50% rate and 10 files, should have some failures
        })
    })

    describe('configuration', () => {
        it('should use default configuration when none provided', () => {
            const defaultService = new MockUploadService()

            // Access private config through any to test defaults
            const config = (defaultService as any).config

            expect(config.delay).toBe(2000)
            expect(config.successRate).toBe(0.9)
            expect(config.simulateProgress).toBe(true)
            expect(config.progressInterval).toBe(100)
        })

        it('should merge custom configuration with defaults', () => {
            const customService = new MockUploadService({
                delay: 5000,
                successRate: 0.8
            })

            const config = (customService as any).config

            expect(config.delay).toBe(5000)
            expect(config.successRate).toBe(0.8)
            expect(config.simulateProgress).toBe(true) // Should keep default
            expect(config.progressInterval).toBe(100) // Should keep default
        })
    })
})

describe('Convenience functions', () => {
    let mockFile: File

    beforeEach(() => {
        mockFile = createMockFile('test.jpg', 1024, 'image/jpeg')
    })

    describe('mockUpload', () => {
        it('should upload a single file', async () => {
            const response = await mockUpload(mockFile)

            expect(response.success).toBe(true)
            expect(response.fileId).toBeDefined()
            expect(response.url).toBeDefined()
        })

        it('should call progress callback', async () => {
            const progressCallback = vi.fn()

            await mockUpload(mockFile, progressCallback)

            expect(progressCallback).toHaveBeenCalled()
        })
    })

    describe('mockUploadMultiple', () => {
        it('should upload multiple files', async () => {
            const files = [
                createMockFile('file1.jpg', 1024, 'image/jpeg'),
                createMockFile('file2.png', 2048, 'image/png')
            ]

            const responses = await mockUploadMultiple(files)

            expect(responses).toHaveLength(2)
            responses.forEach(response => {
                expect(response.success).toBe(true)
            })
        })
    })
})

describe('Upload state utilities', () => {
    let mockFile: File

    beforeEach(() => {
        mockFile = createMockFile('test.jpg', 1024, 'image/jpeg')
    })

    describe('createUploadFile', () => {
        it('should create UploadFile from File', () => {
            const uploadFile = createUploadFile(mockFile)

            expect(uploadFile.id).toMatch(/^file_\d+_[a-z0-9]+$/)
            expect(uploadFile.file).toBe(mockFile)
            expect(uploadFile.status).toBe('pending')
            expect(uploadFile.progress).toBe(0)
            expect(uploadFile.size).toBe(1024)
            expect(uploadFile.type).toBe('image/jpeg')
            expect(uploadFile.name).toBe('test.jpg')
            expect(uploadFile.retryCount).toBe(0)
            expect(uploadFile.maxRetries).toBe(3)
            expect(uploadFile.startedAt).toBeInstanceOf(Date)
        })

        it('should use provided ID when given', () => {
            const customId = 'custom-file-id'
            const uploadFile = createUploadFile(mockFile, customId)

            expect(uploadFile.id).toBe(customId)
        })
    })

    describe('updateUploadFileStatus', () => {
        let uploadFile: ReturnType<typeof createUploadFile>

        beforeEach(() => {
            uploadFile = createUploadFile(mockFile)
        })

        it('should update status and progress', () => {
            const updated = updateUploadFileStatus(uploadFile, 'uploading', 50)

            expect(updated.status).toBe('uploading')
            expect(updated.progress).toBe(50)
            expect(updated.startedAt).toBeInstanceOf(Date)
        })

        it('should set completedAt for final states', () => {
            const successFile = updateUploadFileStatus(uploadFile, 'success', 100)
            const errorFile = updateUploadFileStatus(uploadFile, 'error', 0, 'Upload failed')

            expect(successFile.completedAt).toBeInstanceOf(Date)
            expect(errorFile.completedAt).toBeInstanceOf(Date)
            expect(errorFile.error).toBe('Upload failed')
        })

        it('should preserve existing values when not provided', () => {
            const withError = updateUploadFileStatus(uploadFile, 'error', 0, 'Initial error')
            const updated = updateUploadFileStatus(withError, 'pending', 25)

            expect(updated.status).toBe('pending')
            expect(updated.progress).toBe(25)
            expect(updated.error).toBe('Initial error') // Should preserve existing error
        })

        it('should update URL when provided', () => {
            const url = 'https://example.com/file.jpg'
            const updated = updateUploadFileStatus(uploadFile, 'success', 100, undefined, url)

            expect(updated.url).toBe(url)
        })
    })
})

describe('Error generation', () => {
    it('should generate different error messages', () => {
        const service = new MockUploadService({ successRate: 0 })
        const errors = new Set<string>()

        // Generate multiple errors to test variety
        for (let i = 0; i < 20; i++) {
            const error = (service as any).generateRandomError()
            errors.add(error)
        }

        expect(errors.size).toBeGreaterThan(1) // Should have multiple different errors
    })
})

describe('File extension handling', () => {
    let service: MockUploadService

    beforeEach(() => {
        service = new MockUploadService()
    })

    it('should extract file extensions correctly', () => {
        const getExtension = (service as any).getFileExtension.bind(service)

        expect(getExtension('file.jpg')).toBe('jpg')
        expect(getExtension('document.pdf')).toBe('pdf')
        expect(getExtension('archive.tar.gz')).toBe('gz')
        expect(getExtension('noextension')).toBe('bin')
        expect(getExtension('')).toBe('bin')
    })
})