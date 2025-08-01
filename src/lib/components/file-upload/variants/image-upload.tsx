import React, { useRef } from 'react'
import { useFileUpload } from '../file-upload-context'

interface ImageUploadProps {
    className?: string
    style?: React.CSSProperties
    ariaLabel?: string
    ariaDescribedBy?: string
    children?: React.ReactNode
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
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
        // Filter only image files
        const imageFiles = files.filter(file => file.type.startsWith('image/'))
        if (imageFiles.length > 0) {
            actions.selectFiles(imageFiles)
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

    const getImagePreview = (file: File): string => {
        return URL.createObjectURL(file)
    }

    return (
        <div className={`file-upload file-upload--image ${className || ''}`} style={style}>
            <input
                ref={inputRef}
                type="file"
                multiple={config.defaults.multiple}
                accept="image/*"
                disabled={config.defaults.disabled || state.isUploading}
                onChange={handleFileSelect}
                className="file-upload-input"
                style={{ display: 'none' }}
                aria-hidden="true"
            />

            {/* Upload Area */}
            <div
                onClick={handleButtonClick}
                onKeyDown={handleKeyDown}
                role="button"
                tabIndex={config.defaults.disabled || state.isUploading ? -1 : 0}
                aria-label={ariaLabel || 'Upload images'}
                aria-describedby={ariaDescribedBy}
                style={{
                    border: `2px dashed ${config.styling.colors.border}`,
                    borderRadius: config.styling.spacing.borderRadius,
                    padding: '2rem',
                    textAlign: 'center',
                    cursor: config.defaults.disabled || state.isUploading ? 'not-allowed' : 'pointer',
                    backgroundColor: config.styling.colors.background,
                    color: config.styling.colors.foreground,
                    fontSize: config.styling.typography.fontSize,
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
                        <div className="file-upload-image-icon" style={{
                            fontSize: '3rem',
                            color: config.styling.colors.muted
                        }}>
                            🖼️
                        </div>

                        <div className="file-upload-image-text">
                            <div className="file-upload-image-primary-text" style={{
                                fontWeight: '600',
                                marginBottom: '0.5rem',
                                color: config.styling.colors.foreground
                            }}>
                                {state.isUploading ? config.labels.progressText : 'Upload Images'}
                            </div>

                            <div className="file-upload-image-secondary-text" style={{
                                fontSize: '0.875rem',
                                color: config.styling.colors.muted
                            }}>
                                Click to select image files
                            </div>
                        </div>

                        {state.files.length > 0 && (
                            <div className="file-upload-image-count" style={{
                                fontSize: '0.875rem',
                                color: config.styling.colors.primary,
                                fontWeight: '500'
                            }}>
                                {state.files.length} {state.files.length === 1 ? 'image' : 'images'} selected
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Image Previews */}
            {state.files.length > 0 && (
                <div className="file-upload-image-previews" style={{
                    display: 'grid',
                    gridTemplateColumns: config.defaults.multiple
                        ? 'repeat(auto-fill, minmax(150px, 1fr))'
                        : '1fr',
                    gap: config.styling.spacing.gap,
                    marginTop: config.styling.spacing.margin
                }}>
                    {state.files.map(file => {
                        const preview = getImagePreview(file.file)

                        return (
                            <div key={file.id} className="file-upload-image-preview" style={{
                                position: 'relative',
                                border: `1px solid ${config.styling.colors.border}`,
                                borderRadius: config.styling.spacing.borderRadius,
                                overflow: 'hidden',
                                backgroundColor: config.styling.colors.background
                            }}>
                                {/* Image Preview */}
                                <div style={{
                                    width: '100%',
                                    height: config.defaults.multiple ? '150px' : '200px',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <img
                                        src={preview}
                                        alt={file.name}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                        onLoad={() => {
                                            // Clean up object URL to prevent memory leaks
                                            setTimeout(() => URL.revokeObjectURL(preview), 1000)
                                        }}
                                    />

                                    {/* Progress Overlay */}
                                    {file.status === 'uploading' && (
                                        <div style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white'
                                        }}>
                                            <div style={{
                                                textAlign: 'center'
                                            }}>
                                                <div style={{
                                                    width: '60px',
                                                    height: '4px',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                                    borderRadius: '2px',
                                                    overflow: 'hidden',
                                                    marginBottom: '0.5rem'
                                                }}>
                                                    <div style={{
                                                        width: `${file.progress}%`,
                                                        height: '100%',
                                                        backgroundColor: config.styling.colors.primary,
                                                        transition: 'width 0.3s ease'
                                                    }} />
                                                </div>
                                                <div style={{ fontSize: '0.875rem' }}>
                                                    {file.progress}%
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Status Indicators */}
                                    {file.status === 'success' && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '0.5rem',
                                            left: '0.5rem',
                                            backgroundColor: config.styling.colors.success,
                                            color: config.styling.colors.background,
                                            borderRadius: '50%',
                                            width: '24px',
                                            height: '24px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.875rem'
                                        }}>
                                            ✓
                                        </div>
                                    )}

                                    {file.status === 'error' && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '0.5rem',
                                            left: '0.5rem',
                                            backgroundColor: config.styling.colors.error,
                                            color: config.styling.colors.background,
                                            borderRadius: '50%',
                                            width: '24px',
                                            height: '24px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.875rem'
                                        }}>
                                            !
                                        </div>
                                    )}

                                    {/* Remove Button */}
                                    {(file.status === 'pending' || file.status === 'error') && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                actions.removeFile(file.id)
                                            }}
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

                                {/* File Info */}
                                <div style={{
                                    padding: '0.75rem',
                                    borderTop: `1px solid ${config.styling.colors.border}`
                                }}>
                                    <div style={{
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: config.styling.colors.foreground,
                                        marginBottom: '0.25rem',
                                        wordBreak: 'break-word'
                                    }}>
                                        {file.name}
                                    </div>

                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: config.styling.colors.muted,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <span>{(file.size / 1024).toFixed(1)} KB</span>

                                        {file.status === 'error' && (
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
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Upload Button */}
            {state.files.some(f => f.status === 'pending') && (
                <button
                    type="button"
                    onClick={actions.uploadFiles}
                    disabled={state.isUploading}
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
                    {state.isUploading ? config.labels.progressText : 'Upload Images'}
                </button>
            )}
        </div>
    )
}

ImageUpload.displayName = 'ImageUpload'