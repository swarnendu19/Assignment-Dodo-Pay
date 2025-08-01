import React, { useRef } from 'react'
import { useFileUpload } from '../file-upload-context'

interface ButtonUploadProps {
    className?: string
    style?: React.CSSProperties
    ariaLabel?: string
    ariaDescribedBy?: string
    children?: React.ReactNode
}

export const ButtonUpload: React.FC<ButtonUploadProps> = ({
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

    const buttonClasses = [
        'file-upload-button',
        `file-upload-button--${config.defaults.size}`,
        `file-upload-button--${config.defaults.radius}`,
        config.defaults.disabled ? 'file-upload-button--disabled' : '',
        state.isUploading ? 'file-upload-button--uploading' : '',
        className || ''
    ].filter(Boolean).join(' ')

    return (
        <div className="file-upload file-upload--button" style={style}>
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
            <button
                type="button"
                className={buttonClasses}
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
                    opacity: config.defaults.disabled || state.isUploading ? 0.6 : 1
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

            {/* Display selected files */}
            {state.files.length > 0 && (
                <div className="file-upload-files" style={{ marginTop: config.styling.spacing.margin }}>
                    {state.files.map(file => (
                        <div key={file.id} className="file-upload-file-item" style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.5rem',
                            border: `1px solid ${config.styling.colors.border}`,
                            borderRadius: config.styling.spacing.borderRadius,
                            marginBottom: '0.25rem'
                        }}>
                            <span className="file-upload-file-name">{file.name}</span>
                            <div className="file-upload-file-actions">
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
                                            fontSize: '0.875rem'
                                        }}
                                        aria-label={`${config.labels.removeText} ${file.name}`}
                                    >
                                        {config.labels.removeText}
                                    </button>
                                )}
                                {file.status === 'uploading' && (
                                    <span style={{ color: config.styling.colors.primary }}>
                                        {file.progress}%
                                    </span>
                                )}
                                {file.status === 'success' && (
                                    <span style={{ color: config.styling.colors.success }}>
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
                                            border: 'none',
                                            color: config.styling.colors.error,
                                            cursor: 'pointer',
                                            fontSize: '0.875rem'
                                        }}
                                        aria-label={`${config.labels.retryText} ${file.name}`}
                                    >
                                        {config.labels.retryText}
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
                                backgroundColor: config.styling.colors.success,
                                color: config.styling.colors.background,
                                padding: '0.5rem 1rem',
                                border: 'none',
                                borderRadius: config.styling.spacing.borderRadius,
                                cursor: state.isUploading ? 'not-allowed' : 'pointer',
                                opacity: state.isUploading ? 0.6 : 1,
                                marginTop: '0.5rem'
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

ButtonUpload.displayName = 'ButtonUpload'