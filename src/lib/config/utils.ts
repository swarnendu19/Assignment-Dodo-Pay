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
        if (source[key] !== undefined && source[key] !== null) {
            if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                result[key] = deepMerge(result[key] || {}, source[key] as any)
            } else {
                result[key] = source[key] as any
            }
        }
        // If source[key] is null or undefined, keep the target value (don't overwrite)
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
        try {
            config = deepMerge(config, fileConfig)
            markSources(sources, fileConfig, 'file')
        } catch (error) {
            warnings.push(`Failed to merge file configuration: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    // Apply props config if provided (highest priority)
    if (propsConfig) {
        try {
            config = deepMerge(config, propsConfig)
            markSources(sources, propsConfig, 'props')
        } catch (error) {
            warnings.push(`Failed to merge props configuration: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    // Validate the final merged configuration
    const validation = validateConfig(config)
    if (!validation.isValid) {
        warnings.push(`Merged configuration has validation errors: ${validation.errors.map(e => e.message).join(', ')}`)
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


/**
 * Loads configuration from various sources with comprehensive error handling
 */
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
        return await loadConfigFromFile(configSource)
    }

    // Handle object configuration - merge first, then validate
    try {
        const mergedConfig = mergeConfig(configSource)
        const validation = validateConfig(mergedConfig)

        if (validation.isValid) {
            return { config: mergedConfig, errors: [] }
        } else {
            return { config: defaultConfig, errors: validation.errors }
        }
    } catch (error) {
        return {
            config: defaultConfig,
            errors: [{
                path: 'root',
                message: `Failed to process configuration: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
        }
    }
}

/**
 * Loads configuration from a file path with proper error handling
 */
export async function loadConfigFromFile(
    filePath: string
): Promise<{ config: FileUploadConfig; errors: ValidationError[] }> {
    try {
        // Check if running in browser or Node.js environment
        if (typeof window !== 'undefined') {
            // Browser environment - use fetch
            const response = await fetch(filePath)
            if (!response.ok) {
                return {
                    config: defaultConfig,
                    errors: [{
                        path: 'file',
                        message: `Failed to load configuration file: ${response.status} ${response.statusText}`
                    }]
                }
            }

            const jsonString = await response.text()
            return loadConfigFromJSON(jsonString)
        } else {
            // Node.js environment - use fs
            const fs = await import('fs/promises')
            const path = await import('path')

            try {
                const resolvedPath = path.resolve(filePath)
                const jsonString = await fs.readFile(resolvedPath, 'utf-8')
                return loadConfigFromJSON(jsonString)
            } catch (fsError) {
                return {
                    config: defaultConfig,
                    errors: [{
                        path: 'file',
                        message: `Failed to read configuration file: ${fsError instanceof Error ? fsError.message : 'Unknown file system error'}`
                    }]
                }
            }
        }
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

/**
 * Synchronously loads configuration from a JSON string or object
 */
export function loadConfigurationSync(
    configSource: string | DeepPartial<FileUploadConfig>
): { config: FileUploadConfig; errors: ValidationError[] } {
    if (typeof configSource === 'string') {
        return loadConfigFromJSON(configSource)
    }

    // Handle object configuration - merge first, then validate
    try {
        const mergedConfig = mergeConfig(configSource)
        const validation = validateConfig(mergedConfig)

        if (validation.isValid) {
            return { config: mergedConfig, errors: [] }
        } else {
            return { config: defaultConfig, errors: validation.errors }
        }
    } catch (error) {
        return {
            config: defaultConfig,
            errors: [{
                path: 'root',
                message: `Failed to process configuration: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
        }
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

/**
 * Configuration cache for performance optimization
 */
class ConfigurationCache {
    private cache = new Map<string, { config: FileUploadConfig; timestamp: number }>()
    private readonly TTL = 5 * 60 * 1000 // 5 minutes

    get(key: string): FileUploadConfig | null {
        const cached = this.cache.get(key)
        if (!cached) return null

        if (Date.now() - cached.timestamp > this.TTL) {
            this.cache.delete(key)
            return null
        }

        return cached.config
    }

    set(key: string, config: FileUploadConfig): void {
        this.cache.set(key, { config, timestamp: Date.now() })
    }

    clear(): void {
        this.cache.clear()
    }

    has(key: string): boolean {
        const cached = this.cache.get(key)
        if (!cached) return false

        if (Date.now() - cached.timestamp > this.TTL) {
            this.cache.delete(key)
            return false
        }

        return true
    }
}

export const configCache = new ConfigurationCache()

/**
 * Loads configuration with caching support
 */
export async function loadConfigurationWithCache(
    configSource?: string | DeepPartial<FileUploadConfig>,
    useCache = true
): Promise<{ config: FileUploadConfig; errors: ValidationError[]; fromCache: boolean }> {
    // Generate cache key for string sources
    const cacheKey = typeof configSource === 'string' ? configSource : JSON.stringify(configSource)

    if (useCache && typeof configSource === 'string' && configCache.has(cacheKey)) {
        const cachedConfig = configCache.get(cacheKey)!
        return { config: cachedConfig, errors: [], fromCache: true }
    }

    const result = await loadConfiguration(configSource)

    // Cache successful configurations
    if (result.errors.length === 0 && typeof configSource === 'string') {
        configCache.set(cacheKey, result.config)
    }

    return { ...result, fromCache: false }
}

/**
 * Validates configuration with detailed error reporting
 */
export function validateConfigurationWithDetails(
    config: any
): { isValid: boolean; errors: ValidationError[]; warnings: string[]; summary: string } {
    const validation = validateConfig(config)
    const warnings: string[] = []

    // Add warnings for potentially problematic configurations
    if (config?.validation?.maxSize && config.validation.maxSize > 100 * 1024 * 1024) {
        warnings.push('Large maximum file size (>100MB) may cause performance issues')
    }

    if (config?.validation?.maxFiles && config.validation.maxFiles > 50) {
        warnings.push('High maximum file count (>50) may impact UI performance')
    }

    if (config?.animations?.duration && config.animations.duration > 1000) {
        warnings.push('Long animation duration (>1s) may feel sluggish to users')
    }

    if (config?.features?.chunkedUpload && !config?.features?.resumableUpload) {
        warnings.push('Chunked upload without resumable upload may not provide optimal user experience')
    }

    const summary = validation.isValid
        ? `Configuration is valid${warnings.length > 0 ? ` with ${warnings.length} warning(s)` : ''}`
        : `Configuration has ${validation.errors.length} error(s)${warnings.length > 0 ? ` and ${warnings.length} warning(s)` : ''}`

    return {
        isValid: validation.isValid,
        errors: validation.errors,
        warnings,
        summary
    }
}

/**
 * Merges configurations with conflict resolution
 */
export function mergeConfigurationsWithConflictResolution(
    configs: Array<{ config: DeepPartial<FileUploadConfig>; priority: number; source: string }>,
    conflictResolution: 'highest-priority' | 'merge-arrays' | 'user-choice' = 'highest-priority'
): { config: FileUploadConfig; conflicts: Array<{ path: string; values: Array<{ source: string; value: any }> }> } {
    const conflicts: Array<{ path: string; values: Array<{ source: string; value: any }> }> = []

    // Sort by priority (lowest first, so highest priority overwrites)
    const sortedConfigs = configs.sort((a, b) => a.priority - b.priority)

    // Start with default config
    const mergedConfig: any = { ...defaultConfig }

    // Track conflicts during merge
    function mergeWithConflictTracking(
        target: any,
        source: any,
        sourceName: string,
        path = ''
    ) {
        for (const key in source) {
            const currentPath = path ? `${path}.${key}` : key

            if (source[key] !== undefined) {
                if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                    if (!target[key]) target[key] = {}
                    mergeWithConflictTracking(target[key], source[key], sourceName, currentPath)
                } else {
                    // Check for conflicts (only if target already has a value and it's different)
                    if (target[key] !== undefined && target[key] !== source[key]) {
                        const existingConflict = conflicts.find(c => c.path === currentPath)
                        if (existingConflict) {
                            existingConflict.values.push({ source: sourceName, value: source[key] })
                        } else {
                            conflicts.push({
                                path: currentPath,
                                values: [
                                    { source: 'previous', value: target[key] },
                                    { source: sourceName, value: source[key] }
                                ]
                            })
                        }
                    }

                    target[key] = source[key]
                }
            }
        }
    }

    // Apply configurations in priority order (lowest to highest)
    for (const { config, source } of sortedConfigs) {
        mergeWithConflictTracking(mergedConfig, config, source)
    }

    return { config: mergedConfig as FileUploadConfig, conflicts }
}

/**
 * Exports configuration to different formats
 */
export function exportConfiguration(
    config: FileUploadConfig,
    format: 'json' | 'typescript' | 'yaml' | 'env' = 'json'
): string {
    switch (format) {
        case 'json':
            return JSON.stringify(config, null, 2)

        case 'typescript':
            return `import { FileUploadConfig } from './types'

export const fileUploadConfig: FileUploadConfig = ${JSON.stringify(config, null, 2)} as const`

        case 'yaml':
            // Simple YAML export (would need a proper YAML library for complex cases)
            return convertToYAML(config)

        case 'env':
            return convertToEnvVars(config)

        default:
            return JSON.stringify(config, null, 2)
    }
}

/**
 * Simple YAML converter (basic implementation)
 */
function convertToYAML(obj: any, indent = 0): string {
    const spaces = '  '.repeat(indent)
    let yaml = ''

    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            yaml += `${spaces}${key}:\n${convertToYAML(value, indent + 1)}`
        } else if (Array.isArray(value)) {
            yaml += `${spaces}${key}:\n`
            for (const item of value) {
                yaml += `${spaces}  - ${JSON.stringify(item)}\n`
            }
        } else {
            yaml += `${spaces}${key}: ${JSON.stringify(value)}\n`
        }
    }

    return yaml
}

/**
 * Convert configuration to environment variables
 */
function convertToEnvVars(config: FileUploadConfig): string {
    const envVars: string[] = []

    function flattenObject(obj: any, prefix = 'FILE_UPLOAD') {
        for (const [key, value] of Object.entries(obj)) {
            const envKey = `${prefix}_${key.toUpperCase()}`

            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                flattenObject(value, envKey)
            } else if (Array.isArray(value)) {
                envVars.push(`${envKey}=${JSON.stringify(value)}`)
            } else {
                envVars.push(`${envKey}=${value}`)
            }
        }
    }

    flattenObject(config)
    return envVars.join('\n')
}

/**
 * Creates a configuration builder for fluent API
 */
export class ConfigurationBuilder {
    private config: DeepPartial<FileUploadConfig> = {}

    variant(variant: FileUploadConfig['defaults']['variant']): this {
        if (!this.config.defaults) this.config.defaults = {}
        this.config.defaults.variant = variant
        return this
    }

    size(size: FileUploadConfig['defaults']['size']): this {
        if (!this.config.defaults) this.config.defaults = {}
        this.config.defaults.size = size
        return this
    }

    theme(theme: FileUploadConfig['defaults']['theme']): this {
        if (!this.config.defaults) this.config.defaults = {}
        this.config.defaults.theme = theme
        return this
    }

    maxSize(maxSize: number): this {
        if (!this.config.validation) this.config.validation = {}
        this.config.validation.maxSize = maxSize
        return this
    }

    maxFiles(maxFiles: number): this {
        if (!this.config.validation) this.config.validation = {}
        this.config.validation.maxFiles = maxFiles
        return this
    }

    allowedTypes(types: string[]): this {
        if (!this.config.validation) this.config.validation = {}
        this.config.validation.allowedTypes = types
        return this
    }

    colors(colors: Partial<FileUploadConfig['styling']['colors']>): this {
        if (!this.config.styling) this.config.styling = {}
        if (!this.config.styling.colors) this.config.styling.colors = {}
        Object.assign(this.config.styling.colors, colors)
        return this
    }

    features(features: Partial<FileUploadConfig['features']>): this {
        if (!this.config.features) this.config.features = {}
        Object.assign(this.config.features, features)
        return this
    }

    labels(labels: Partial<FileUploadConfig['labels']>): this {
        if (!this.config.labels) this.config.labels = {}
        Object.assign(this.config.labels, labels)
        return this
    }

    build(): FileUploadConfig {
        return mergeConfig(this.config)
    }

    buildPartial(): DeepPartial<FileUploadConfig> {
        return this.config
    }

    validate(): { isValid: boolean; errors: ValidationError[] } {
        // Validate the merged configuration, not the partial one
        try {
            const mergedConfig = mergeConfig(this.config)
            return validateConfig(mergedConfig)
        } catch (error) {
            return {
                isValid: false,
                errors: [{
                    path: 'root',
                    message: `Failed to validate configuration: ${error instanceof Error ? error.message : 'Unknown error'}`
                }]
            }
        }
    }
}

/**
 * Factory function for creating configuration builder
 */
export function createConfigurationBuilder(): ConfigurationBuilder {
    return new ConfigurationBuilder()
}

/**
 * Configuration migration utilities
 */
export interface ConfigurationMigration {
    version: string
    migrate: (config: any) => any
    description: string
}

export class ConfigurationMigrator {
    private migrations: ConfigurationMigration[] = []

    addMigration(migration: ConfigurationMigration): this {
        this.migrations.push(migration)
        this.migrations.sort((a, b) => a.version.localeCompare(b.version))
        return this
    }

    migrate(config: any, fromVersion: string, toVersion: string): { config: any; appliedMigrations: string[] } {
        const appliedMigrations: string[] = []
        let currentConfig = { ...config }

        for (const migration of this.migrations) {
            if (migration.version > fromVersion && migration.version <= toVersion) {
                currentConfig = migration.migrate(currentConfig)
                appliedMigrations.push(migration.version)
            }
        }

        return { config: currentConfig, appliedMigrations }
    }

    getAvailableMigrations(): ConfigurationMigration[] {
        return [...this.migrations]
    }
}

/**
 * Default configuration migrator with common migrations
 */
export const defaultMigrator = new ConfigurationMigrator()
    .addMigration({
        version: '1.1.0',
        description: 'Add accessibility configuration',
        migrate: (config) => ({
            ...config,
            accessibility: {
                announceFileSelection: true,
                announceProgress: true,
                announceErrors: true,
                keyboardNavigation: true,
                focusManagement: true,
                ...config.accessibility
            }
        })
    })
    .addMigration({
        version: '1.2.0',
        description: 'Add animation configuration',
        migrate: (config) => ({
            ...config,
            animations: {
                enabled: true,
                duration: 200,
                easing: 'ease-in-out',
                ...config.animations
            }
        })
    })