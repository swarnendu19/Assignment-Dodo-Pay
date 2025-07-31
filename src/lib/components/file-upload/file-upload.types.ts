import { ReactNode } from 'react'

export interface FileUploadProps {
    variant?: 'button' | 'dropzone' | 'preview' | 'image-only' | 'multi-file'
    size?: 'sm' | 'md' | 'lg'
    radius?: 'none' | 'sm' | 'md' | 'lg' | 'full'
    disabled?: boolean
    multiple?: boolean
    accept?: string
    maxSize?: number
    maxFiles?: number
    onUpload?: (files: File[]) => Promise<void>
    onError?: (error: string) => void
    config?: FileUploadConfig
    className?: string
    children?: ReactNode
}

export interface FileUploadConfig {
    defaults: {
        variant: string
        size: string
        radius: string
        multiple: boolean
    }
    validation: {
        maxSize: number
        maxFiles: number
        allowedTypes: string[]
    }
    styling: {
        theme: 'light' | 'dark' | 'auto'
        colors: {
            primary: string
            secondary: string
            success: string
            error: string
        }
        spacing: {
            padding: string
            margin: string
        }
    }
    labels: {
        uploadText: string
        dragText: string
        errorText: string
        successText: string
    }
    features: {
        dragAndDrop: boolean
        preview: boolean
        progress: boolean
        multipleFiles: boolean
    }
}

export interface FileUploadState {
    files: UploadFile[]
    isUploading: boolean
    progress: number
    error: string | null
    isDragOver: boolean
}

export interface UploadFile {
    id: string
    file: File
    status: 'pending' | 'uploading' | 'success' | 'error'
    progress: number
    preview?: string
    error?: string
}