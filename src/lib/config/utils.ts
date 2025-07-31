import {
    FileUploadConfig,
    DeepPartial,
    ConfigMergeResult,
    ConfigurationSource,
    ValidationResult,
    ValidationError
} from '../components/file-upload/file-upload.types'
import { defaultConfig, validateConfig, mergeConfig, loadConfigFromJSON } from './schema'


export function deepMerge<T extends Record<string, any>>(target: T, source: DeepPartial<T>): T {
    const result = { ...target }

    for (const key in source) {
        if (source[key] !== undefined) {
            if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                result[key] = deepMerge(result[key] || {}, source[key] as any)
            } else {
                result[key] = source[key] as any
            }
        }
    }

    return result
}

/**
 * Merges multiple configuration sources with priority
 * Priority: props > file config > default config
 */
export function mergeConfigurations(
    fileConfig?: DeepPartial<FileUploadConfig>,
    propsConfig?: DeepPartial<FileUploadConfig>
): ConfigMergeResult {
    const sources: Record<string, ConfigurationSource> = {}
    const warnings: string[] = []

    // Start with default config
    let config = { ...defaultConfig }

    // Apply file config if provided
    if (fileConfig) {
        const validation = validateConfig(fileConfig)
        if (validation.isValid) {
            config = deepMerge(config, fileConfig)
            markSources(sources, fileConfig, 'file')
        } else {
            warnings.push(`File configuration has validation errors: ${validation.errors.map(e => e.message).join(', ')}`)
        }
    }

    // Apply props config if provided (highest priority)
    if (propsConfig) {
        const validation = validateConfig(propsConfig)
        if (validation.isValid) {
            config = deepMerge(config, propsConfig)
            markSources(sources, propsConfig, 'props')
        } else {
            warnings.push(`Props configuration has validation errors: ${validation.errors.map(e => e.message).join(', ')}`)
        }
    }

    return { config, sources, warnings }
}


function markSources(
    sources: Record<string, ConfigurationSource>,
    config: DeepPartial<FileUploadConfig>,
    source: ConfigurationSource,
    prefix = ''
) {
    for (const [key, value] of Object.entries(config)) {
        const fullKey = prefix ? `${prefix}.${key}` : key

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            markSources(sources, value, source, fullKey)
        } else {
            sources[fullKey] = source
        }
    }
}


export async function loadConfiguration(
    configSource?: string | DeepPartial<FileUploadConfig>
): Promise<{ config: FileUploadConfig; errors: ValidationError[] }> {
    if (!configSource) {
        return { config: defaultConfig, errors: [] }
    }

    if (typeof configSource === 'string') {
        // Try to load as JSON string first
        if (configSource.trim().startsWith('{')) {
            return loadConfigFromJSON(configSource)
        }

        // Otherwise treat as file path
        try {
            const response = await fetch(configSource)
            if (!response.ok) {
                return {
                    config: defaultConfig,
                    errors: [{
                        path: 'file',
                        message: `Failed to load configuration file: ${response.statusText}`
                    }]
                }
            }

            const jsonString = await response.text()
            return loadConfigFromJSON(jsonString)
        } catch (error) {
            return {
                config: defaultConfig,
                errors: [{
                    path: 'file',
                    message: `Failed to load configuration file: ${error instanceof Error ? error.message : 'Unknown error'}`
                }]
            }
        }
    }

    // Handle object configuration
    const validation = validateConfig(configSource)
    if (validation.isValid) {
        return { config: mergeConfig(configSource), errors: [] }
    } else {
        return { config: defaultConfig, errors: validation.errors }
    }
}


export function createConfigPreset(preset: 'minimal' | 'full-featured' | 'image-only' | 'drag-drop'): FileUploadConfig {
    const base = { ...defaultConfig }

    switch (preset) {
        case 'minimal':
            return {
                ...base,
                defaults: {
                    ...base.defaults,
                    variant: 'button'
                },
                features: {
                    ...base.features,
                    dragAndDrop: false,
                    preview: false,
                    progress: false,
                    multipleFiles: false,
                    removeFiles: false,
                    retryFailed: false,
                    showFileSize: false,
                    showFileType: false
                }
            }

        case 'full-featured':
            return {
                ...base,
                defaults: {
                    ...base.defaults,
                    variant: 'multi-file',
                    multiple: true
                },
                features: {
                    ...base.features,
                    dragAndDrop: true,
                    preview: true,
                    progress: true,
                    multipleFiles: true,
                    removeFiles: true,
                    retryFailed: true,
                    showFileSize: true,
                    showFileType: true,
                    chunkedUpload: true,
                    resumableUpload: true
                }
            }

        case 'image-only':
            return {
                ...base,
                defaults: {
                    ...base.defaults,
                    variant: 'image-only',
                    accept: 'image/*'
                },
                validation: {
                    ...base.validation,
                    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
                    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
                    validateDimensions: true,
                    maxWidth: 4096,
                    maxHeight: 4096
                },
                features: {
                    ...base.features,
                    preview: true,
                    showFileSize: true,
                    showFileType: false
                }
            }

        case 'drag-drop':
            return {
                ...base,
                defaults: {
                    ...base.defaults,
                    variant: 'dropzone',
                    multiple: true
                },
                features: {
                    ...base.features,
                    dragAndDrop: true,
                    preview: true,
                    progress: true,
                    multipleFiles: true,
                    removeFiles: true
                }
            }

        default:
            return base
    }
}


export function getConfigurationErrors(config: any): string[] {
    const validation = validateConfig(config)
    return validation.errors.map(error => {
        const path = error.path.replace(/\./g, ' → ')
        return `${path}: ${error.message}`
    })
}


export function generateTypeDefinitions(config: FileUploadConfig): string {
    return `
// Generated type definitions from configuration
export interface GeneratedFileUploadConfig {
    defaults: {
        variant: '${config.defaults.variant}'
        size: '${config.defaults.size}'
        radius: '${config.defaults.radius}'
        theme: '${config.defaults.theme}'
        multiple: ${config.defaults.multiple}
        disabled: ${config.defaults.disabled}
        accept: '${config.defaults.accept}'
        maxSize: ${config.defaults.maxSize}
        maxFiles: ${config.defaults.maxFiles}
    }
    // ... additional type definitions would be generated here
}
`
}


export function configToCSSProperties(config: FileUploadConfig): Record<string, string> {
    const cssProps: Record<string, string> = {}

    // Colors
    Object.entries(config.styling.colors).forEach(([key, value]) => {
        cssProps[`--file-upload-color-${key}`] = value
    })

    // Spacing
    Object.entries(config.styling.spacing).forEach(([key, value]) => {
        cssProps[`--file-upload-spacing-${key}`] = value
    })

    // Typography
    Object.entries(config.styling.typography).forEach(([key, value]) => {
        cssProps[`--file-upload-typography-${key}`] = value
    })

    // Borders
    Object.entries(config.styling.borders).forEach(([key, value]) => {
        cssProps[`--file-upload-border-${key}`] = value
    })

    // Shadows
    Object.entries(config.styling.shadows).forEach(([key, value]) => {
        cssProps[`--file-upload-shadow-${key}`] = value
    })

    // Animations
    cssProps['--file-upload-animation-duration'] = `${config.animations.duration}ms`
    cssProps['--file-upload-animation-easing'] = config.animations.easing

    return cssProps
}


export function diffConfigurations(
    config1: FileUploadConfig,
    config2: FileUploadConfig
): { added: string[]; removed: string[]; changed: string[] } {
    const added: string[] = []
    const removed: string[] = []
    const changed: string[] = []

    function compareObjects(obj1: any, obj2: any, path = '') {
        const keys1 = Object.keys(obj1 || {})
        const keys2 = Object.keys(obj2 || {})

        // Check for removed keys
        keys1.forEach(key => {
            const fullPath = path ? `${path}.${key}` : key
            if (!(key in obj2)) {
                removed.push(fullPath)
            } else if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
                compareObjects(obj1[key], obj2[key], fullPath)
            } else if (obj1[key] !== obj2[key]) {
                changed.push(fullPath)
            }
        })

        // Check for added keys
        keys2.forEach(key => {
            const fullPath = path ? `${path}.${key}` : key
            if (!(key in obj1)) {
                added.push(fullPath)
            }
        })
    }

    compareObjects(config1, config2)

    return { added, removed, changed }
}