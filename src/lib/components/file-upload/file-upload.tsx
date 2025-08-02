import React, { useMemo, useEffect } from 'react'
import type { FileUploadProps, FileUploadConfig } from './file-upload.types'
import { FileUploadProvider } from './file-upload-context'
import { defaultConfig, mergeConfig, loadConfigFromJSON } from '../../config/schema'
import { generateThemeClasses, applyTheme, cn } from '../../utils/theme'

// Import variant components
import { ButtonUpload } from './variants/button-upload'
import { DropzoneUpload } from './variants/dropzone-upload'
import { PreviewUpload } from './variants/preview-upload'
import { ImageUpload } from './variants/image-upload'
import { MultiFileUpload } from './variants/multi-file-upload'

export const FileUpload: React.FC<FileUploadProps> = ({
    variant,
    size,
    radius,
    theme,
    disabled,
    multiple,
    accept,
    maxSize,
    maxFiles,
    onUpload,
    onError,
    onProgress,
    onFileSelect,
    onFileRemove,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
    config: configProp,
    className,
    style,
    ariaLabel,
    ariaDescribedBy,
    children,
    ...props
}) => {
    // Merge configuration: default < config file/object < props
    const mergedConfig = useMemo((): FileUploadConfig => {
        let baseConfig = defaultConfig

        // If config is provided as a string (JSON path) or object
        if (configProp) {
            if (typeof configProp === 'string') {
                // Try to load from JSON string (could be file path or JSON content)
                try {
                    const { config: loadedConfig } = loadConfigFromJSON(configProp)
                    if (loadedConfig) {
                        baseConfig = loadedConfig
                    }
                } catch (error) {
                    console.warn('Failed to load config from string:', error)
                }
            } else {
                // Merge with provided config object
                baseConfig = mergeConfig(configProp)
            }
        }

        // Override with explicit props (props take highest priority)
        const propOverrides: Partial<FileUploadConfig> = {}

        if (variant !== undefined) {
            propOverrides.defaults = { ...propOverrides.defaults, variant }
        }
        if (size !== undefined) {
            propOverrides.defaults = { ...propOverrides.defaults, size }
        }
        if (radius !== undefined) {
            propOverrides.defaults = { ...propOverrides.defaults, radius }
        }
        if (theme !== undefined) {
            propOverrides.defaults = { ...propOverrides.defaults, theme }
            propOverrides.styling = { ...propOverrides.styling, theme }
        }
        if (disabled !== undefined) {
            propOverrides.defaults = { ...propOverrides.defaults, disabled }
        }
        if (multiple !== undefined) {
            propOverrides.defaults = { ...propOverrides.defaults, multiple }
            propOverrides.features = { ...propOverrides.features, multipleFiles: multiple }
        }
        if (accept !== undefined) {
            propOverrides.defaults = { ...propOverrides.defaults, accept }
        }
        if (maxSize !== undefined) {
            propOverrides.defaults = { ...propOverrides.defaults, maxSize }
            propOverrides.validation = { ...propOverrides.validation, maxSize }
        }
        if (maxFiles !== undefined) {
            propOverrides.defaults = { ...propOverrides.defaults, maxFiles }
            propOverrides.validation = { ...propOverrides.validation, maxFiles }
        }

        return Object.keys(propOverrides).length > 0
            ? mergeConfig({ ...baseConfig, ...propOverrides })
            : baseConfig
    }, [configProp, variant, size, radius, theme, disabled, multiple, accept, maxSize, maxFiles])

    // Create event handlers object
    const eventHandlers = useMemo(() => ({
        onFileSelect: onFileSelect ? (event: any) => onFileSelect(event.files.map((f: any) => f.file)) : undefined,
        onUploadStart: onUpload ? (event: any) => onUpload(event.files.map((f: any) => f.file)) : undefined,
        onUploadProgress: onProgress ? (event: any) => {
            const file = event.files[0]
            if (file) {
                onProgress(file.progress, file)
            }
        } : undefined,
        onUploadSuccess: undefined, // Will be handled internally
        onUploadError: onError ? (event: any) => {
            const file = event.files[0]
            if (file?.error) {
                onError(file.error)
            }
        } : undefined,
        onFileRemove: onFileRemove ? (event: any) => {
            const file = event.files[0]
            if (file) {
                onFileRemove(file.id)
            }
        } : undefined,
        onUploadRetry: undefined // Will be handled internally
    }), [onUpload, onError, onProgress, onFileSelect, onFileRemove])

    // Apply theme when config changes
    useEffect(() => {
        if (mergedConfig.styling?.theme) {
            applyTheme(mergedConfig.styling.theme, mergedConfig)
        }
    }, [mergedConfig])

    // Get the effective values from merged config
    const effectiveVariant = mergedConfig.defaults.variant
    const effectiveSize = mergedConfig.defaults.size
    const effectiveRadius = mergedConfig.defaults.radius
    const effectiveTheme = mergedConfig.styling.theme

    // Generate theme classes
    const themeClasses = generateThemeClasses(
        effectiveVariant,
        effectiveSize,
        effectiveRadius,
        mergedConfig
    )

    // Combine all classes
    const combinedClassName = cn(
        themeClasses,
        disabled && 'file-upload--disabled',
        className
    )

    // Generate CSS variables for inline styles
    const cssVariables = useMemo(() => {
        const variables: Record<string, string> = {}

        if (mergedConfig.styling) {
            const { colors, spacing, typography, borders, shadows } = mergedConfig.styling

            // Apply color variables
            if (colors) {
                Object.entries(colors).forEach(([key, value]) => {
                    variables[`--file-upload-${key}`] = value
                })
            }

            // Apply spacing variables
            if (spacing) {
                Object.entries(spacing).forEach(([key, value]) => {
                    variables[`--file-upload-spacing-${key}`] = value
                })
            }

            // Apply typography variables
            if (typography) {
                Object.entries(typography).forEach(([key, value]) => {
                    variables[`--file-upload-${key}`] = value
                })
            }

            // Apply border variables
            if (borders) {
                Object.entries(borders).forEach(([key, value]) => {
                    variables[`--file-upload-border-${key}`] = value
                })
            }

            // Apply shadow variables
            if (shadows) {
                Object.entries(shadows).forEach(([key, value]) => {
                    variables[`--file-upload-shadow-${key}`] = value
                })
            }
        }

        return variables
    }, [mergedConfig])

    // Combine inline styles
    const combinedStyle = {
        ...cssVariables,
        ...style
    }

    // Render the appropriate variant component
    const renderVariant = () => {
        const commonProps = {
            className: combinedClassName,
            style: combinedStyle,
            ariaLabel,
            ariaDescribedBy,
            onDragEnter,
            onDragLeave,
            onDragOver,
            onDrop,
            children,
            ...props
        }

        switch (effectiveVariant) {
            case 'dropzone':
                return <DropzoneUpload {...commonProps} />
            case 'preview':
                return <PreviewUpload {...commonProps} />
            case 'image-only':
                return <ImageUpload {...commonProps} />
            case 'multi-file':
                return <MultiFileUpload {...commonProps} />
            case 'button':
            default:
                return <ButtonUpload {...commonProps} />
        }
    }

    return (
        <FileUploadProvider config={mergedConfig} handlers={eventHandlers}>
            <div
                data-theme={effectiveTheme}
                className="file-upload-wrapper"
                style={cssVariables}
            >
                {renderVariant()}
            </div>
        </FileUploadProvider>
    )
}

FileUpload.displayName = 'FileUpload'