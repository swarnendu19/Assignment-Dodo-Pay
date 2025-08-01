import { FileError, FileValidationResult, BatchValidationResult, RejectedFile, FileUploadConfig } from '../components/file-upload/file-upload.types'

/**
 * Utility function to get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
    const lastDotIndex = filename.lastIndexOf('.')
    if (lastDotIndex === -1) return ''
    return filename.substring(lastDotIndex + 1).toLowerCase()
}

/**
 * Validates a single file against type restrictions
 * Supports MIME types, file extensions, and wildcard patterns
 */
export const validateFileType = (
    file: File,
    allowedTypes: string[] = ['*'],
    allowedExtensions: string[] = ['*']
): FileValidationResult => {
    const errors: FileError[] = []
    const warnings: string[] = []

    const fileType = file.type
    const fileName = file.name
    const fileExtension = getFileExtension(fileName)

    // Add warning for files without extensions
    if (!fileExtension && fileName.indexOf('.') === -1) {
        warnings.push('File has no extension, type validation may be unreliable')
    }

    // If wildcard is present, allow all types
    if (allowedTypes.includes('*') && allowedExtensions.includes('*')) {
        return { isValid: true, errors, warnings }
    }

    // Validate MIME types
    if (!allowedTypes.includes('*')) {
        let typeValid = false

        for (const allowedType of allowedTypes) {
            if (allowedType === '*') {
                typeValid = true
                break
            }

            // Support wildcard patterns like "image/*", "video/*"
            if (allowedType.endsWith('/*')) {
                const baseType = allowedType.slice(0, -2)
                if (fileType.startsWith(baseType + '/')) {
                    typeValid = true
                    break
                }
            }

            // Exact MIME type match
            if (fileType === allowedType) {
                typeValid = true
                break
            }
        }

        if (!typeValid) {
            errors.push({
                code: 'invalid-file-type',
                message: `File type "${fileType}" is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
                type: 'type'
            })
        }
    }

    // Validate file extensions
    if (!allowedExtensions.includes('*')) {
        const extensionValid = allowedExtensions.some(ext =>
            ext === '*' || ext.toLowerCase() === fileExtension
        )

        if (!extensionValid) {
            errors.push({
                code: 'invalid-file-extension',
                message: `File extension ".${fileExtension}" is not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`,
                type: 'type'
            })
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    }
}

/**
 * Utility function to format file size in human-readable format
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Validates file size against minimum and maximum limits
 */
export const validateFileSize = (
    file: File,
    maxSize: number,
    minSize: number = 0
): FileValidationResult => {
    const errors: FileError[] = []
    const warnings: string[] = []

    if (file.size > maxSize) {
        errors.push({
            code: 'file-too-large',
            message: `File size ${formatFileSize(file.size)} exceeds maximum allowed size of ${formatFileSize(maxSize)}`,
            type: 'size'
        })
    }

    if (file.size < minSize) {
        errors.push({
            code: 'file-too-small',
            message: `File size ${formatFileSize(file.size)} is below minimum required size of ${formatFileSize(minSize)}`,
            type: 'size'
        })
    }

    // Warning for very large files
    if (file.size > maxSize * 0.8) {
        warnings.push('File is approaching the maximum size limit')
    }

    // Warning for empty files
    if (file.size === 0) {
        warnings.push('File appears to be empty')
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    }
}

/**
 * Validates the number of files against the maximum limit
 */
export const validateFileCount = (
    files: File[],
    maxFiles: number,
    currentFileCount: number = 0
): FileValidationResult => {
    const errors: FileError[] = []
    const warnings: string[] = []
    const totalFiles = files.length + currentFileCount

    if (totalFiles > maxFiles) {
        errors.push({
            code: 'too-many-files',
            message: `Cannot upload ${totalFiles} files. Maximum allowed is ${maxFiles}`,
            type: 'count'
        })
    }

    // Warning when approaching limit
    if (totalFiles > maxFiles * 0.8) {
        warnings.push(`Approaching file limit (${totalFiles}/${maxFiles})`)
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    }
}

/**
 * Validates image dimensions for image files
 */
export const validateImageDimensions = (
    file: File,
    maxWidth?: number,
    maxHeight?: number,
    minWidth?: number,
    minHeight?: number
): Promise<FileValidationResult> => {
    return new Promise((resolve) => {
        const errors: FileError[] = []
        const warnings: string[] = []

        // Only validate image files
        if (!file.type.startsWith('image/')) {
            resolve({ isValid: true, errors, warnings })
            return
        }

        const img = new Image()
        const url = URL.createObjectURL(file)

        img.onload = () => {
            URL.revokeObjectURL(url)

            const { width, height } = img

            if (maxWidth && width > maxWidth) {
                errors.push({
                    code: 'image-width-too-large',
                    message: `Image width ${width}px exceeds maximum allowed width of ${maxWidth}px`,
                    type: 'dimensions'
                })
            }

            if (maxHeight && height > maxHeight) {
                errors.push({
                    code: 'image-height-too-large',
                    message: `Image height ${height}px exceeds maximum allowed height of ${maxHeight}px`,
                    type: 'dimensions'
                })
            }

            if (minWidth && width < minWidth) {
                errors.push({
                    code: 'image-width-too-small',
                    message: `Image width ${width}px is below minimum required width of ${minWidth}px`,
                    type: 'dimensions'
                })
            }

            if (minHeight && height < minHeight) {
                errors.push({
                    code: 'image-height-too-small',
                    message: `Image height ${height}px is below minimum required height of ${minHeight}px`,
                    type: 'dimensions'
                })
            }

            resolve({
                isValid: errors.length === 0,
                errors,
                warnings
            })
        }

        img.onerror = () => {
            URL.revokeObjectURL(url)
            errors.push({
                code: 'invalid-image',
                message: 'Unable to read image file or file is corrupted',
                type: 'validation'
            })
            resolve({ isValid: false, errors, warnings })
        }

        img.src = url
    })
}

/**
 * Comprehensive validation for a single file using configuration
 */
export const validateFile = async (
    file: File,
    config: FileUploadConfig,
    currentFileCount: number = 0
): Promise<FileValidationResult> => {
    const allErrors: FileError[] = []
    const allWarnings: string[] = []

    // Validate file type
    const typeValidation = validateFileType(
        file,
        config.validation.allowedTypes,
        config.validation.allowedExtensions
    )
    allErrors.push(...typeValidation.errors)
    allWarnings.push(...typeValidation.warnings)

    // Validate file size
    const sizeValidation = validateFileSize(
        file,
        config.validation.maxSize,
        config.validation.minSize || 0
    )
    allErrors.push(...sizeValidation.errors)
    allWarnings.push(...sizeValidation.warnings)

    // Validate image dimensions if enabled
    if (config.validation.validateDimensions && file.type.startsWith('image/')) {
        const dimensionValidation = await validateImageDimensions(
            file,
            config.validation.maxWidth,
            config.validation.maxHeight,
            config.validation.minWidth,
            config.validation.minHeight
        )
        allErrors.push(...dimensionValidation.errors)
        allWarnings.push(...dimensionValidation.warnings)
    }

    return {
        isValid: allErrors.length === 0,
        errors: allErrors,
        warnings: allWarnings
    }
}

/**
 * Validates multiple files and returns separated valid/rejected files
 */
export const validateFiles = async (
    files: File[],
    config: FileUploadConfig,
    currentFileCount: number = 0
): Promise<BatchValidationResult> => {
    const validFiles: File[] = []
    const rejectedFiles: RejectedFile[] = []
    const allWarnings: string[] = []
    let totalSize = 0

    // First validate file count
    const countValidation = validateFileCount(files, config.validation.maxFiles, currentFileCount)
    if (!countValidation.isValid) {
        // If too many files, reject all files
        const countError = countValidation.errors[0]
        rejectedFiles.push(...files.map(file => ({
            file,
            errors: [countError]
        })))

        return {
            validFiles: [],
            rejectedFiles,
            totalSize: 0,
            warnings: countValidation.warnings
        }
    }

    allWarnings.push(...countValidation.warnings)

    // Validate each file individually
    for (const file of files) {
        const validation = await validateFile(file, config, currentFileCount + validFiles.length)

        if (validation.isValid) {
            validFiles.push(file)
            totalSize += file.size
        } else {
            rejectedFiles.push({
                file,
                errors: validation.errors
            })
        }

        allWarnings.push(...validation.warnings)
    }

    return {
        validFiles,
        rejectedFiles,
        totalSize,
        warnings: allWarnings
    }
}

/**
 * Utility function to check if file is an image
 */
export const isImageFile = (file: File): boolean => {
    return file.type.startsWith('image/')
}

/**
 * Utility function to check if file is a video
 */
export const isVideoFile = (file: File): boolean => {
    return file.type.startsWith('video/')
}

/**
 * Utility function to check if file is an audio file
 */
export const isAudioFile = (file: File): boolean => {
    return file.type.startsWith('audio/')
}

/**
 * Utility function to check if file is a document
 */
export const isDocumentFile = (file: File): boolean => {
    const documentTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'text/csv',
        'application/rtf'
    ]

    return documentTypes.includes(file.type)
}

/**
 * Creates a validation error with consistent formatting
 */
export const createValidationError = (
    code: string,
    message: string,
    type: FileError['type']
): FileError => {
    return { code, message, type }
}

/**
 * Validates accept attribute format (for HTML input compatibility)
 */
export const validateAcceptAttribute = (accept: string): boolean => {
    if (!accept || accept === '*') return true

    // Split by comma and validate each part
    const parts = accept.split(',').map(part => part.trim())

    for (const part of parts) {
        // Valid formats: .ext, mime/type, mime/*
        if (part.startsWith('.')) {
            // File extension - allow alphanumeric characters
            if (!/^\.[a-zA-Z0-9]+$/.test(part)) return false
        } else if (part.includes('/')) {
            // MIME type - basic validation for type/subtype format
            const [type, subtype] = part.split('/')
            if (!type || !subtype) return false
            // Allow alphanumeric, hyphens, and wildcards
            if (!/^[a-zA-Z0-9\-]+$/.test(type)) return false
            if (!/^[a-zA-Z0-9\-*]+$/.test(subtype)) return false
        } else {
            return false
        }
    }

    return true
}