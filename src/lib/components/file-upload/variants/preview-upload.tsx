import React, { useRef } from 'react'
import { useFileUpload } from '../file-upload-context'

interface PreviewUploadProps {
    className?: string
    style?: React.CSSProperties
    ariaLabel?: string
    ariaDescribedBy?: string
    children?: React.ReactNode
}

export const PreviewUpload: React.FC<PreviewUploadProps> = ({
    className,
    style,
    ariaLabel,
    ariaDescribedBy,
    children
}) => {
    const { config, actions, state } = useFileUpload()
    const inputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || [])
        if (files.length > 0) {
            actions.selectFiles(files)
        }
    }

    const handleButtonClick = () => {
        inputRef.current?.click()
    }

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            handleButtonClick()
        }
    }

    const getFilePreview = (file: File): string => {
        if (file.type.startsWith('image/')) {
            return URL.createObjectURL(file)
        }
        return ''
    }

    const getFileIcon = (file: File): string => {
        if (file.type.startsWith('image/')) return '🖼️'
        if (file.type.startsWith('video/')) return '🎥'
        if (file.type.startsWith('audio/')) return '🎵'
        if (file.type.includes('pdf')) return '📄'
        if (file.type.includes('text')) return '📝'
        if (file.type.includes('zip') || file.type.includes('archive')) return '📦'
        return '📁'
    }

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    return (
        <div className={`file-upload file-upload--preview ${className || ''}`} style={style}>
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

            {/* Upload Button */}
            <button
                type="button"
                onClick={handleButtonClick}
                onKeyDown={handleKeyDown}
                disabled={config.defaults.disabled || state.isUploading}
                aria-label={ariaLabel || config.labels.selectFilesText}
                aria-describedby={ariaDescribedBy}
                style={{
                    backgroundColor: config.styling.colors.primary,
                    color: config.styling.colors.background,
                    padding: config.styling.spacing.padding,
                    borderRadius: config.styling.spacing.borderRadius,
                    border: `${config.styling.borders.width} ${config.styling.borders.style} ${config.styling.borders.color}`,
                    fontSize: config.styling.typography.fontSize,
                    fontWeight: config.styling.typography.fontWeight,
                    cursor: config.defaults.disabled || state.isUploading ? 'not-allowed' : 'pointer',
                    opacity: config.defaults.disabled || state.isUploading ? 0.6 : 1,
                    marginBottom: state.files.length > 0 ? config.styling.spacing.margin : '0'
                }}
            >
                {children || (
                    <>
                        {state.isUploading ? config.labels.progressText : config.labels.selectFilesText}
                        {state.files.length > 0 && (
                            <span className="file-upload-count">
                                {' '}({state.files.length} {state.files.length === 1 ? 'file' : 'files'})
                            </span>
                        )}
                    </>
                )}
            </button>

            {/* File Previews */}
            {state.files.length > 0 && (
                <div className="file-upload-previews" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: config.styling.spacing.gap,
                    marginTop: config.styling.spacing.margin
                }}>
                    {state.files.map(file => {
                        const preview = getFilePreview(file.file)
                        const icon = getFileIcon(file.file)

                        return (
                            <div key={file.id} className="file-upload-preview-item" style={{
                                border: `1px solid ${config.styling.colors.border}`,
                                borderRadius: config.styling.spacing.borderRadius,
                                padding: '1rem',
                                backgroundColor: config.styling.colors.background,
                                position: 'relative'
                            }}>
                                {/* Preview Image or Icon */}
                                <div className="file-upload-preview-media" style={{
                                    width: '100%',
                                    height: '120px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: config.styling.colors.muted + '20',
                                    borderRadius: config.styling.spacing.borderRadius,
                                    marginBottom: '0.75rem',
                                    overflow: 'hidden'
                                }}>
                                    {preview ? (
                                        <img
                                            src={preview}
                                            alt={file.name}
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '100%',
                                                objectFit: 'cover',
                                                borderRadius: config.styling.spacing.borderRadius
                                            }}
                                            onLoad={() => {
                                                // Clean up object URL to prevent memory leaks
                                                if (preview.startsWith('blob:')) {
                                                    setTimeout(() => URL.revokeObjectURL(preview), 1000)
                                                }
                                            }}
                                        />
                                    ) : (
                                        <span style={{
                                            fontSize: '2.5rem',
                                            opacity: 0.7
                                        }}>
                                            {icon}
                                        </span>
                                    )}
                                </div>

                                {/* File Info */}
                                <div className="file-upload-preview-info">
                                    <div className="file-upload-preview-name" style={{
                                        fontWeight: '500',
                                        fontSize: '0.875rem',
                                        color: config.styling.colors.foreground,
                                        marginBottom: '0.25rem',
                                        wordBreak: 'break-word',
                                        lineHeight: '1.2'
                                    }}>
                                        {file.name}
                                    </div>

                                    <div className="file-upload-preview-size" style={{
                                        fontSize: '0.75rem',
                                        color: config.styling.colors.muted,
                                        marginBottom: '0.5rem'
                                    }}>
                                        {formatFileSize(file.size)}
                                    </div>

                                    {/* Progress Bar */}
                                    {file.status === 'uploading' && (
                                        <div className="file-upload-preview-progress" style={{
                                            marginBottom: '0.5rem'
                                        }}>
                                            <div style={{
                                                width: '100%',
                                                height: '4px',
                                                backgroundColor: config.styling.colors.border,
                                                borderRadius: '2px',
                                                overflow: 'hidden',
                                                marginBottom: '0.25rem'
                                            }}>
                                                <div style={{
                                                    width: `${file.progress}%`,
                                                    height: '100%',
                                                    backgroundColor: config.styling.colors.primary,
                                                    transition: 'width 0.3s ease'
                                                }} />
                                            </div>
                                            <div style={{
                                                fontSize: '0.75rem',
                                                color: config.styling.colors.primary,
                                                textAlign: 'center'
                                            }}>
                                                {file.progress}%
                                            </div>
                                        </div>
                                    )}

                                    {/* Status and Actions */}
                                    <div className="file-upload-preview-actions" style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        {file.status === 'success' && (
                                            <span style={{
                                                color: config.styling.colors.success,
                                                fontSize: '0.875rem',
                                                fontWeight: '500'
                                            }}>
                                                ✓ {config.labels.successText}
                                            </span>
                                        )}

                                        {file.status === 'error' && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{
                                                    color: config.styling.colors.error,
                                                    fontSize: '0.75rem'
                                                }}>
                                                    {file.error || config.labels.errorText}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => actions.retryUpload(file.id)}
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
                                            </div>
                                        )}

                                        {file.status === 'pending' && (
                                            <span style={{
                                                color: config.styling.colors.muted,
                                                fontSize: '0.75rem'
                                            }}>
                                                Ready to upload
                                            </span>
                                        )}

                                        {/* Remove Button */}
                                        {(file.status === 'pending' || file.status === 'error') && (
                                            <button
                                                type="button"
                                                onClick={() => actions.removeFile(file.id)}
                                                style={{
                                                    position: 'absolute',
                                                    top: '0.5rem',
                                                    right: '0.5rem',
                                                    background: config.styling.colors.error,
                                                    color: config.styling.colors.background,
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: '24px',
                                                    height: '24px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.875rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                                aria-label={`${config.labels.removeText} ${file.name}`}
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Upload All Button */}
            {state.files.some(f => f.status === 'pending') && (
                <button
                    type="button"
                    onClick={actions.uploadFiles}
                    disabled={state.isUploading}
                    style={{
                        backgroundColor: config.styling.colors.success,
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
                    {state.isUploading ? config.labels.progressText : 'Upload All Files'}
                </button>
            )}
        </div>
    )
}

PreviewUpload.displayName = 'PreviewUpload'