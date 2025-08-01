import React, { useRef, useState, useCallback, useEffect } from 'react'
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
    height?: string | number
    showBorder?: boolean
    dropzoneText?: string
    activeDropzoneText?: string
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
    children,
    height = '200px',
    showBorder = true,
    dropzoneText,
    activeDropzoneText
}) => {
    const { config, actions, state } = useFileUpload()
    const inputRef = useRef<HTMLInputElement>(null)
    const dropzoneRef = useRef<HTMLDivElement>(null)
    const [isDragOver, setIsDragOver] = useState(false)
    const [dragCounter, setDragCounter] = useState(0)
    const [isFocused, setIsFocused] = useState(false)

    // Handle file selection from input
    const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || [])
        if (files.length > 0) {
            actions.selectFiles(files)
        }
        // Reset input value to allow selecting the same file again
        event.target.value = ''
    }, [actions])

    // Handle click to open file dialog
    const handleClick = useCallback(() => {
        if (!config.defaults.disabled && !state.isUploading) {
            inputRef.current?.click()
        }
    }, [config.defaults.disabled, state.isUploading])

    // Enhanced keyboard navigation
    const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
        if (config.defaults.disabled || state.isUploading) return

        switch (event.key) {
            case 'Enter':
            case ' ':
                event.preventDefault()
                handleClick()
                break
            case 'Escape':
                if (isDragOver) {
                    event.preventDefault()
                    setIsDragOver(false)
                    setDragCounter(0)
                }
                break
            default:
                break
        }
    }, [config.defaults.disabled, state.isUploading, handleClick, isDragOver])

    // Focus management
    const handleFocus = useCallback(() => {
        setIsFocused(true)
    }, [])

    const handleBlur = useCallback(() => {
        setIsFocused(false)
    }, [])

    // Enhanced drag event handlers with proper counter management
    const handleDragEnter = useCallback((event: React.DragEvent) => {
        event.preventDefault()
        event.stopPropagation()

        if (config.defaults.disabled || state.isUploading || !config.features.dragAndDrop) {
            return
        }

        setDragCounter(prev => prev + 1)

        // Only set drag over on first enter
        if (dragCounter === 0) {
            setIsDragOver(true)
        }

        onDragEnter?.(event)
    }, [config.defaults.disabled, state.isUploading, config.features.dragAndDrop, dragCounter, onDragEnter])

    const handleDragLeave = useCallback((event: React.DragEvent) => {
        event.preventDefault()
        event.stopPropagation()

        if (config.defaults.disabled || state.isUploading || !config.features.dragAndDrop) {
            return
        }

        setDragCounter(prev => {
            const newCounter = prev - 1
            // Only remove drag over when counter reaches 0
            if (newCounter === 0) {
                setIsDragOver(false)
            }
            return newCounter
        })

        onDragLeave?.(event)
    }, [config.defaults.disabled, state.isUploading, config.features.dragAndDrop, onDragLeave])

    const handleDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault()
        event.stopPropagation()

        if (config.defaults.disabled || state.isUploading || !config.features.dragAndDrop) {
            return
        }

        // Set the dropEffect to indicate what will happen on drop
        event.dataTransfer.dropEffect = 'copy'

        onDragOver?.(event)
    }, [config.defaults.disabled, state.isUploading, config.features.dragAndDrop, onDragOver])

    const handleDrop = useCallback((event: React.DragEvent) => {
        event.preventDefault()
        event.stopPropagation()

        if (config.defaults.disabled || state.isUploading || !config.features.dragAndDrop) {
            return
        }

        // Reset drag state
        setIsDragOver(false)
        setDragCounter(0)

        const files = Array.from(event.dataTransfer.files)
        if (files.length > 0) {
            actions.selectFiles(files)
        }

        onDrop?.(event)
    }, [config.defaults.disabled, state.isUploading, config.features.dragAndDrop, actions, onDrop])

    // Reset drag state on component unmount or when disabled
    useEffect(() => {
        if (config.defaults.disabled || state.isUploading) {
            setIsDragOver(false)
            setDragCounter(0)
        }
    }, [config.defaults.disabled, state.isUploading])

    // Determine visual state for styling
    const isDisabled = config.defaults.disabled || state.isUploading
    const isActive = isDragOver && !isDisabled
    const hasFocus = isFocused && !isDisabled

    // Build CSS classes
    const dropzoneClasses = [
        'file-upload-dropzone',
        `file-upload-dropzone--${config.defaults.size}`,
        `file-upload-dropzone--${config.defaults.radius}`,
        isDisabled ? 'file-upload-dropzone--disabled' : '',
        state.isUploading ? 'file-upload-dropzone--uploading' : '',
        isActive ? 'file-upload-dropzone--drag-over' : '',
        hasFocus ? 'file-upload-dropzone--focused' : '',
        className || ''
    ].filter(Boolean).join(' ')

    // Dynamic styling based on state
    const dropzoneStyle: React.CSSProperties = {
        border: showBorder ? `2px ${config.styling.borders.style} ${isActive ? config.styling.colors.primary :
                hasFocus ? config.styling.colors.primary :
                    config.styling.colors.border
            }` : 'none',
        borderRadius: config.styling.spacing.borderRadius,
        padding: '2rem',
        textAlign: 'center' as const,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        backgroundColor: isActive ? `${config.styling.colors.primary}15` :
            hasFocus ? `${config.styling.colors.primary}08` :
                config.styling.colors.background,
        color: config.styling.colors.foreground,
        fontSize: config.styling.typography.fontSize,
        transition: config.animations.enabled ?
            `all ${config.animations.duration}ms ${config.animations.easing}` : 'none',
        opacity: isDisabled ? 0.6 : 1,
        minHeight: typeof height === 'number' ? `${height}px` : height,
        height: typeof height === 'number' ? `${height}px` : height,
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        gap: config.styling.spacing.gap,
        outline: hasFocus ? `2px solid ${config.styling.colors.primary}` : 'none',
        outlineOffset: '2px',
        boxShadow: isActive ? config.styling.shadows.md :
            hasFocus ? config.styling.shadows.sm : 'none',
        ...style
    }

    return (
        <div className="file-upload file-upload--dropzone">
            <input
                ref={inputRef}
                type="file"
                multiple={config.defaults.multiple}
                accept={config.defaults.accept}
                disabled={isDisabled}
                onChange={handleFileSelect}
                className="sr-only"
                aria-hidden="true"
                tabIndex={-1}
            />

            <div
                ref={dropzoneRef}
                className={dropzoneClasses}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onDragEnter={config.features.dragAndDrop ? handleDragEnter : undefined}
                onDragLeave={config.features.dragAndDrop ? handleDragLeave : undefined}
                onDragOver={config.features.dragAndDrop ? handleDragOver : undefined}
                onDrop={config.features.dragAndDrop ? handleDrop : undefined}
                role="button"
                tabIndex={isDisabled ? -1 : 0}
                aria-label={ariaLabel || (
                    isActive ? (activeDropzoneText || config.labels.dropText) :
                        (dropzoneText || config.labels.dragText)
                )}
                aria-describedby={ariaDescribedBy}
                aria-disabled={isDisabled}
                aria-pressed={state.files.length > 0}
                style={dropzoneStyle}
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