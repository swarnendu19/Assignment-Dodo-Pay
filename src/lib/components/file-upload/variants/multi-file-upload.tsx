import React, { useRef, useState } from 'react'
import { useFileUpload } from '../file-upload-context'

interface MultiFileUploadProps {
    className?: string
    style?: React.CSSProperties
    ariaLabel?: string
    ariaDescribedBy?: string
    children?: React.ReactNode
}

export const MultiFileUpload: React.FC<MultiFileUploadProps> = ({
    className,
    style,
    ariaLabel,
    ariaDescribedBy,
    children
}) => {
    const { config, actions, state } = useFileUpload()
    const inputRef = useRef<HTMLInputElement>(null)
    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())

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

    const handleSelectAll = () => {
        if (selectedFiles.size === state.files.length) {
            setSelectedFiles(new Set())
        } else {
            setSelectedFiles(new Set(state.files.map(f => f.id)))
        }
    }

    const handleSelectFile = (fileId: string) => {
        const newSelected = new Set(selectedFiles)
        if (newSelected.has(fileId)) {
            newSelected.delete(fileId)
        } else {
            newSelected.add(fileId)
        }
        setSelectedFiles(newSelected)
    }

    const handleRemoveSelected = () => {
        selectedFiles.forEach(fileId => {
            actions.removeFile(fileId)
        })
        setSelectedFiles(new Set())
    }

    const handleUploadSelected = () => {
        // For now, upload all files since we don't have selective upload
        actions.uploadFiles()
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success': return config.styling.colors.success
            case 'error': return config.styling.colors.error
            case 'uploading': return config.styling.colors.primary
            default: return config.styling.colors.muted
        }
    }

    const pendingFiles = state.files.filter(f => f.status === 'pending')
    const uploadingFiles = state.files.filter(f => f.status === 'uploading')
    const completedFiles = state.files.filter(f => f.status === 'success')
    const failedFiles = state.files.filter(f => f.status === 'error')

    return (
        <div className={`file-upload file-upload--multi-file ${className || ''}`} style={style}>
            <input
                ref={inputRef}
                type="file"
                multiple={true}
                accept={config.defaults.accept}
                disabled={config.defaults.disabled || state.isUploading}
                onChange={handleFileSelect}
                className="file-upload-input"
                style={{ display: 'none' }}
                aria-hidden="true"
            />

            {/* Header with Add Files Button and Stats */}
            <div className="file-upload-multi-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: config.styling.spacing.margin,
                padding: config.styling.spacing.padding,
                border: `1px solid ${config.styling.colors.border}`,
                borderRadius: config.styling.spacing.borderRadius,
                backgroundColor: config.styling.colors.background
            }}>
                <div className="file-upload-multi-stats">
                    <div style={{
                        fontSize: config.styling.typography.fontSize,
                        fontWeight: '600',
                        color: config.styling.colors.foreground,
                        marginBottom: '0.25rem'
                    }}>
                        File Upload Manager
                    </div>
                    <div style={{
                        fontSize: '0.875rem',
                        color: config.styling.colors.muted
                    }}>
                        {state.files.length} files • {pendingFiles.length} pending • {completedFiles.length} completed • {failedFiles.length} failed
                    </div>
                </div>

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
                        padding: '0.75rem 1.5rem',
                        borderRadius: config.styling.spacing.borderRadius,
                        border: 'none',
                        fontSize: config.styling.typography.fontSize,
                        fontWeight: '500',
                        cursor: config.defaults.disabled || state.isUploading ? 'not-allowed' : 'pointer',
                        opacity: config.defaults.disabled || state.isUploading ? 0.6 : 1
                    }}
                >
                    {children || (state.isUploading ? config.labels.progressText : '+ Add Files')}
                </button>
            </div>

            {/* Bulk Actions */}
            {state.files.length > 0 && (
                <div className="file-upload-multi-actions" style={{
                    display: 'flex',
                    gap: config.styling.spacing.gap,
                    marginBottom: config.styling.spacing.margin,
                    padding: '0.75rem',
                    backgroundColor: config.styling.colors.background,
                    border: `1px solid ${config.styling.colors.border}`,
                    borderRadius: config.styling.spacing.borderRadius
                }}>
                    <button
                        type="button"
                        onClick={handleSelectAll}
                        style={{
                            background: 'none',
                            border: `1px solid ${config.styling.colors.border}`,
                            color: config.styling.colors.foreground,
                            padding: '0.5rem 1rem',
                            borderRadius: config.styling.spacing.borderRadius,
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                        }}
                    >
                        {selectedFiles.size === state.files.length ? 'Deselect All' : 'Select All'}
                    </button>

                    {selectedFiles.size > 0 && (
                        <>
                            <button
                                type="button"
                                onClick={handleRemoveSelected}
                                style={{
                                    background: 'none',
                                    border: `1px solid ${config.styling.colors.error}`,
                                    color: config.styling.colors.error,
                                    padding: '0.5rem 1rem',
                                    borderRadius: config.styling.spacing.borderRadius,
                                    cursor: 'pointer',
                                    fontSize: '0.875rem'
                                }}
                            >
                                Remove Selected ({selectedFiles.size})
                            </button>

                            {pendingFiles.some(f => selectedFiles.has(f.id)) && (
                                <button
                                    type="button"
                                    onClick={handleUploadSelected}
                                    disabled={state.isUploading}
                                    style={{
                                        backgroundColor: config.styling.colors.success,
                                        color: config.styling.colors.background,
                                        border: 'none',
                                        padding: '0.5rem 1rem',
                                        borderRadius: config.styling.spacing.borderRadius,
                                        cursor: state.isUploading ? 'not-allowed' : 'pointer',
                                        fontSize: '0.875rem',
                                        opacity: state.isUploading ? 0.6 : 1
                                    }}
                                >
                                    Upload Selected
                                </button>
                            )}
                        </>
                    )}

                    {pendingFiles.length > 0 && (
                        <button
                            type="button"
                            onClick={actions.uploadFiles}
                            disabled={state.isUploading}
                            style={{
                                backgroundColor: config.styling.colors.primary,
                                color: config.styling.colors.background,
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: config.styling.spacing.borderRadius,
                                cursor: state.isUploading ? 'not-allowed' : 'pointer',
                                fontSize: '0.875rem',
                                opacity: state.isUploading ? 0.6 : 1,
                                marginLeft: 'auto'
                            }}
                        >
                            Upload All ({pendingFiles.length})
                        </button>
                    )}
                </div>
            )}

            {/* File List */}
            {state.files.length > 0 ? (
                <div className="file-upload-multi-list" style={{
                    border: `1px solid ${config.styling.colors.border}`,
                    borderRadius: config.styling.spacing.borderRadius,
                    backgroundColor: config.styling.colors.background,
                    overflow: 'hidden'
                }}>
                    {/* List Header */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '40px 1fr 100px 80px 120px 100px',
                        gap: config.styling.spacing.gap,
                        padding: '0.75rem',
                        backgroundColor: config.styling.colors.muted + '20',
                        borderBottom: `1px solid ${config.styling.colors.border}`,
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: config.styling.colors.foreground
                    }}>
                        <div></div>
                        <div>Name</div>
                        <div>Size</div>
                        <div>Status</div>
                        <div>Progress</div>
                        <div>Actions</div>
                    </div>

                    {/* File Items */}
                    {state.files.map((file, index) => (
                        <div
                            key={file.id}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '40px 1fr 100px 80px 120px 100px',
                                gap: config.styling.spacing.gap,
                                padding: '0.75rem',
                                borderBottom: index < state.files.length - 1 ? `1px solid ${config.styling.colors.border}` : 'none',
                                backgroundColor: selectedFiles.has(file.id) ? config.styling.colors.primary + '10' : 'transparent',
                                alignItems: 'center'
                            }}
                        >
                            {/* Checkbox */}
                            <input
                                type="checkbox"
                                checked={selectedFiles.has(file.id)}
                                onChange={() => handleSelectFile(file.id)}
                                style={{
                                    cursor: 'pointer',
                                    accentColor: config.styling.colors.primary
                                }}
                                aria-label={`Select ${file.name}`}
                            />

                            {/* File Info */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                minWidth: 0
                            }}>
                                <span style={{ fontSize: '1.25rem' }}>
                                    {getFileIcon(file.file)}
                                </span>
                                <div style={{ minWidth: 0 }}>
                                    <div style={{
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: config.styling.colors.foreground,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {file.name}
                                    </div>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: config.styling.colors.muted
                                    }}>
                                        {file.type}
                                    </div>
                                </div>
                            </div>

                            {/* Size */}
                            <div style={{
                                fontSize: '0.875rem',
                                color: config.styling.colors.muted
                            }}>
                                {formatFileSize(file.size)}
                            </div>

                            {/* Status */}
                            <div style={{
                                fontSize: '0.875rem',
                                color: getStatusColor(file.status),
                                fontWeight: '500',
                                textTransform: 'capitalize'
                            }}>
                                {file.status}
                            </div>

                            {/* Progress */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                {file.status === 'uploading' ? (
                                    <>
                                        <div style={{
                                            flex: 1,
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
                                    </>
                                ) : file.status === 'success' ? (
                                    <span style={{
                                        color: config.styling.colors.success,
                                        fontSize: '1.25rem'
                                    }}>
                                        ✓
                                    </span>
                                ) : file.status === 'error' ? (
                                    <span style={{
                                        color: config.styling.colors.error,
                                        fontSize: '1.25rem'
                                    }}>
                                        ✗
                                    </span>
                                ) : (
                                    <span style={{
                                        color: config.styling.colors.muted,
                                        fontSize: '0.75rem'
                                    }}>
                                        Pending
                                    </span>
                                )}
                            </div>

                            {/* Actions */}
                            <div style={{
                                display: 'flex',
                                gap: '0.5rem',
                                alignItems: 'center'
                            }}>
                                {file.status === 'error' && (
                                    <button
                                        type="button"
                                        onClick={() => actions.retryUpload(file.id)}
                                        style={{
                                            background: 'none',
                                            border: `1px solid ${config.styling.colors.primary}`,
                                            color: config.styling.colors.primary,
                                            cursor: 'pointer',
                                            fontSize: '0.75rem',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '0.25rem'
                                        }}
                                        aria-label={`${config.labels.retryText} ${file.name}`}
                                    >
                                        Retry
                                    </button>
                                )}

                                {(file.status === 'pending' || file.status === 'error') && (
                                    <button
                                        type="button"
                                        onClick={() => actions.removeFile(file.id)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: config.styling.colors.error,
                                            cursor: 'pointer',
                                            fontSize: '1.25rem',
                                            padding: '0.25rem',
                                            borderRadius: '0.25rem'
                                        }}
                                        aria-label={`${config.labels.removeText} ${file.name}`}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Empty State */
                <div style={{
                    border: `2px dashed ${config.styling.colors.border}`,
                    borderRadius: config.styling.spacing.borderRadius,
                    padding: '3rem',
                    textAlign: 'center',
                    backgroundColor: config.styling.colors.background,
                    color: config.styling.colors.muted
                }}>
                    <div style={{
                        fontSize: '3rem',
                        marginBottom: '1rem'
                    }}>
                        📁
                    </div>
                    <div style={{
                        fontSize: config.styling.typography.fontSize,
                        fontWeight: '500',
                        marginBottom: '0.5rem',
                        color: config.styling.colors.foreground
                    }}>
                        No files selected
                    </div>
                    <div style={{
                        fontSize: '0.875rem',
                        color: config.styling.colors.muted
                    }}>
                        Click "Add Files" to get started
                    </div>
                </div>
            )}
        </div>
    )
}

MultiFileUpload.displayName = 'MultiFileUpload'