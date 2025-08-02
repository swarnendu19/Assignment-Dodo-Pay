import React, { useRef, useCallback, useState, useEffect } from 'react'
import { useFileUpload } from '../file-upload-context'
import { validateFiles } from '../../../utils/file-validation'
import type { MultiFileUploadProps, UploadFile } from '../file-upload.types'

export const MultiFileUpload: React.FC<MultiFileUploadProps> = ({
    className = '',
    style,
    ariaLabel,
    ariaDescribedBy,
    children,
    disabled: propDisabled,
    multiple: propMultiple = true, // Multi-file upload should default to multiple
    accept: propAccept,
    maxSize: propMaxSize,
    maxFiles: propMaxFiles,
    listLayout = 'list',
    sortable = false,
    bulkActions = true,
    onFileSelect,
    onError,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
    ...props
}) => {
    const { config, actions, state } = useFileUpload()
    const inputRef = useRef<HTMLInputElement>(null)
    const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set())
    const [isDragOver, setIsDragOver] = useState(false)
    const [focusedIndex, setFocusedIndex] = useState<number>(-1)

    // Merge props with config defaults
    const disabled = propDisabled ?? config.defaults.disabled ?? false
    const multiple = propMultiple ?? config.defaults.multiple ?? true
    const accept = propAccept ?? config.defaults.accept ?? '*'
    const maxSize = propMaxSize ?? config.validation.maxSize
    const maxFiles = propMaxFiles ?? config.validation.maxFiles

    // Handle file selection from input
    const handleFileSelect = useCallback(async (files: File[]) => {
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
    }, [config, maxSize, maxFiles, accept, state.files.length, actions, onFileSelect, onError])

    // Handle input change
    const handleInputChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || [])
        await handleFileSelect(files)
        // Reset input value to allow selecting the same file again
        event.target.value = ''
    }, [handleFileSelect])

    // Handle drag and drop
    const handleDragEnter = useCallback((event: React.DragEvent) => {
        event.preventDefault()
        event.stopPropagation()
        setIsDragOver(true)
        onDragEnter?.(event)
    }, [onDragEnter])

    const handleDragLeave = useCallback((event: React.DragEvent) => {
        event.preventDefault()
        event.stopPropagation()
        // Only set drag over to false if we're leaving the main container
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setIsDragOver(false)
        }
        onDragLeave?.(event)
    }, [onDragLeave])

    const handleDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault()
        event.stopPropagation()
        onDragOver?.(event)
    }, [onDragOver])

    const handleDrop = useCallback(async (event: React.DragEvent) => {
        event.preventDefault()
        event.stopPropagation()
        setIsDragOver(false)

        const files = Array.from(event.dataTransfer.files)
        await handleFileSelect(files)
        onDrop?.(event)
    }, [handleFileSelect, onDrop])

    // Bulk actions
    const handleSelectAll = useCallback(() => {
        const allFileIds = new Set(state.files.map(f => f.id))
        setSelectedFileIds(allFileIds)
    }, [state.files])

    const handleDeselectAll = useCallback(() => {
        setSelectedFileIds(new Set())
    }, [])

    const handleRemoveSelected = useCallback(() => {
        selectedFileIds.forEach(fileId => {
            actions.removeFile(fileId)
        })
        setSelectedFileIds(new Set())
    }, [selectedFileIds, actions])

    const handleUploadSelected = useCallback(async () => {
        // Filter files to only upload selected ones
        const selectedFiles = state.files.filter(f => selectedFileIds.has(f.id) && f.status === 'pending')
        if (selectedFiles.length === 0) return

        // For now, upload all files (the context doesn't support selective upload yet)
        await actions.uploadFiles()
    }, [selectedFileIds, state.files, actions])

    const handleRemoveAll = useCallback(() => {
        actions.clearAll()
        setSelectedFileIds(new Set())
    }, [actions])

    const handleUploadAll = useCallback(async () => {
        await actions.uploadFiles()
    }, [actions])

    // Individual file actions
    const handleFileToggle = useCallback((fileId: string) => {
        setSelectedFileIds(prev => {
            const newSet = new Set(prev)
            if (newSet.has(fileId)) {
                newSet.delete(fileId)
            } else {
                newSet.add(fileId)
            }
            return newSet
        })
    }, [])

    // Keyboard navigation
    const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
        if (state.files.length === 0) return

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault()
                setFocusedIndex(prev => Math.min(prev + 1, state.files.length - 1))
                break
            case 'ArrowUp':
                event.preventDefault()
                setFocusedIndex(prev => Math.max(prev - 1, 0))
                break
            case ' ':
                event.preventDefault()
                if (focusedIndex >= 0 && focusedIndex < state.files.length) {
                    const fileId = state.files[focusedIndex].id
                    handleFileToggle(fileId)
                }
                break
            case 'Enter':
                event.preventDefault()
                inputRef.current?.click()
                break
            case 'Delete':
            case 'Backspace':
                event.preventDefault()
                if (selectedFileIds.size > 0) {
                    handleRemoveSelected()
                } else if (focusedIndex >= 0 && focusedIndex < state.files.length) {
                    const fileId = state.files[focusedIndex].id
                    actions.removeFile(fileId)
                }
                break
            case 'a':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault()
                    handleSelectAll()
                }
                break
        }
    }, [state.files, focusedIndex, selectedFileIds, handleFileToggle, handleRemoveSelected, handleSelectAll, actions])

    // Reset focused index when files change
    useEffect(() => {
        if (focusedIndex >= state.files.length) {
            setFocusedIndex(Math.max(0, state.files.length - 1))
        }
    }, [state.files.length, focusedIndex])

    // Generate container classes
    const getContainerClasses = () => {
        const baseClasses = [
            'multi-file-upload',
            'border-2 border-dashed rounded-lg p-6',
            'transition-colors duration-200',
            'focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500'
        ]

        const stateClasses = []
        if (isDragOver) {
            stateClasses.push('border-blue-500 bg-blue-50')
        } else {
            stateClasses.push('border-gray-300 hover:border-gray-400')
        }

        if (disabled) {
            stateClasses.push('opacity-50 cursor-not-allowed')
        }

        return [...baseClasses, ...stateClasses, className].filter(Boolean).join(' ')
    }

    // Render file item
    const renderFileItem = (file: UploadFile, index: number) => {
        const isSelected = selectedFileIds.has(file.id)
        const isFocused = focusedIndex === index

        const itemClasses = [
            'flex items-center gap-3 p-3 rounded-md border transition-colors',
            isSelected ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200',
            isFocused ? 'ring-2 ring-blue-500 ring-offset-1' : '',
            'hover:bg-gray-50 cursor-pointer'
        ].filter(Boolean).join(' ')

        return (
            <div
                key={file.id}
                className={itemClasses}
                role="option"
                aria-selected={isSelected}
                tabIndex={isFocused ? 0 : -1}
                onClick={() => handleFileToggle(file.id)}
                onFocus={() => setFocusedIndex(index)}
            >
                {/* Checkbox */}
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleFileToggle(file.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    aria-label={`Select ${file.name}`}
                />

                {/* File info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                        </p>
                        <span className="text-xs text-gray-500 ml-2">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                    </div>

                    {/* Progress bar for uploading files */}
                    {file.status === 'uploading' && (
                        <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                <span>Uploading...</span>
                                <span>{file.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${file.progress}%` }}
                                    role="progressbar"
                                    aria-valuenow={file.progress}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                />
                            </div>
                        </div>
                    )}

                    {/* Error message */}
                    {file.status === 'error' && file.error && (
                        <p className="text-xs text-red-600 mt-1">{file.error}</p>
                    )}
                </div>

                {/* Status indicator */}
                <div className="flex items-center gap-2">
                    {file.status === 'success' && (
                        <div className="text-green-600" title="Upload successful">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                    )}

                    {file.status === 'error' && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation()
                                actions.retryUpload(file.id)
                            }}
                            className="text-red-600 hover:text-red-800 p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                            title="Retry upload"
                            aria-label={`Retry upload for ${file.name}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    )}

                    {/* Individual remove button */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation()
                            actions.removeFile(file.id)
                        }}
                        className="text-gray-400 hover:text-red-600 p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                        title="Remove file"
                        aria-label={`Remove ${file.name}`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        )
    }

    const hasFiles = state.files.length > 0
    const hasSelectedFiles = selectedFileIds.size > 0
    const hasPendingFiles = state.files.some(f => f.status === 'pending')
    const selectedPendingFiles = state.files.filter(f => selectedFileIds.has(f.id) && f.status === 'pending')

    return (
        <div
            className={getContainerClasses()}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="application"
            aria-label={ariaLabel || "Multi-file upload area"}
            aria-describedby={ariaDescribedBy}
            style={style}
        >
            {/* Hidden file input */}
            <input
                ref={inputRef}
                type="file"
                multiple={multiple}
                accept={accept}
                disabled={disabled || state.isUploading}
                onChange={handleInputChange}
                className="sr-only"
                aria-hidden="true"
            />

            {/* Upload area */}
            <div className="text-center">
                <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 48 48" aria-hidden="true">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        />
                    </svg>
                </div>

                <div className="space-y-2">
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={disabled || state.isUploading}
                        className="text-blue-600 hover:text-blue-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
                    >
                        {config.labels.selectFilesText || 'Select files'}
                    </button>
                    <p className="text-sm text-gray-600">
                        or drag and drop files here
                    </p>
                    {maxFiles > 1 && (
                        <p className="text-xs text-gray-500">
                            Maximum {maxFiles} files, up to {(maxSize / 1024 / 1024).toFixed(0)}MB each
                        </p>
                    )}
                </div>
            </div>

            {/* File list */}
            {hasFiles && (
                <div className="mt-6">
                    {/* Bulk actions */}
                    {bulkActions && (
                        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-md">
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-700">
                                    {state.files.length} file{state.files.length !== 1 ? 's' : ''}
                                    {hasSelectedFiles && (
                                        <span className="ml-2 text-blue-600">
                                            ({selectedFileIds.size} selected)
                                        </span>
                                    )}
                                </span>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleSelectAll}
                                        className="text-xs text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-2 py-1"
                                    >
                                        Select All
                                    </button>
                                    {hasSelectedFiles && (
                                        <button
                                            type="button"
                                            onClick={handleDeselectAll}
                                            className="text-xs text-gray-600 hover:text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-500 rounded px-2 py-1"
                                        >
                                            Deselect All
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {hasSelectedFiles && (
                                    <>
                                        {selectedPendingFiles.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={handleUploadSelected}
                                                disabled={state.isUploading}
                                                className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                Upload Selected ({selectedPendingFiles.length})
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={handleRemoveSelected}
                                            className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                        >
                                            Remove Selected
                                        </button>
                                    </>
                                )}

                                {hasPendingFiles && (
                                    <button
                                        type="button"
                                        onClick={handleUploadAll}
                                        disabled={state.isUploading}
                                        className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        Upload All
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={handleRemoveAll}
                                    className="text-xs text-red-600 hover:text-red-700 px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
                                >
                                    Remove All
                                </button>
                            </div>
                        </div>
                    )}

                    {/* File list */}
                    <div
                        className={`space-y-2 ${listLayout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3' : ''}`}
                        role="listbox"
                        aria-multiselectable="true"
                        aria-label="File list"
                    >
                        {state.files.map((file, index) => renderFileItem(file, index))}
                    </div>

                    {/* Keyboard shortcuts help */}
                    <div className="mt-4 text-xs text-gray-500 space-y-1">
                        <p><kbd className="px-1 py-0.5 bg-gray-100 rounded">↑↓</kbd> Navigate • <kbd className="px-1 py-0.5 bg-gray-100 rounded">Space</kbd> Select • <kbd className="px-1 py-0.5 bg-gray-100 rounded">Ctrl+A</kbd> Select All • <kbd className="px-1 py-0.5 bg-gray-100 rounded">Del</kbd> Remove</p>
                    </div>
                </div>
            )}

            {children}
        </div>
    )
}

MultiFileUpload.displayName = 'MultiFileUpload'