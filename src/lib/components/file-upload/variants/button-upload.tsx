import React, { useRef, useCallback } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { useFileUpload } from '../file-upload-context'
import { validateFiles } from '../../../utils/file-validation'
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

    // Generate TailwindCSS classes based on config
    const getButtonClasses = () => {
        const baseClasses = [
            'inline-flex items-center justify-center gap-2',
            'font-medium transition-colors duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            'disabled:pointer-events-none disabled:opacity-50'
        ]

        // Size classes
        const sizeClasses = {
            sm: 'h-8 px-3 text-sm',
            md: 'h-10 px-4 text-sm',
            lg: 'h-12 px-6 text-base'
        }

        // Radius classes
        const radiusClasses = {
            none: 'rounded-none',
            sm: 'rounded-sm',
            md: 'rounded-md',
            lg: 'rounded-lg',
            full: 'rounded-full'
        }

        // Color classes (using CSS custom properties for theming)
        const colorClasses = [
            'bg-blue-600 text-white hover:bg-blue-700',
            'focus-visible:ring-blue-500'
        ]

        return [
            ...baseClasses,
            sizeClasses[config.defaults.size] || sizeClasses.md,
            radiusClasses[config.defaults.radius] || radiusClasses.md,
            ...colorClasses,
            className
        ].filter(Boolean).join(' ')
    }

    const renderButtonContent = () => {
        const text = buttonText || children || config.labels.selectFilesText
        const showIcon = icon && !state.isUploading
        const showCount = state.files.length > 0

        if (state.isUploading) {
            return (
                <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
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

            {/* File list display */}
            {state.files.length > 0 && (
                <div className="mt-4 space-y-2" role="list" aria-label="Selected files">
                    {state.files.map((file) => (
                        <div
                            key={file.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-md border"
                            role="listitem"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>

                            <div className="flex items-center gap-2 ml-4">
                                {file.status === 'pending' && (
                                    <button
                                        type="button"
                                        onClick={() => actions.removeFile(file.id)}
                                        className="text-red-600 hover:text-red-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 rounded px-2 py-1"
                                        aria-label={`Remove ${file.name}`}
                                    >
                                        {config.labels.removeText}
                                    </button>
                                )}

                                {file.status === 'uploading' && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${file.progress}%` }}
                                                role="progressbar"
                                                aria-valuenow={file.progress}
                                                aria-valuemin={0}
                                                aria-valuemax={100}
                                                aria-label={`Upload progress: ${file.progress}%`}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-600 min-w-[3rem]">
                                            {file.progress}%
                                        </span>
                                    </div>
                                )}

                                {file.status === 'success' && (
                                    <div className="flex items-center text-green-600">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span className="sr-only">Upload successful</span>
                                    </div>
                                )}

                                {file.status === 'error' && (
                                    <button
                                        type="button"
                                        onClick={() => actions.retryUpload(file.id)}
                                        className="text-red-600 hover:text-red-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 rounded px-2 py-1"
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
                            className="w-full mt-3 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
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