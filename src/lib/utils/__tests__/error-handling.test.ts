import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
    processError,
    processErrors,
    formatErrorForUser,
    shouldAnnounceError,
    createErrorAnnouncement,
    logError
} from '../error-handling'
import { FileError, FileUploadConfig } from '../../components/file-upload/file-upload.types'

// Mock console methods
const mockConsole = {
    error: vi.fn(),
    warn: vi.fn(),
    log: vi.fn()
}

vi.stubGlobal('console', mockConsole)

describe('Error Handling Utilities', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('processError', () => {
        it('should process a string error', () => {
            const result = processError('Test error message')

            expect(result.type).toBe('unknown')
            expect(result.code).toBe('unknown-error')
            expect(result.technicalMessage).toBe('Test error message')
            expect(result.userMessage).toBe('An unexpected error occurred.')
            expect(result.severity).toBe('medium')
            expect(result.recoverable).toBe(true)
            expect(result.retryable).toBe(true)
            expect(result.id).toMatch(/^error_\d+_[a-z0-9]+$/)
        })

        it('should process a JavaScript Error', () => {
            const error = new Error('network connection failed')
            const result = processError(error)

            expect(result.type).toBe('network')
            expect(result.code).toBe('unknown-error') // Error.name is 'Error', which becomes 'unknown-error'
            expect(result.technicalMessage).toBe('network connection failed')
            expect(result.userMessage).toBe('An unexpected error occurred.')
        })

        it('should process a FileError', () => {
            const fileError: FileError = {
                code: 'file-too-large',
                message: 'File size exceeds 10MB limit',
                type: 'size'
            }

            const result = processError(fileError)

            expect(result.type).toBe('validation')
            expect(result.code).toBe('file-too-large')
            expect(result.title).toBe('File Too Large')
            expect(result.userMessage).toBe('The selected file is too large to upload.')
            expect(result.severity).toBe('medium')
            expect(result.recoverable).toBe(true)
            expect(result.retryable).toBe(false)
        })

        it('should include context in the processed error', () => {
            const context = {
                fileName: 'test.jpg',
                fileSize: 5000000,
                operation: 'upload'
            }

            const result = processError('Test error', context)

            expect(result.context.fileName).toBe('test.jpg')
            expect(result.context.fileSize).toBe(5000000)
            expect(result.context.operation).toBe('upload')
            expect(result.context.timestamp).toBeInstanceOf(Date)
            expect(result.userMessage).toContain('(File: test.jpg)')
        })

        it('should include config-specific suggestions', () => {
            const config: Partial<FileUploadConfig> = {
                validation: {
                    maxSize: 10485760, // 10MB
                    allowedTypes: ['image/jpeg', 'image/png'],
                    allowedExtensions: ['jpg', 'png'],
                    maxFiles: 5
                },
                labels: {
                    retryText: 'Try Again'
                }
            } as FileUploadConfig

            const fileError: FileError = {
                code: 'file-too-large',
                message: 'File too large',
                type: 'size'
            }

            const result = processError(fileError, { fileName: 'test.jpg' }, config)

            expect(result.suggestions).toContain('Maximum file size is 10.0 MB')
        })

        it('should generate appropriate recovery actions', () => {
            const fileError: FileError = {
                code: 'network-error',
                message: 'Network failed',
                type: 'network'
            }

            const result = processError(fileError)

            expect(result.actions).toHaveLength(4) // retry, remove, clear, contact
            expect(result.actions.find(a => a.type === 'retry')).toBeDefined()
            expect(result.actions.find(a => a.type === 'remove')).toBeDefined()
            expect(result.actions.find(a => a.type === 'clear')).toBeDefined()
            expect(result.actions.find(a => a.type === 'contact')).toBeDefined()
        })
    })

    describe('processErrors', () => {
        it('should process multiple errors and provide summary', () => {
            const errors = [
                'Network error',
                new Error('Request timeout'),
                { code: 'file-too-large', message: 'File too big', type: 'size' } as FileError
            ]

            const result = processErrors(errors)

            expect(result.errors).toHaveLength(3)
            expect(result.summary.total).toBe(3)
            expect(result.summary.byType.unknown).toBe(1)
            expect(result.summary.byType.timeout).toBe(1)
            expect(result.summary.byType.validation).toBe(1)
            expect(result.summary.bySeverity.medium).toBe(3)
        })

        it('should count retryable and recoverable errors', () => {
            const errors = [
                { code: 'network-error', message: 'Network failed', type: 'network' } as FileError,
                { code: 'file-too-large', message: 'File too big', type: 'size' } as FileError
            ]

            const result = processErrors(errors)

            expect(result.summary.retryable).toBe(1) // network error is retryable
            expect(result.summary.recoverable).toBe(2) // both are recoverable
        })
    })

    describe('formatErrorForUser', () => {
        it('should format error message for user display', () => {
            const error = processError('Test error', { fileName: 'test.jpg' })
            const formatted = formatErrorForUser(error, true)

            expect(formatted).toContain('An unexpected error occurred.')
            expect(formatted).toContain('(test.jpg)')
            expect(formatted).toContain('Suggestions:')
        })

        it('should exclude context when requested', () => {
            const error = processError('Test error', { fileName: 'test.jpg' })
            const formatted = formatErrorForUser(error, false)

            expect(formatted).not.toContain('(test.jpg)')
        })
    })

    describe('shouldAnnounceError', () => {
        it('should announce high severity errors', () => {
            const error = processError({ code: 'server-error', message: 'Server failed', type: 'network' } as FileError)
            expect(shouldAnnounceError(error)).toBe(true)
        })

        it('should announce critical errors', () => {
            const error = processError('Critical system failure')
            error.severity = 'critical'
            expect(shouldAnnounceError(error)).toBe(true)
        })

        it('should announce non-recoverable errors', () => {
            const error = processError({ code: 'permission-denied', message: 'Access denied', type: 'permission' } as FileError)
            expect(shouldAnnounceError(error)).toBe(true)
        })

        it('should not announce low severity recoverable errors', () => {
            const error = processError({ code: 'file-too-small', message: 'File too small', type: 'size' } as FileError)
            expect(shouldAnnounceError(error)).toBe(false)
        })
    })

    describe('createErrorAnnouncement', () => {
        it('should create announcement for critical error', () => {
            const error = processError('System failure')
            error.severity = 'critical'
            error.title = 'Critical System Error'
            error.userMessage = 'System has encountered a critical error.'

            const announcement = createErrorAnnouncement(error)

            expect(announcement).toBe('Critical error: Critical System Error. System has encountered a critical error.')
        })

        it('should create announcement for high severity error', () => {
            const error = processError('Network failure')
            error.severity = 'high'
            error.title = 'Network Error'
            error.userMessage = 'Unable to connect to server.'

            const announcement = createErrorAnnouncement(error)

            expect(announcement).toBe('Error: Network Error. Unable to connect to server.')
        })

        it('should create announcement for medium severity error', () => {
            const error = processError('Validation failed')
            error.severity = 'medium'
            error.title = 'Validation Error'
            error.userMessage = 'File validation failed.'

            const announcement = createErrorAnnouncement(error)

            expect(announcement).toBe('Validation Error. File validation failed.')
        })
    })

    describe('logError', () => {
        it('should log critical errors with console.error', () => {
            const error = processError('Critical failure')
            error.severity = 'critical'

            logError(error)

            expect(mockConsole.error).toHaveBeenCalledWith(
                'Critical FileUpload Error:',
                expect.objectContaining({
                    errorId: error.id,
                    type: error.type,
                    severity: 'critical'
                })
            )
        })

        it('should log high severity errors with console.error', () => {
            const error = processError('High severity error')
            error.severity = 'high'

            logError(error)

            expect(mockConsole.error).toHaveBeenCalledWith(
                'FileUpload Error:',
                expect.objectContaining({
                    severity: 'high'
                })
            )
        })

        it('should log medium/low severity errors with console.warn', () => {
            const error = processError('Medium severity error')
            error.severity = 'medium'

            logError(error)

            expect(mockConsole.warn).toHaveBeenCalledWith(
                'FileUpload Warning:',
                expect.objectContaining({
                    severity: 'medium'
                })
            )
        })

        it('should include additional context in log', () => {
            const error = processError('Test error')
            const additionalContext = { userId: '123', sessionId: 'abc' }

            logError(error, additionalContext)

            expect(mockConsole.warn).toHaveBeenCalledWith(
                'FileUpload Warning:',
                expect.objectContaining({
                    userId: '123',
                    sessionId: 'abc'
                })
            )
        })
    })

    describe('Error type detection', () => {
        it('should detect network errors', () => {
            const networkError = new Error('fetch failed')
            const result = processError(networkError)
            expect(result.type).toBe('network')
        })

        it('should detect timeout errors', () => {
            const timeoutError = new Error('Request timeout')
            const result = processError(timeoutError)
            expect(result.type).toBe('timeout')
        })

        it('should detect permission errors', () => {
            const permissionError = new Error('Access denied')
            const result = processError(permissionError)
            expect(result.type).toBe('permission')
        })

        it('should detect quota errors', () => {
            const quotaError = new Error('Storage quota exceeded')
            const result = processError(quotaError)
            expect(result.type).toBe('quota')
        })
    })

    describe('Edge cases', () => {
        it('should handle null/undefined errors gracefully', () => {
            const result = processError(null as any)
            expect(result.code).toBe('unknown-error')
            expect(result.technicalMessage).toBe('Unknown error occurred')
        })

        it('should handle errors without message', () => {
            const error = new Error()
            const result = processError(error)
            expect(result.technicalMessage).toBe('')
        })

        it('should handle malformed FileError objects', () => {
            const malformedError = { code: 'test' } as FileError
            const result = processError(malformedError)
            expect(result.code).toBe('test')
        })
    })
})