import React, { useRef, useCallback } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { useFileUpload } from '../file-upload-context'
import { validateFiles } from '../../../utils/file-validation'
import { generateThemeClasses, cn } from '../../../utils/theme'
import { UploadFeedback } from '../feedback'
import { LoadingSpinner, ProgressBar, StatusIndicator } from '../progress'
import type { ButtonUploadProps } from '../file-upload.types'

export const ButtonUpload: React.FC<ButtonUploadProps> = ({
    className = '',
    style,
    ariaLabel,
    ariaDescribedBy,
    children,
    buttonText,
    icon,
    iconPosition = 'left',
    asChild = false,
    disabled: propDisabled,
    multiple: propMultiple,
    accept: propAccept,
    maxSize: propMaxSize,
    maxFiles: propMaxFiles,
    onFileSelect,
    onError,
    ...props
}) => {
    const { config, actions, state } = useFileUpload()
    const inputRef = useRef<HTMLInputElement>(null)

    // Merge props with config defaults
    const disabled = propDisabled ?? config.defaults.disabled ?? false
    const multiple = propMultiple ?? config.defaults.multiple ?? false
    const accept = propAccept ?? config.defaults.accept ?? '*'
    const maxSize = propMaxSize ?? config.validation.maxSize
    const maxFiles = propMaxFiles ?? config.validation.maxFiles

    const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || [])
        if (files.length === 0) return

        try {
            // Validate files using the validation utility
            const validationResult = await validateFiles(files, {
                ...config,
                validation: {
                    ...config.validation,
                    maxSize,
                    maxFiles,
                    allowedTypes: accept === '*' ? ['*'] : accept.split(',').map(t => t.trim())
                }
            }, state.files.length)

            if (validationResult.validFiles.length > 0) {
                actions.selectFiles(validationResult.validFiles)
                onFileSelect?.(validationResult.validFiles)
            }

            // Handle rejected files
            if (validationResult.rejectedFiles.length > 0) {
                const errorMessage = validationResult.rejectedFiles
                    .map(rf => `${rf.file.name}: ${rf.errors.map(e => e.message).join(', ')}`)
                    .join('\n')
                onError?.(errorMessage)
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'File validation failed'
            onError?.(errorMessage)
        }

        // Reset input value to allow selecting the same file again
        event.target.value = ''
    }, [config, maxSize, maxFiles, accept, state.files.length, actions, onFileSelect, onError])

    const handleButtonClick = useCallback(() => {
        if (disabled || state.isUploading) return
        inputRef.current?.click()
    }, [disabled, state.isUploading])

    const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            handleButtonClick()
        }
    }, [handleButtonClick])

    // Generate theme classes using the theming system
    const getButtonClasses = () => {
        const themeClasses = generateThemeClasses(
            'button',
            config.defaults.size,
            config.defaults.radius,
            config,
            ['file-upload--primary']
        )

        const additionalClasses = [
            'inline-flex items-center justify-center gap-2',
            disabled || state.isUploading ? 'file-upload--disabled' : '',
            state.isUploading ? 'file-upload--loading' : ''
        ]

        return cn(themeClasses, ...additionalClasses, className)
    }

    const renderButtonContent = () => {
        const text = buttonText || children || config.labels.selectFilesText
        const showIcon = icon && !state.isUploading
        const showCount = state.files.length > 0

        if (state.isUploading) {
            return (
                <>
                    <LoadingSpinner size="sm" color="primary" />
                    {config.labels.progressText}
                </>
            )
        }

        return (
            <>
                {showIcon && iconPosition === 'left' && icon}
                <span>
                    {text}
                    {showCount && (
                        <span className="ml-1 text-xs opacity-75">
                            ({state.files.length} {state.files.length === 1 ? 'file' : 'files'})
                        </span>
                    )}
                </span>
                {showIcon && iconPosition === 'right' && icon}
            </>
        )
    }

    const buttonProps = {
        type: 'button' as const,
        className: getButtonClasses(),
        onClick: handleButtonClick,
        onKeyDown: handleKeyDown,
        disabled: disabled || state.isUploading,
        'aria-label': ariaLabel || config.labels.selectFilesText,
        'aria-describedby': ariaDescribedBy,
        'aria-pressed': state.files.length > 0,
        style,
        ...props
    }

    const Comp = asChild ? Slot : 'button'

    return (
        <div className="file-upload-button-container">
            {/* Hidden file input */}
            <input
                ref={inputRef}
                type="file"
                multiple={multiple}
                accept={accept}
                disabled={disabled || state.isUploading}
                onChange={handleFileSelect}
                className="sr-only"
                aria-hidden="true"
                tabIndex={-1}
            />

            {/* Button component */}
            <Comp {...buttonProps}>
                {renderButtonContent()}
            </Comp>

            {/* Overall progress feedback */}
            {state.files.length > 0 && (
                <div className="mt-4">
                    <UploadFeedback
                        showOverallProgress={true}
                        showIndividualProgress={false}
                        showStatusIndicator={true}
                        showAccessibilityAnnouncer={true}
                        layout="compact"
                        progressSize="sm"
                        statusSize="sm"
                    />
                </div>
            )}

            {/* File list display */}
            {state.files.length > 0 && (
                <div className="mt-4 space-y-2" role="list" aria-label="Selected files">
                    {state.files.map((file) => (
                        <div
                            key={file.id}
                            className={cn(
                                'flex items-center justify-between',
                                'file-upload--sm',
                                'file-upload--radius-md',
                                'border border-[var(--file-upload-border)]',
                                'bg-[var(--file-upload-background)]',
                                'text-[var(--file-upload-foreground)]'
                            )}
                            role="listitem"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate" style={{ fontSize: 'var(--file-upload-font-size-sm)' }}>
                                    {file.name}
                                </p>
                                <p className="text-[var(--file-upload-muted)]" style={{ fontSize: 'var(--file-upload-font-size-sm)' }}>
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>

                            <div className="flex items-center gap-2 ml-4">
                                <StatusIndicator
                                    status={file.status}
                                    size="sm"
                                    showText={false}
                                />

                                {file.status === 'uploading' && (
                                    <div className="w-16">
                                        <ProgressBar
                                            file={file}
                                            size="sm"
                                            showLabel={false}
                                            showPercentage={false}
                                        />
                                    </div>
                                )}

                                {file.status === 'pending' && (
                                    <button
                                        type="button"
                                        onClick={() => actions.removeFile(file.id)}
                                        className={cn(
                                            generateThemeClasses('button', 'sm', 'sm', config, ['file-upload--error', 'file-upload--outline'])
                                        )}
                                        aria-label={`Remove ${file.name}`}
                                    >
                                        {config.labels.removeText}
                                    </button>
                                )}

                                {file.status === 'error' && (
                                    <button
                                        type="button"
                                        onClick={() => actions.retryUpload(file.id)}
                                        className={cn(
                                            generateThemeClasses('button', 'sm', 'sm', config, ['file-upload--error', 'file-upload--outline'])
                                        )}
                                        aria-label={`Retry upload for ${file.name}`}
                                    >
                                        {config.labels.retryText}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Upload all button */}
                    {state.files.some(f => f.status === 'pending') && !config.features.autoUpload && (
                        <button
                            type="button"
                            onClick={actions.uploadFiles}
                            disabled={state.isUploading}
                            className={cn(
                                generateThemeClasses('button', 'md', config.defaults.radius, config, ['file-upload--success']),
                                'w-full mt-3',
                                state.isUploading ? 'file-upload--disabled' : ''
                            )}
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