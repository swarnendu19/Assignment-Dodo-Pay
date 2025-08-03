// Component exports for tree-shaking
export { FileUpload } from './file-upload'

// Individual variant exports
export { ButtonUpload } from './file-upload/variants/button-upload'
export { DropzoneUpload } from './file-upload/variants/dropzone-upload'
export { PreviewUpload } from './file-upload/variants/preview-upload'
export { ImageUpload } from './file-upload/variants/image-upload'
export { MultiFileUpload } from './file-upload/variants/multi-file-upload'

// Context and providers
export { FileUploadProvider, useFileUpload } from './file-upload/file-upload-context'
export { ThemeProvider, useTheme, useThemeVariables, ThemeToggle } from './theme-provider'

// Progress and feedback components
export { ProgressBar } from './file-upload/progress/progress-bar'
export { LoadingSpinner } from './file-upload/progress/loading-spinner'
export { StatusIndicator } from './file-upload/progress/status-indicator'
export { OverallProgress } from './file-upload/progress/overall-progress'
export { UploadFeedback } from './file-upload/feedback/upload-feedback'
export { ErrorFeedback } from './file-upload/feedback/error-feedback'

// Utility components
export { FileUploadErrorBoundary as ErrorBoundary, withErrorBoundary } from './file-upload/error-boundary'
export { ErrorDisplay } from './file-upload/error-display'
export { AccessibilityAnnouncer } from './file-upload/accessibility-announcer'

// Types
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
    ButtonUploadProps,
    DropzoneUploadProps,
    PreviewUploadProps,
    ImageUploadProps,
    MultiFileUploadProps
} from './file-upload/file-upload.types'