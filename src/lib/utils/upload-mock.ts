// Mock upload functionality - will be implemented in later tasks

export const mockUpload = async (file: File, onProgress?: (progress: number) => void): Promise<void> => {
    // Placeholder implementation
    return new Promise((resolve) => {
        setTimeout(() => {
            if (onProgress) onProgress(100)
            resolve()
        }, 1000)
    })
}