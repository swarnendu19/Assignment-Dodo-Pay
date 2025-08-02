import React, { useRef, useCallback, useEffect, useState } from 'react'
import { useFileUpload } from '../file-upload-context'
import { validateFiles, formatFileSize, isImageFile } from '../../../utils/file-validation'
import type { PreviewUploadProps } from '../file-upload.types'

interface FilePreview {
    id: string
    url: string
    type: 'image' | 'icon'
}

export const PreviewUpload: React.FC<PreviewUploadProps> = ({
    className = '',
    style,
    ariaLabel,
    ariaDescribedBy,
    children,
    previewSize = 'md',
    showFileInfo = true,
    allowReorder = false,
    disabled: propDisabled,
    multiple: propMultiple,
    accept: propAccept,
    maxSize: propMaxSize,
    maxFiles: propMaxFiles,
    onFileSelect,
    onError,
    onFileRemove
}) => {
    const { config, actions, state } = useFileUpload()
    const inputRef = useRef<HTMLInputElement>(null)
    const [previews, setPreviews] = useState<Map<string, FilePreview>>(new Map())
    const [focusedFileIndex, setFocusedFileIndex] = useState<number>(-1)

    // Merge props with config defaults
    const disabled = propDisabled ?? config.defaults.disabled ?? false
    const multiple = propMultiple ?? config.defaults.multiple ?? false
    const accept = propAccept ?? config.defaults.accept ?? '*'
    const maxSize = propMaxSize ?? config.validation.maxSize
    const maxFiles = propMaxFiles ?? config.validation.maxFiles

    // Generate image thumbnails for image files
    const generateImageThumbnail = useCallback(async (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            if (!isImageFile(file)) {
                reject(new Error('Not an image file'))
                return
            }

            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            const img = new Image()

            img.onload = () => {
                // Calculate thumbnail dimensions while maintaining aspect ratio
                const maxDimension = previewSize === 'sm' ? 80 : previewSize === 'lg' ? 200 : 120
                let { width, height } = img

                if (width > height) {
                    if (width > maxDimension) {
                        height = (height * maxDimension) / width
                        width = maxDimension
                    }
                } else {
                    if (height > maxDimension) {
                        width = (width * maxDimension) / height
                        height = maxDimension
                    }
                }

                canvas.width = width
                canvas.height = height

                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height)
                    resolve(canvas.toDataURL('image/jpeg', 0.8))
                } else {
                    reject(new Error('Could not get canvas context'))
                }

                URL.revokeObjectURL(img.src)
            }

            img.onerror = () => {
                URL.revokeObjectURL(img.src)
                reject(new Error('Failed to load image'))
            }

            img.src = URL.createObjectURL(file)
        })
    }, [previewSize])

    // Generate file preview (thumbnail for images, icon for others)
    const generateFilePreview = useCallback(async (file: File): Promise<FilePreview> => {
        if (isImageFile(file)) {
            try {
                const thumbnailUrl = await generateImageThumbnail(file)
                return {
                    id: `preview_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
                    url: thumbnailUrl,
                    type: 'image'
                }
            } catch (error) {
                console.warn('Failed to generate thumbnail:', error)
                return {
                    id: `preview_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
                    url: getFileIcon(file),
                    type: 'icon'
                }
            }
        } else {
            return {
                id: `preview_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
                url: getFileIcon(file),
                type: 'icon'
            }
        }
    }, [generateImageThumbnail])

    // Get file type icon
    const getFileIcon = useCallback((file: File): string => {
        if (file.type.startsWith('image/')) return '🖼️'
        if (file.type.startsWith('video/')) return '🎥'
        if (file.type.startsWith('audio/')) return '🎵'
        if (file.type.includes('pdf')) return '📄'
        if (file.type.includes('text')) return '📝'
        if (file.type.includes('zip') || file.type.includes('archive')) return '📦'
        if (file.type.includes('word')) return '📝'
        if (file.type.includes('excel') || file.type.includes('spreadsheet')) return '📊'
        if (file.type.includes('powerpoint') || file.type.includes('presentation')) return '📽️'
        return '📁'
    }, [])

    // Update previews when files change
    useEffect(() => {
        const updatePreviews = async () => {
            const newPreviews = new Map<string, FilePreview>()

            for (const uploadFile of state.files) {
                if (!previews.has(uploadFile.id)) {
                    const preview = await generateFilePreview(uploadFile.file)
                    newPreviews.set(uploadFile.id, preview)
                } else {
                    newPreviews.set(uploadFile.id, previews.get(uploadFile.id)!)
                }
            }

            setPreviews(newPreviews)
        }

        updatePreviews()
    }, [state.files, generateFilePreview, previews])

    // Handle file selection with validation
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

    // Handle button click to open file dialog
    const handleButtonClick = useCallback(() => {
        if (disabled || state.isUploading) return
        inputRef.current?.click()
    }, [disabled, state.isUploading])

    // Handle keyboard navigation for button
    const handleButtonKeyDown = useCallback((event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            handleButtonClick()
        }
    }, [handleButtonClick])

    // Handle file removal with keyboard support
    const handleRemoveFile = useCallback((fileId: string, fileName: string) => {
        actions.removeFile(fileId)
        onFileRemove?.(fileId)

        // Clean up preview
        const preview = previews.get(fileId)
        if (preview && preview.type === 'image' && preview.url.startsWith('data:')) {
            // No need to revoke data URLs, but we can remove from map
            setPreviews(prev => {
                const newPreviews = new Map(prev)
                newPreviews.delete(fileId)
                return newPreviews
            })
        }

        // Announce removal for screen readers
        if (config.accessibility.announceFileSelection) {
            const announcement = `File ${fileName} removed`
            // Create temporary element for screen reader announcement
            const announcer = document.createElement('div')
            announcer.setAttribute('aria-live', 'polite')
            announcer.setAttribute('aria-atomic', 'true')
            announcer.className = 'sr-only'
            announcer.textContent = announcement
            document.body.appendChild(announcer)
            setTimeout(() => document.body.removeChild(announcer), 1000)
        }
    }, [actions, onFileRemove, previews, config.accessibility.announceFileSelection])

    // Handle keyboard navigation for file list
    const handleFileListKeyDown = useCallback((event: React.KeyboardEvent, fileIndex: number, fileId: string, fileName: string) => {
        switch (event.key) {
            case 'Delete':
            case 'Backspace':
                event.preventDefault()
                handleRemoveFile(fileId, fileName)
                break
            case 'ArrowDown':
                event.preventDefault()
                setFocusedFileIndex(Math.min(fileIndex + 1, state.files.length - 1))
                break
            case 'ArrowUp':
                event.preventDefault()
                setFocusedFileIndex(Math.max(fileIndex - 1, 0))
                break
            case 'Home':
                event.preventDefault()
                setFocusedFileIndex(0)
                break
            case 'End':
                event.preventDefault()
                setFocusedFileIndex(state.files.length - 1)
                break
        }
    }, [handleRemoveFile, state.files.length])

    // Get preview size classes
    const getPreviewSizeClasses = () => {
        const sizeMap = {
            sm: { container: 'min-w-[150px]', media: 'h-20', text: 'text-xs' },
            md: { container: 'min-w-[200px]', media: 'h-28', text: 'text-sm' },
            lg: { container: 'min-w-[250px]', media: 'h-36', text: 'text-base' }
        }
        return sizeMap[previewSize] || sizeMap.md
    }

    const sizeClasses = getPreviewSizeClasses()

    return (
        <div className={`file-upload file-upload--preview ${className}`} style={style}>
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

            {/* Upload Button */}
            <button
                type="button"
                onClick={handleButtonClick}
                onKeyDown={handleButtonKeyDown}
                disabled={disabled || state.isUploading}
                aria-label={ariaLabel || config.labels.selectFilesText}
                aria-describedby={ariaDescribedBy}
                className="inline-flex items-center justify-center gap-2 font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500"
            >
                {state.isUploading && (
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
                )}
                <span>
                    {children || (state.isUploading ? config.labels.progressText : config.labels.selectFilesText)}
                    {state.files.length > 0 && (
                        <span className="ml-1 text-xs opacity-75">
                            ({state.files.length} {state.files.length === 1 ? 'file' : 'files'})
                        </span>
                    )}
                </span>
            </button>

            {/* File Previews Grid */}
            {state.files.length > 0 && (
                <div
                    className="mt-4 grid gap-4"
                    style={{
                        gridTemplateColumns: `repeat(auto-fill, minmax(${sizeClasses.container.replace('min-w-[', '').replace(']', '')}, 1fr))`
                    }}
                    role="list"
                    aria-label="Selected files with previews"
                >
                    {state.files.map((file, index) => {
                        const preview = previews.get(file.id)
                        const isFocused = focusedFileIndex === index

                        return (
                            <div
                                key={file.id}
                                className={`relative border rounded-lg p-4 bg-white transition-all duration-200 ${isFocused ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:shadow-md'
                                    }`}
                                role="listitem"
                                tabIndex={config.accessibility.keyboardNavigation ? 0 : -1}
                                onKeyDown={(e) => handleFileListKeyDown(e, index, file.id, file.name)}
                                onFocus={() => setFocusedFileIndex(index)}
                                onBlur={() => setFocusedFileIndex(-1)}
                                aria-label={`File: ${file.name}, ${formatFileSize(file.size)}, ${file.status}`}
                            >
                                {/* Preview Media */}
                                <div className={`w-full ${sizeClasses.media} flex items-center justify-center bg-gray-50 rounded-md mb-3 overflow-hidden`}>
                                    {preview?.type === 'image' ? (
                                        <img
                                            src={preview.url}
                                            alt={`Preview of ${file.name}`}
                                            className="max-w-full max-h-full object-cover rounded-md"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <span className="text-4xl opacity-70" role="img" aria-label={`${file.type} file`}>
                                            {preview?.url || getFileIcon(file.file)}
                                        </span>
                                    )}
                                </div>

                                {/* File Information */}
                                {showFileInfo && (
                                    <div className="space-y-1">
                                        <div className={`font-medium text-gray-900 truncate ${sizeClasses.text}`} title={file.name}>
                                            {file.name}
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>{formatFileSize(file.size)}</span>
                                            <span className="uppercase">{file.type.split('/')[1] || 'file'}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Upload Progress */}
                                {file.status === 'uploading' && (
                                    <div className="mt-3 space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-blue-600">Uploading...</span>
                                            <span className="text-blue-600 font-medium">{file.progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                                                style={{ width: `${file.progress}%` }}
                                                role="progressbar"
                                                aria-valuenow={file.progress}
                                                aria-valuemin={0}
                                                aria-valuemax={100}
                                                aria-label={`Upload progress: ${file.progress}%`}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Status Indicators */}
                                {file.status === 'success' && (
                                    <div className="mt-3 flex items-center text-green-600 text-sm">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span>{config.labels.successText}</span>
                                    </div>
                                )}

                                {file.status === 'error' && (
                                    <div className="mt-3 space-y-2">
                                        <div className="flex items-center text-red-600 text-sm">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            <span className="text-xs">{file.error || config.labels.errorText}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => actions.retryUpload(file.id)}
                                            className="text-xs text-red-600 hover:text-red-800 border border-red-300 hover:border-red-400 px-2 py-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                                            aria-label={`Retry upload for ${file.name}`}
                                        >
                                            {config.labels.retryText}
                                        </button>
                                    </div>
                                )}

                                {file.status === 'pending' && (
                                    <div className="mt-3 text-gray-500 text-sm">
                                        Ready to upload
                                    </div>
                                )}

                                {/* Remove Button */}
                                {(file.status === 'pending' || file.status === 'error') && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveFile(file.id, file.name)}
                                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                        aria-label={`Remove ${file.name}`}
                                        title={`Remove ${file.name}`}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Upload All Button */}
            {state.files.some(f => f.status === 'pending') && !config.features.autoUpload && (
                <button
                    type="button"
                    onClick={actions.uploadFiles}
                    disabled={state.isUploading}
                    className="w-full mt-4 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-medium transition-colors"
                >
                    {state.isUploading ? (
                        <span className="flex items-center justify-center gap-2">
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
                        </span>
                    ) : (
                        `Upload All Files (${state.files.filter(f => f.status === 'pending').length})`
                    )}
                </button>
            )}

            {/* Screen Reader Announcements */}
            <div aria-live="polite" aria-atomic="true" className="sr-only">
                {state.files.length > 0 && (
                    <span>
                        {state.files.length} {state.files.length === 1 ? 'file' : 'files'} selected.
                        {state.files.filter(f => f.status === 'pending').length > 0 &&
                            ` ${state.files.filter(f => f.status === 'pending').length} ready to upload.`
                        }
                        {state.files.filter(f => f.status === 'success').length > 0 &&
                            ` ${state.files.filter(f => f.status === 'success').length} uploaded successfully.`
                        }
                        {state.files.filter(f => f.status === 'error').length > 0 &&
                            ` ${state.files.filter(f => f.status === 'error').length} failed to upload.`
                        }
                    </span>
                )}
            </div>
        </div>
    )
}

PreviewUpload.displayName = 'PreviewUpload'