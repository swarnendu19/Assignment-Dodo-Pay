// Utility exports for tree-shaking
export {
    validateFile,
    validateFiles,
    formatFileSize,
    getFileExtension,
    isImageFile,
    isVideoFile,
    isAudioFile,
    isDocumentFile,
    createValidationError,
    validateFileSize,
    validateFileType,
    validateFileCount,
    validateImageDimensions,
    validateAcceptAttribute
} from './file-validation'

export {
    generateThemeClasses,
    applyTheme,
    getSystemTheme,
    resolveTheme,
    createThemeWatcher,
    generateCSSVariables,
    cn,
    getResponsiveClasses,
    validateThemeConfig
} from './theme'

export {
    processError,
    processErrors,
    formatErrorForUser,
    shouldAnnounceError,
    createErrorAnnouncement,
    logError
} from './error-handling'

export type {
    ErrorType,
    ErrorContext,
    ProcessedError,
    ErrorAction
} from './error-handling'

// Upload mock utilities - temporarily commented out due to module resolution issues
// export {
//     MockUploadService,
//     mockUploadService,
//     mockUpload,
//     mockUploadMultiple,
//     createUploadFile,
//     updateUploadFileStatus
// } from './upload-mock'

// export type {
//     MockUploadConfig,
//     UploadServiceConfig,
//     UploadResponse
// } from './upload-mock'