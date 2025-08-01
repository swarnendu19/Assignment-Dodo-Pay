import React, { useRef, useState } from 'react'
import { useFileUpload } from '../file-upload-context'

interface DropzoneUploadProps {
    className?: string
    style?: React.CSSProperties
    ariaLabel?: string
    ariaDescribedBy?: string
    onDragEnter?: (event: React.DragEvent) => void
    onDragLeave?: (event: React.DragEvent) => void
    onDragOver?: (event: React.DragEvent) => void
    onDrop?: (event: React.DragEvent) => void
    children?: React.ReactNode
}

export const DropzoneUpload: React.FC<DropzoneUploadProps> = ({
    className,
    style,
    ariaLabel,
    ariaDescribedBy,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
    children
}) => {
    const { config, actions, state } = useFileUpload()
    const inputRef = useRef<HTMLInputElement>(null)
    const [isDragOver, setIsDragOver] = useState(false)

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || [])
        if (files.length > 0) {
            actions.selectFiles(files)
        }
    }

    const handleClick = () => {
        inputRef.current?.click()
    }

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            handleClick()
        }
    }

    const handleDragEnter = (event: React.DragEvent) => {
        event.preventDefault()
        event.stopPropagation()
        setIsDragOver(true)
        onDragEnter?.(event)
    }

    const handleDragLeave = (event: React.DragEvent) => {
        event.preventDefault()
        event.stopPropagation()
        setIsDragOver(false)
        onDragLeave?.(event)
    }

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault()
        event.stopPropagation()
        onDragOver?.(event)
    }

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault()
        event.stopPropagation()
        setIsDragOver(false)

        const files = Array.from(event.dataTransfer.files)
        if (files.length > 0) {
            actions.selectFiles(files)
        }

        onDrop?.(event)
    }

    const dropzoneClasses = [
        'file-upload-dropzone',
        `file-upload-dropzone--${config.defaults.size}`,
        `file-upload-dropzone--${config.defaults.radius}`,
        config.defaults.disabled ? 'file-upload-dropzone--disabled' : '',
        state.isUploading ? 'file-upload-dropzone--uploading' : '',
        isDragOver ? 'file-upload-dropzone--drag-over' : '',
        className || ''
    ].filter(Boolean).join(' ')

    return (
        <div className="file-upload file-upload--dropzone" style={style}>
            <input
                ref={inputRef}
                type="file"
                multiple={config.defaults.multiple}
                accept={config.defaults.accept}
                disabled={config.defaults.disabled || state.isUploading}
                onChange={handleFileSelect}
                className="file-upload-input"
                style={{ display: 'none' }}
                aria-hidden="true"
            />

            <div
                className={dropzoneClasses}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                onDragEnter={config.features.dragAndDrop ? handleDragEnter : undefined}
                onDragLeave={config.features.dragAndDrop ? handleDragLeave : undefined}
                onDragOver={config.features.dragAndDrop ? handleDragOver : undefined}
                onDrop={config.features.dragAndDrop ? handleDrop : undefined}
                role="button"
                tabIndex={config.defaults.disabled || state.isUploading ? -1 : 0}
                aria-label={ariaLabel || (isDragOver ? config.labels.dropText : config.labels.dragText)}
                aria-describedby={ariaDescribedBy}
                style={{
                    border: `2px dashed ${isDragOver ? config.styling.colors.primary : config.styling.colors.border}`,
                    borderRadius: config.styling.spacing.borderRadius,
                    padding: '2rem',
                    textAlign: 'center',
                    cursor: config.defaults.disabled || state.isUploading ? 'not-allowed' : 'pointer',
                    backgroundColor: isDragOver ? `${config.styling.colors.primary}10` : config.styling.colors.background,
                    color: config.styling.colors.foreground,
                    fontSize: config.styling.typography.fontSize,
                    transition: config.animations.enabled ? `all ${config.animations.duration}ms ${config.animations.easing}` : 'none',
                    opacity: config.defaults.disabled || state.isUploading ? 0.6 : 1,
                    minHeight: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: config.styling.spacing.gap
                }}
            >
                {children || (
                    <>
                        <div className="file-upload-dropzone-icon" style={{
                            fontSize: '2rem',
                            color: isDragOver ? config.styling.colors.primary : config.styling.colors.muted
                        }}>
                            📁
                        </div>

                        <div className="file-upload-dropzone-text">
                            <div className="file-upload-dropzone-primary-text" style={{
                                fontWeight: '600',
                                marginBottom: '0.5rem',
                                color: isDragOver ? config.styling.colors.primary : config.styling.colors.foreground
                            }}>
                                {isDragOver ? config.labels.dropText : config.labels.dragText}
                            </div>

                            <div className="file-upload-dropzone-secondary-text" style={{
                                fontSize: '0.875rem',
                                color: config.styling.colors.muted
                            }}>
                                or <span style={{ color: config.styling.colors.primary, textDecoration: 'underline' }}>
                                    {config.labels.browseText}
                                </span> to choose files
                            </div>
                        </div>

                        {state.files.length > 0 && (
                            <div className="file-upload-dropzone-count" style={{
                                fontSize: '0.875rem',
                                color: config.styling.colors.primary,
                                fontWeight: '500'
                            }}>
                                {state.files.length} {state.files.length === 1 ? 'file' : 'files'} selected
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Display selected files */}
            {state.files.length > 0 && (
                <div className="file-upload-files" style={{ marginTop: config.styling.spacing.margin }}>
                    {state.files.map(file => (
                        <div key={file.id} className="file-upload-file-item" style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.75rem',
                            border: `1px solid ${config.styling.colors.border}`,
                            borderRadius: config.styling.spacing.borderRadius,
                            marginBottom: '0.5rem',
                            backgroundColor: config.styling.colors.background
                        }}>
                            <div className="file-upload-file-info">
                                <div className="file-upload-file-name" style={{
                                    fontWeight: '500',
                                    color: config.styling.colors.foreground
                                }}>
                                    {file.name}
                                </div>
                                <div className="file-upload-file-size" style={{
                                    fontSize: '0.75rem',
                                    color: config.styling.colors.muted
                                }}>
                                    {(file.size / 1024).toFixed(1)} KB
                                </div>
                            </div>

                            <div className="file-upload-file-actions" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                {file.status === 'uploading' && (
                                    <div className="file-upload-progress" style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <div style={{
                                            width: '60px',
                                            height: '4px',
                                            backgroundColor: config.styling.colors.border,
                                            borderRadius: '2px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: `${file.progress}%`,
                                                height: '100%',
                                                backgroundColor: config.styling.colors.primary,
                                                transition: 'width 0.3s ease'
                                            }} />
                                        </div>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            color: config.styling.colors.primary,
                                            minWidth: '35px'
                                        }}>
                                            {file.progress}%
                                        </span>
                                    </div>
                                )}

                                {file.status === 'success' && (
                                    <span style={{
                                        color: config.styling.colors.success,
                                        fontSize: '1.25rem'
                                    }}>
                                        ✓
                                    </span>
                                )}

                                {file.status === 'error' && (
                                    <button
                                        type="button"
                                        onClick={() => actions.retryUpload(file.id)}
                                        className="file-upload-retry-button"
                                        style={{
                                            background: 'none',
                                            border: `1px solid ${config.styling.colors.error}`,
                                            color: config.styling.colors.error,
                                            cursor: 'pointer',
                                            fontSize: '0.75rem',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '0.25rem'
                                        }}
                                        aria-label={`${config.labels.retryText} ${file.name}`}
                                    >
                                        {config.labels.retryText}
                                    </button>
                                )}

                                {file.status === 'pending' && (
                                    <button
                                        type="button"
                                        onClick={() => actions.removeFile(file.id)}
                                        className="file-upload-remove-button"
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: config.styling.colors.error,
                                            cursor: 'pointer',
                                            fontSize: '1.25rem',
                                            padding: '0.25rem'
                                        }}
                                        aria-label={`${config.labels.removeText} ${file.name}`}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Upload button */}
                    {state.files.some(f => f.status === 'pending') && (
                        <button
                            type="button"
                            onClick={actions.uploadFiles}
                            disabled={state.isUploading}
                            className="file-upload-upload-button"
                            style={{
                                backgroundColor: config.styling.colors.primary,
                                color: config.styling.colors.background,
                                padding: '0.75rem 1.5rem',
                                border: 'none',
                                borderRadius: config.styling.spacing.borderRadius,
                                cursor: state.isUploading ? 'not-allowed' : 'pointer',
                                opacity: state.isUploading ? 0.6 : 1,
                                fontSize: config.styling.typography.fontSize,
                                fontWeight: '500',
                                width: '100%',
                                marginTop: '1rem'
                            }}
                        >
                            {state.isUploading ? config.labels.progressText : 'Upload Files'}
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

DropzoneUpload.displayName = 'DropzoneUpload'