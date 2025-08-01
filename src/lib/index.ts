// Main library exports
export { FileUpload } from './components/file-upload'

// Core types
export type {
    FileUploadProps,
    FileUploadConfig,
    UploadFile,
    FileUploadState,
    FileUploadVariant,
    FileUploadSize,
    FileUploadRadius,
    FileUploadTheme,
    FileUploadStatus,
    RejectedFile,
    FileError,
    FileMetadata,
    FileChunk,
    DeepPartial,
    ConfigurationSource,
    ConfigMergeResult,
    FileUploadEvent,
    FileUploadEventHandlers,
    FileUploadContextValue,
    FileValidationResult,
    BatchValidationResult,
    UploadServiceConfig,
    UploadResponse,
    ThemeVariables,
    ResponsiveConfig,
    ButtonUploadProps,
    DropzoneUploadProps,
    PreviewUploadProps,
    ImageUploadProps,
    MultiFileUploadProps
} from './components/file-upload/file-upload.types'

// Configuration exports
export {
    defaultConfig,
    configSchema,
    validateConfig,
    mergeConfig,
    loadConfigFromJSON
} from './config/schema'

export type {
    ValidationResult,
    ValidationError
} from './config/schema'

// Configuration utilities
export {
    deepMerge,
    mergeConfigurations,
    loadConfiguration,
    createConfigPreset,
    getConfigurationErrors,
    generateTypeDefinitions,
    configToCSSProperties,
    diffConfigurations
} from './config/utils'

// Upload mock utilities
export {
    MockUploadService,
    mockUploadService,
    mockUpload,
    mockUploadMultiple,
    createUploadFile,
    updateUploadFileStatus
} from './utils/upload-mock'

export type {
    MockUploadConfig
} from './utils/upload-mock'