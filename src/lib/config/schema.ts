import { FileUploadConfig } from '../components/file-upload/file-upload.types'

export const defaultConfig: FileUploadConfig = {
    defaults: {
        variant: 'button',
        size: 'md',
        radius: 'md',
        multiple: false
    },
    validation: {
        maxSize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5,
        allowedTypes: ['*']
    },
    styling: {
        theme: 'auto',
        colors: {
            primary: '#3b82f6',
            secondary: '#6b7280',
            success: '#10b981',
            error: '#ef4444'
        },
        spacing: {
            padding: '1rem',
            margin: '0.5rem'
        }
    },
    labels: {
        uploadText: 'Choose files to upload',
        dragText: 'Drag and drop files here',
        errorText: 'Upload failed',
        successText: 'Upload successful'
    },
    features: {
        dragAndDrop: true,
        preview: true,
        progress: true,
        multipleFiles: false
    }
}

// JSON Schema for validation (will be used in later tasks)
export const configSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
        defaults: {
            type: 'object',
            properties: {
                variant: { enum: ['button', 'dropzone', 'preview', 'image-only', 'multi-file'] },
                size: { enum: ['sm', 'md', 'lg'] },
                radius: { enum: ['none', 'sm', 'md', 'lg', 'full'] },
                multiple: { type: 'boolean' }
            }
        },
        validation: {
            type: 'object',
            properties: {
                maxSize: { type: 'number' },
                maxFiles: { type: 'number' },
                allowedTypes: { type: 'array', items: { type: 'string' } }
            }
        }
    }
}