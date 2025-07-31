import React from 'react'
import type { FileUploadProps } from './file-upload.types'

export const FileUpload: React.FC<FileUploadProps> = ({
    variant = 'button',
    size = 'md',
    radius = 'md',
    disabled = false,
    multiple = false,
    accept,
    maxSize,
    maxFiles,
    onUpload,
    onError,
    config,
    className,
    children,
    ...props
}) => {
    // Placeholder implementation - will be expanded in later tasks
    return (
        <div className={`file-upload file-upload--${variant} file-upload--${size} ${className || ''}`}>
            <input
                type="file"
                multiple={multiple}
                accept={accept}
                disabled={disabled}
                {...props}
            />
            {children}
        </div>
    )
}

FileUpload.displayName = 'FileUpload'