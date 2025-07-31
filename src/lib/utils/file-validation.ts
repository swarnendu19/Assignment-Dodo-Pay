// File validation utilities - will be implemented in later tasks

export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
    // Placeholder implementation
    return true
}

export const validateFileSize = (file: File, maxSize: number): boolean => {
    // Placeholder implementation
    return file.size <= maxSize
}

export const validateFileCount = (files: File[], maxFiles: number): boolean => {
    // Placeholder implementation
    return files.length <= maxFiles
}