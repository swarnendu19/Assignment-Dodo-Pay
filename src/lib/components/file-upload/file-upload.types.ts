import { ReactNode } from 'react'
import { ProcessedError } from '../../utils/error-handling'

export type FileUploadVariant = 'button' | 'dropzone' | 'preview' | 'image-only' | 'multi-file'
export type FileUploadSize = 'sm' | 'md' | 'lg'
export type FileUploadRadius = 'none' | 'sm' | 'md' | 'lg' | 'full'
export type FileUploadTheme = 'light' | 'dark' | 'auto'
export type FileUploadStatus = 'pending' | 'uploading' | 'success' | 'error'

export interface FileUploadProps {
    // Core variant and behavior props
    variant?: FileUploadVariant
    size?: FileUploadSize
    radius?: FileUploadRadius
    disabled?: boolean
    multiple?: boolean
    accept?: string
    maxSize?: number
    maxFiles?: number

    // Styling and theming props
    theme?: FileUploadTheme
    className?: string
    style?: React.CSSProperties

    // Icon and content customization
    icon?: ReactNode
    iconPlacement?: 'left' | 'right' | 'top' | 'bottom'
    placeholder?: string

    // Border and visual styling
    borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none'
    borderWidth?: 'thin' | 'medium' | 'thick'

    // Event handlers
    onUpload?: (files: File[]) => Promise<void>
    onError?: (error: string) => void
    onProgress?: (progress: number, file?: UploadFile) => void
    onFileSelect?: (files: File[]) => void
    onFileRemove?: (fileId: string) => void
    onDragEnter?: (event: React.DragEvent) => void
    onDragLeave?: (event: React.DragEvent) => void
    onDragOver?: (event: React.DragEvent) => void
    onDrop?: (event: React.DragEvent) => void

    // Configuration
    config?: FileUploadConfig | string // Can be config object or path to JSON file

    // Accessibility
    ariaLabel?: string
    ariaDescribedBy?: string

    // Content and children
    children?: ReactNode
}

export interface FileUploadConfig {
    defaults: {
        variant: FileUploadVariant
        size: FileUploadSize
        radius: FileUploadRadius
        theme: FileUploadTheme
        multiple: boolean
        disabled: boolean
        accept: string
        maxSize: number
        maxFiles: number
    }
    validation: {
        maxSize: number
        maxFiles: number
        allowedTypes: string[]
        allowedExtensions: string[]
        minSize?: number
        validateDimensions?: boolean
        maxWidth?: number
        maxHeight?: number
        minWidth?: number
        minHeight?: number
    }
    styling: {
        theme: FileUploadTheme
        colors: {
            primary: string
            secondary: string
            success: string
            error: string
            warning: string
            background: string
            foreground: string
            border: string
            muted: string
        }
        spacing: {
            padding: string
            margin: string
            gap: string
            borderRadius: string
        }
        typography: {
            fontSize: string
            fontWeight: string
            lineHeight: string
        }
        borders: {
            width: string
            style: 'solid' | 'dashed' | 'dotted' | 'none'
            color: string
        }
        shadows: {
            sm: string
            md: string
            lg: string
        }
    }
    labels: {
        uploadText: string
        dragText: string
        dropText: string
        browseText: string
        errorText: string
        successText: string
        progressText: string
        removeText: string
        retryText: string
        cancelText: string
        selectFilesText: string
        maxSizeText: string
        invalidTypeText: string
        tooManyFilesText: string
    }
    features: {
        dragAndDrop: boolean
        preview: boolean
        progress: boolean
        multipleFiles: boolean
        removeFiles: boolean
        retryFailed: boolean
        showFileSize: boolean
        showFileType: boolean
        autoUpload: boolean
        chunkedUpload: boolean
        resumableUpload: boolean
    }
    animations: {
        enabled: boolean
        duration: number
        easing: string
    }
    accessibility: {
        announceFileSelection: boolean
        announceProgress: boolean
        announceErrors: boolean
        keyboardNavigation: boolean
        focusManagement: boolean
    }
}

export interface FileUploadState {
    files: UploadFile[]
    isUploading: boolean
    progress: number
    overallProgress: number
    error: string | null
    isDragOver: boolean
    isDropValid: boolean
    selectedFiles: File[]
    rejectedFiles: RejectedFile[]
    uploadQueue: string[]
    completedUploads: string[]
    failedUploads: string[]
}

export interface UploadFile {
    id: string
    file: File
    status: FileUploadStatus
    progress: number
    preview?: string
    error?: string
    uploadedAt?: Date
    startedAt?: Date
    completedAt?: Date
    size: number
    type: string
    name: string
    lastModified: number
    url?: string
    thumbnailUrl?: string
    metadata?: FileMetadata
    chunks?: FileChunk[]
    retryCount: number
    maxRetries: number
}

export interface RejectedFile {
    file: File
    errors: FileError[]
}

export interface FileError {
    code: string
    message: string
    type: 'size' | 'type' | 'count' | 'dimensions' | 'network' | 'validation'
}

export interface FileMetadata {
    width?: number
    height?: number
    duration?: number
    bitrate?: number
    format?: string
    colorSpace?: string
    hasAudio?: boolean
    hasVideo?: boolean
    exif?: Record<string, any>
}

export interface FileChunk {
    id: string
    index: number
    start: number
    end: number
    size: number
    status: 'pending' | 'uploading' | 'success' | 'error'
    progress: number
    retryCount: number
}
// Utility types for configuration
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type ConfigurationSource = 'default' | 'file' | 'props'

export interface ConfigMergeResult {
    config: FileUploadConfig
    sources: Record<string, ConfigurationSource>
    warnings: string[]
}

// Event types for file upload operations
export interface FileUploadEvent {
    type: 'select' | 'upload' | 'progress' | 'success' | 'error' | 'remove' | 'retry'
    files: UploadFile[]
    timestamp: Date
    metadata?: Record<string, any>
}

export interface FileUploadEventHandlers {
    onFileSelect?: (event: FileUploadEvent) => void
    onUploadStart?: (event: FileUploadEvent) => void
    onUploadProgress?: (event: FileUploadEvent) => void
    onUploadSuccess?: (event: FileUploadEvent) => void
    onUploadError?: (event: FileUploadEvent) => void
    onFileRemove?: (event: FileUploadEvent) => void
    onUploadRetry?: (event: FileUploadEvent) => void
}

// Context types for component state management
export interface FileUploadContextValue {
    state: FileUploadState
    config: FileUploadConfig
    processedErrors: ProcessedError[]
    actions: {
        selectFiles: (files: File[]) => void
        removeFile: (fileId: string) => void
        retryUpload: (fileId: string) => void
        clearAll: () => void
        uploadFiles: () => Promise<void>
        updateProgress: (fileId: string, progress: number) => void
        setError: (fileId: string, error: string) => void
        setSuccess: (fileId: string) => void
        handleError: (error: Error | string, context?: {
            fileName?: string
            fileId?: string
            operation?: string
        }) => ProcessedError | null
        handleValidationErrors: (errors: (Error | string)[], context?: {
            operation?: string
        }) => ProcessedError[]
        dismissError: (errorId: string) => void
        dismissAllErrors: () => void
        retryFailedUploads: () => void
        clearFailedUploads: () => void
    }
    handlers: FileUploadEventHandlers
}

// Validation result types
export interface FileValidationResult {
    isValid: boolean
    errors: FileError[]
    warnings: string[]
}

export interface BatchValidationResult {
    validFiles: File[]
    rejectedFiles: RejectedFile[]
    totalSize: number
    warnings: string[]
}

// Upload service types
export interface UploadServiceConfig {
    endpoint?: string
    method?: 'POST' | 'PUT' | 'PATCH'
    headers?: Record<string, string>
    timeout?: number
    retryAttempts?: number
    retryDelay?: number
    chunkSize?: number
    concurrent?: boolean
    maxConcurrent?: number
}

export interface UploadResponse {
    success: boolean
    fileId: string
    url?: string
    thumbnailUrl?: string
    metadata?: FileMetadata
    error?: string
}

// Theme and styling types
export interface ThemeVariables {
    colors: Record<string, string>
    spacing: Record<string, string>
    typography: Record<string, string>
    borders: Record<string, string>
    shadows: Record<string, string>
    animations: Record<string, string>
}

export interface ResponsiveConfig {
    breakpoints: {
        sm: string
        md: string
        lg: string
        xl: string
    }
    variants: {
        mobile: Partial<FileUploadConfig>
        tablet: Partial<FileUploadConfig>
        desktop: Partial<FileUploadConfig>
    }
}

// Component variant props
export interface ButtonUploadProps extends Omit<FileUploadProps, 'variant'> {
    buttonText?: string
    icon?: ReactNode
    iconPosition?: 'left' | 'right'
    asChild?: boolean
}

export interface DropzoneUploadProps extends Omit<FileUploadProps, 'variant'> {
    dropzoneText?: string
    activeDropzoneText?: string
    height?: string | number
    showBorder?: boolean
}

export interface PreviewUploadProps extends Omit<FileUploadProps, 'variant'> {
    previewSize?: 'sm' | 'md' | 'lg'
    showFileInfo?: boolean
    allowReorder?: boolean
}

export interface ImageUploadProps extends Omit<FileUploadProps, 'variant'> {
    aspectRatio?: number
    cropEnabled?: boolean
    resizeEnabled?: boolean
    quality?: number
}

export interface MultiFileUploadProps extends Omit<FileUploadProps, 'variant'> {
    listLayout?: 'grid' | 'list'
    sortable?: boolean
    bulkActions?: boolean
}