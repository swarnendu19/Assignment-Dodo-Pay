import type {
    FileUploadStatus,
    UploadFile,
    UploadResponse
} from '../components/file-upload/file-upload.types'

export interface MockUploadConfig {
    delay?: number
    successRate?: number
    chunkSize?: number
    simulateProgress?: boolean
    progressInterval?: number
}

export class MockUploadService {
    private config: MockUploadConfig

    constructor(config: MockUploadConfig = {}) {
        this.config = {
            delay: 2000,
            successRate: 0.9,
            chunkSize: 1024 * 1024, // 1MB chunks
            simulateProgress: true,
            progressInterval: 100,
            ...config
        }
    }

    async uploadFile(
        file: File,
        onProgress?: (progress: number) => void
    ): Promise<UploadResponse> {
        const fileId = this.generateFileId()
        const shouldSucceed = Math.random() < this.config.successRate!

        if (this.config.simulateProgress && onProgress) {
            await this.simulateProgressUpload(onProgress)
        } else {
            await this.delay(this.config.delay!)
        }

        if (shouldSucceed) {
            return {
                success: true,
                fileId,
                url: this.generateMockUrl(file),
                thumbnailUrl: file.type.startsWith('image/') ? this.generateThumbnailUrl(file) : undefined,
                metadata: {
                    width: file.type.startsWith('image/') ? 1920 : undefined,
                    height: file.type.startsWith('image/') ? 1080 : undefined,
                    format: file.type,
                }
            }
        } else {
            return {
                success: false,
                fileId,
                error: this.generateRandomError()
            }
        }
    }

    async uploadFiles(
        files: File[],
        onProgress?: (fileId: string, progress: number) => void,
        onComplete?: (fileId: string, response: UploadResponse) => void
    ): Promise<UploadResponse[]> {
        const results: UploadResponse[] = []

        for (const file of files) {
            const fileId = this.generateFileId()

            try {
                const response = await this.uploadFile(
                    file,
                    onProgress ? (progress) => onProgress(fileId, progress) : undefined
                )

                results.push(response)

                if (onComplete) {
                    onComplete(fileId, response)
                }
            } catch (error) {
                const errorResponse: UploadResponse = {
                    success: false,
                    fileId,
                    error: error instanceof Error ? error.message : 'Upload failed'
                }

                results.push(errorResponse)

                if (onComplete) {
                    onComplete(fileId, errorResponse)
                }
            }
        }

        return results
    }

    private async simulateProgressUpload(onProgress: (progress: number) => void): Promise<void> {
        const totalSteps = Math.floor(this.config.delay! / this.config.progressInterval!)

        for (let step = 0; step <= totalSteps; step++) {
            const progress = Math.min((step / totalSteps) * 100, 100)
            onProgress(progress)

            if (step < totalSteps) {
                await this.delay(this.config.progressInterval!)
            }
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    private generateFileId(): string {
        return `mock_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    }

    private generateMockUrl(file: File): string {
        return `https://mock-storage.example.com/files/${this.generateFileId()}.${this.getFileExtension(file.name)}`
    }

    private generateThumbnailUrl(file: File): string {
        return `https://mock-storage.example.com/thumbnails/${this.generateFileId()}_thumb.${this.getFileExtension(file.name)}`
    }

    private getFileExtension(filename: string): string {
        return filename.split('.').pop() || 'bin'
    }

    private generateRandomError(): string {
        const errors = [
            'Network connection failed',
            'File size too large',
            'Invalid file format',
            'Server temporarily unavailable',
            'Upload quota exceeded',
            'File corrupted during transfer'
        ]

        return errors[Math.floor(Math.random() * errors.length)]
    }
}

// Default instance for simple usage
export const mockUploadService = new MockUploadService()

// Convenience function for single file upload
export const mockUpload = async (
    file: File,
    onProgress?: (progress: number) => void
): Promise<UploadResponse> => {
    return mockUploadService.uploadFile(file, onProgress)
}

// Convenience function for multiple file upload
export const mockUploadMultiple = async (
    files: File[],
    onProgress?: (fileId: string, progress: number) => void,
    onComplete?: (fileId: string, response: UploadResponse) => void
): Promise<UploadResponse[]> => {
    return mockUploadService.uploadFiles(files, onProgress, onComplete)
}

// Upload state management utilities
export const createUploadFile = (file: File, id?: string): UploadFile => {
    return {
        id: id || `file_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        file,
        status: 'pending' as FileUploadStatus,
        progress: 0,
        size: file.size,
        type: file.type,
        name: file.name,
        lastModified: file.lastModified,
        retryCount: 0,
        maxRetries: 3,
        startedAt: new Date()
    }
}

export const updateUploadFileStatus = (
    uploadFile: UploadFile,
    status: FileUploadStatus,
    progress?: number,
    error?: string,
    url?: string
): UploadFile => {
    const updated: UploadFile = {
        ...uploadFile,
        status,
        progress: progress ?? uploadFile.progress,
        error: error ?? uploadFile.error,
        url: url ?? uploadFile.url
    }

    if (status === 'uploading' && !uploadFile.startedAt) {
        updated.startedAt = new Date()
    }

    if (status === 'success' || status === 'error') {
        updated.completedAt = new Date()
    }

    return updated
}