import React, { createContext, useContext, useReducer, useCallback } from 'react'
import type {
    FileUploadState,
    FileUploadConfig,
    UploadFile,
    FileUploadEventHandlers,
    FileUploadContextValue
} from './file-upload.types'

// Initial state
const initialState: FileUploadState = {
    files: [],
    isUploading: false,
    progress: 0,
    overallProgress: 0,
    error: null,
    isDragOver: false,
    isDropValid: false,
    selectedFiles: [],
    rejectedFiles: [],
    uploadQueue: [],
    completedUploads: [],
    failedUploads: []
}

// Action types
type FileUploadAction =
    | { type: 'SET_FILES'; payload: UploadFile[] }
    | { type: 'ADD_FILES'; payload: UploadFile[] }
    | { type: 'REMOVE_FILE'; payload: string }
    | { type: 'UPDATE_FILE'; payload: { id: string; updates: Partial<UploadFile> } }
    | { type: 'SET_UPLOADING'; payload: boolean }
    | { type: 'SET_PROGRESS'; payload: number }
    | { type: 'SET_OVERALL_PROGRESS'; payload: number }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'SET_DRAG_OVER'; payload: boolean }
    | { type: 'SET_DROP_VALID'; payload: boolean }
    | { type: 'SET_SELECTED_FILES'; payload: File[] }
    | { type: 'CLEAR_ALL' }
    | { type: 'RESET' }

// Reducer
function fileUploadReducer(state: FileUploadState, action: FileUploadAction): FileUploadState {
    switch (action.type) {
        case 'SET_FILES':
            return { ...state, files: action.payload }

        case 'ADD_FILES':
            return { ...state, files: [...state.files, ...action.payload] }

        case 'REMOVE_FILE':
            return {
                ...state,
                files: state.files.filter(file => file.id !== action.payload),
                completedUploads: state.completedUploads.filter(id => id !== action.payload),
                failedUploads: state.failedUploads.filter(id => id !== action.payload),
                uploadQueue: state.uploadQueue.filter(id => id !== action.payload)
            }

        case 'UPDATE_FILE':
            return {
                ...state,
                files: state.files.map(file =>
                    file.id === action.payload.id
                        ? { ...file, ...action.payload.updates }
                        : file
                )
            }

        case 'SET_UPLOADING':
            return { ...state, isUploading: action.payload }

        case 'SET_PROGRESS':
            return { ...state, progress: action.payload }

        case 'SET_OVERALL_PROGRESS':
            return { ...state, overallProgress: action.payload }

        case 'SET_ERROR':
            return { ...state, error: action.payload }

        case 'SET_DRAG_OVER':
            return { ...state, isDragOver: action.payload }

        case 'SET_DROP_VALID':
            return { ...state, isDropValid: action.payload }

        case 'SET_SELECTED_FILES':
            return { ...state, selectedFiles: action.payload }

        case 'CLEAR_ALL':
            return {
                ...state,
                files: [],
                selectedFiles: [],
                rejectedFiles: [],
                uploadQueue: [],
                completedUploads: [],
                failedUploads: [],
                error: null,
                progress: 0,
                overallProgress: 0,
                isUploading: false
            }

        case 'RESET':
            return initialState

        default:
            return state
    }
}

// Context
const FileUploadContext = createContext<FileUploadContextValue | null>(null)

// Provider props
interface FileUploadProviderProps {
    children: React.ReactNode
    config: FileUploadConfig
    handlers?: FileUploadEventHandlers
}

// Provider component
export const FileUploadProvider: React.FC<FileUploadProviderProps> = ({
    children,
    config,
    handlers = {}
}) => {
    const [state, dispatch] = useReducer(fileUploadReducer, initialState)

    // Actions
    const selectFiles = useCallback((files: File[]) => {
        dispatch({ type: 'SET_SELECTED_FILES', payload: files })

        // Create UploadFile objects
        const uploadFiles: UploadFile[] = files.map(file => ({
            id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            file,
            status: 'pending',
            progress: 0,
            size: file.size,
            type: file.type,
            name: file.name,
            lastModified: file.lastModified,
            retryCount: 0,
            maxRetries: 3,
            startedAt: new Date()
        }))

        dispatch({ type: 'ADD_FILES', payload: uploadFiles })

        // Call handler if provided
        if (handlers.onFileSelect) {
            handlers.onFileSelect({
                type: 'select',
                files: uploadFiles,
                timestamp: new Date()
            })
        }
    }, [handlers])

    const removeFile = useCallback((fileId: string) => {
        const fileToRemove = state.files.find(f => f.id === fileId)
        if (fileToRemove) {
            dispatch({ type: 'REMOVE_FILE', payload: fileId })

            // Call handler if provided
            if (handlers.onFileRemove) {
                handlers.onFileRemove({
                    type: 'remove',
                    files: [fileToRemove],
                    timestamp: new Date()
                })
            }
        }
    }, [state.files, handlers])

    const retryUpload = useCallback((fileId: string) => {
        const file = state.files.find(f => f.id === fileId)
        if (file) {
            const updatedFile = {
                ...file,
                status: 'pending' as const,
                progress: 0,
                error: undefined,
                retryCount: file.retryCount + 1
            }

            dispatch({
                type: 'UPDATE_FILE',
                payload: { id: fileId, updates: updatedFile }
            })

            // Call handler if provided
            if (handlers.onUploadRetry) {
                handlers.onUploadRetry({
                    type: 'retry',
                    files: [updatedFile],
                    timestamp: new Date()
                })
            }
        }
    }, [state.files, handlers])

    const clearAll = useCallback(() => {
        dispatch({ type: 'CLEAR_ALL' })
    }, [])

    const uploadFiles = useCallback(async () => {
        const pendingFiles = state.files.filter(f => f.status === 'pending')
        if (pendingFiles.length === 0) return

        dispatch({ type: 'SET_UPLOADING', payload: true })
        dispatch({ type: 'SET_ERROR', payload: null })

        // Call upload start handler
        if (handlers.onUploadStart) {
            handlers.onUploadStart({
                type: 'upload',
                files: pendingFiles,
                timestamp: new Date()
            })
        }

        // This is a placeholder - actual upload logic will be implemented later
        // For now, we'll simulate the upload process
        for (const file of pendingFiles) {
            dispatch({
                type: 'UPDATE_FILE',
                payload: {
                    id: file.id,
                    updates: { status: 'uploading', startedAt: new Date() }
                }
            })

            // Simulate progress
            for (let progress = 0; progress <= 100; progress += 10) {
                await new Promise(resolve => setTimeout(resolve, 100))
                dispatch({
                    type: 'UPDATE_FILE',
                    payload: { id: file.id, updates: { progress } }
                })

                if (handlers.onUploadProgress) {
                    handlers.onUploadProgress({
                        type: 'progress',
                        files: [{ ...file, progress }],
                        timestamp: new Date()
                    })
                }
            }

            // Mark as complete
            dispatch({
                type: 'UPDATE_FILE',
                payload: {
                    id: file.id,
                    updates: {
                        status: 'success',
                        progress: 100,
                        completedAt: new Date()
                    }
                }
            })

            if (handlers.onUploadSuccess) {
                handlers.onUploadSuccess({
                    type: 'success',
                    files: [{ ...file, status: 'success', progress: 100 }],
                    timestamp: new Date()
                })
            }
        }

        dispatch({ type: 'SET_UPLOADING', payload: false })
    }, [state.files, handlers])

    const updateProgress = useCallback((fileId: string, progress: number) => {
        dispatch({
            type: 'UPDATE_FILE',
            payload: { id: fileId, updates: { progress } }
        })
    }, [])

    const setError = useCallback((fileId: string, error: string) => {
        dispatch({
            type: 'UPDATE_FILE',
            payload: {
                id: fileId,
                updates: {
                    status: 'error',
                    error,
                    completedAt: new Date()
                }
            }
        })

        const file = state.files.find(f => f.id === fileId)
        if (file && handlers.onUploadError) {
            handlers.onUploadError({
                type: 'error',
                files: [{ ...file, status: 'error', error }],
                timestamp: new Date()
            })
        }
    }, [state.files, handlers])

    const setSuccess = useCallback((fileId: string) => {
        dispatch({
            type: 'UPDATE_FILE',
            payload: {
                id: fileId,
                updates: {
                    status: 'success',
                    progress: 100,
                    completedAt: new Date()
                }
            }
        })
    }, [])

    const contextValue: FileUploadContextValue = {
        state,
        config,
        actions: {
            selectFiles,
            removeFile,
            retryUpload,
            clearAll,
            uploadFiles,
            updateProgress,
            setError,
            setSuccess
        },
        handlers
    }

    return (
        <FileUploadContext.Provider value={contextValue}>
            {children}
        </FileUploadContext.Provider>
    )
}

// Hook to use the context
export const useFileUpload = (): FileUploadContextValue => {
    const context = useContext(FileUploadContext)
    if (!context) {
        throw new Error('useFileUpload must be used within a FileUploadProvider')
    }
    return context
}

// Hook to use just the state
export const useFileUploadState = (): FileUploadState => {
    const { state } = useFileUpload()
    return state
}

// Hook to use just the actions
export const useFileUploadActions = () => {
    const { actions } = useFileUpload()
    return actions
}

// Hook to use just the config
export const useFileUploadConfig = (): FileUploadConfig => {
    const { config } = useFileUpload()
    return config
}