import { describe, it } from 'vitest'

describe('Debug Import', () => {
    it('should show what is imported', async () => {
        try {
            const mockModule = await import('./src/lib/utils/upload-mock')
            console.log('Imported module keys:', Object.keys(mockModule))
            console.log('MockUploadService:', typeof mockModule.MockUploadService)
            console.log('mockUpload:', typeof mockModule.mockUpload)
            console.log('createUploadFile:', typeof mockModule.createUploadFile)
        } catch (error) {
            console.error('Import error:', error)
        }
    })
})