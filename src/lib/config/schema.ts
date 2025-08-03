import { FileUploadConfig } from '../components/file-upload/file-upload.types'

export const defaultConfig: FileUploadConfig = {
    defaults: {
        variant: 'button',
        size: 'md',
        radius: 'md',
        theme: 'auto',
        multiple: false,
        disabled: false,
        accept: '*',
        maxSize: 10 * 1024 * 1024,
        maxFiles: 5
    },
    validation: {
        maxSize: 10 * 1024 * 1024,
        maxFiles: 5,
        allowedTypes: ['*'],
        allowedExtensions: ['*'],
        minSize: 0,
        validateDimensions: false
    },
    styling: {
        theme: 'auto',
        colors: {
            primary: '#3b82f6',
            secondary: '#6b7280',
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            background: '#ffffff',
            foreground: '#1f2937',
            border: '#d1d5db',
            muted: '#9ca3af'
        },
        spacing: {
            padding: '1rem',
            margin: '0.5rem',
            gap: '0.5rem',
            borderRadius: '0.375rem'
        },
        typography: {
            fontSize: '0.875rem',
            fontWeight: '400',
            lineHeight: '1.25rem'
        },
        borders: {
            width: '1px',
            style: 'solid',
            color: '#d1d5db'
        },
        shadows: {
            sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
        }
    },
    labels: {
        uploadText: 'Choose files to upload',
        dragText: 'Drag and drop files here',
        dropText: 'Drop files here',
        browseText: 'Browse',
        errorText: 'Upload failed',
        successText: 'Upload successful',
        progressText: 'Uploading...',
        removeText: 'Remove',
        retryText: 'Retry',
        cancelText: 'Cancel',
        selectFilesText: 'Select files',
        maxSizeText: 'File too large',
        invalidTypeText: 'Invalid file type',
        tooManyFilesText: 'Too many files'
    },
    features: {
        dragAndDrop: true,
        preview: true,
        progress: true,
        multipleFiles: false,
        removeFiles: true,
        retryFailed: true,
        showFileSize: true,
        showFileType: true,
        autoUpload: false,
        chunkedUpload: false,
        resumableUpload: false
    },
    animations: {
        enabled: true,
        duration: 200,
        easing: 'ease-in-out'
    },
    accessibility: {
        announceFileSelection: true,
        announceProgress: true,
        announceErrors: true,
        keyboardNavigation: true,
        focusManagement: true
    }
}


export const configSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'File Upload Component Configuration',
    description: 'Configuration schema for the file upload component library',
    type: 'object',
    properties: {
        defaults: {
            type: 'object',
            description: 'Default values for component props',
            properties: {
                variant: {
                    type: 'string',
                    enum: ['button', 'dropzone', 'preview', 'image-only', 'multi-file'],
                    description: 'Default variant to use'
                },
                size: {
                    type: 'string',
                    enum: ['sm', 'md', 'lg'],
                    description: 'Default size'
                },
                radius: {
                    type: 'string',
                    enum: ['none', 'sm', 'md', 'lg', 'full'],
                    description: 'Default border radius'
                },
                theme: {
                    type: 'string',
                    enum: ['light', 'dark', 'auto'],
                    description: 'Default theme'
                },
                multiple: {
                    type: 'boolean',
                    description: 'Allow multiple file selection by default'
                },
                disabled: {
                    type: 'boolean',
                    description: 'Disabled state by default'
                },
                accept: {
                    type: 'string',
                    description: 'Default accepted file types'
                },
                maxSize: {
                    type: 'number',
                    minimum: 0,
                    description: 'Default maximum file size in bytes'
                },
                maxFiles: {
                    type: 'number',
                    minimum: 1,
                    description: 'Default maximum number of files'
                }
            },
            required: ['variant', 'size', 'radius', 'theme', 'multiple', 'disabled', 'accept', 'maxSize', 'maxFiles'],
            additionalProperties: false
        },
        validation: {
            type: 'object',
            description: 'File validation rules',
            properties: {
                maxSize: {
                    type: 'number',
                    minimum: 0,
                    description: 'Maximum file size in bytes'
                },
                maxFiles: {
                    type: 'number',
                    minimum: 1,
                    description: 'Maximum number of files'
                },
                allowedTypes: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Allowed MIME types'
                },
                allowedExtensions: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Allowed file extensions'
                },
                minSize: {
                    type: 'number',
                    minimum: 0,
                    description: 'Minimum file size in bytes'
                },
                validateDimensions: {
                    type: 'boolean',
                    description: 'Whether to validate image dimensions'
                },
                maxWidth: {
                    type: 'number',
                    minimum: 1,
                    description: 'Maximum image width in pixels'
                },
                maxHeight: {
                    type: 'number',
                    minimum: 1,
                    description: 'Maximum image height in pixels'
                },
                minWidth: {
                    type: 'number',
                    minimum: 1,
                    description: 'Minimum image width in pixels'
                },
                minHeight: {
                    type: 'number',
                    minimum: 1,
                    description: 'Minimum image height in pixels'
                }
            },
            required: ['maxSize', 'maxFiles', 'allowedTypes', 'allowedExtensions'],
            additionalProperties: false
        },
        styling: {
            type: 'object',
            description: 'Visual styling configuration',
            properties: {
                theme: {
                    type: 'string',
                    enum: ['light', 'dark', 'auto'],
                    description: 'Theme mode'
                },
                colors: {
                    type: 'object',
                    properties: {
                        primary: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
                        secondary: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
                        success: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
                        error: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
                        warning: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
                        background: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
                        foreground: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
                        border: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
                        muted: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' }
                    },
                    required: ['primary', 'secondary', 'success', 'error', 'warning', 'background', 'foreground', 'border', 'muted'],
                    additionalProperties: false
                },
                spacing: {
                    type: 'object',
                    properties: {
                        padding: { type: 'string' },
                        margin: { type: 'string' },
                        gap: { type: 'string' },
                        borderRadius: { type: 'string' }
                    },
                    required: ['padding', 'margin', 'gap', 'borderRadius'],
                    additionalProperties: false
                },
                typography: {
                    type: 'object',
                    properties: {
                        fontSize: { type: 'string' },
                        fontWeight: { type: 'string' },
                        lineHeight: { type: 'string' }
                    },
                    required: ['fontSize', 'fontWeight', 'lineHeight'],
                    additionalProperties: false
                },
                borders: {
                    type: 'object',
                    properties: {
                        width: { type: 'string' },
                        style: {
                            type: 'string',
                            enum: ['solid', 'dashed', 'dotted', 'none']
                        },
                        color: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' }
                    },
                    required: ['width', 'style', 'color'],
                    additionalProperties: false
                },
                shadows: {
                    type: 'object',
                    properties: {
                        sm: { type: 'string' },
                        md: { type: 'string' },
                        lg: { type: 'string' }
                    },
                    required: ['sm', 'md', 'lg'],
                    additionalProperties: false
                }
            },
            required: ['theme', 'colors', 'spacing', 'typography', 'borders', 'shadows'],
            additionalProperties: false
        },
        labels: {
            type: 'object',
            description: 'Text labels and messages',
            properties: {
                uploadText: { type: 'string' },
                dragText: { type: 'string' },
                dropText: { type: 'string' },
                browseText: { type: 'string' },
                errorText: { type: 'string' },
                successText: { type: 'string' },
                progressText: { type: 'string' },
                removeText: { type: 'string' },
                retryText: { type: 'string' },
                cancelText: { type: 'string' },
                selectFilesText: { type: 'string' },
                maxSizeText: { type: 'string' },
                invalidTypeText: { type: 'string' },
                tooManyFilesText: { type: 'string' }
            },
            required: [
                'uploadText', 'dragText', 'dropText', 'browseText', 'errorText',
                'successText', 'progressText', 'removeText', 'retryText', 'cancelText',
                'selectFilesText', 'maxSizeText', 'invalidTypeText', 'tooManyFilesText'
            ],
            additionalProperties: false
        },
        features: {
            type: 'object',
            description: 'Feature toggles',
            properties: {
                dragAndDrop: { type: 'boolean' },
                preview: { type: 'boolean' },
                progress: { type: 'boolean' },
                multipleFiles: { type: 'boolean' },
                removeFiles: { type: 'boolean' },
                retryFailed: { type: 'boolean' },
                showFileSize: { type: 'boolean' },
                showFileType: { type: 'boolean' },
                autoUpload: { type: 'boolean' },
                chunkedUpload: { type: 'boolean' },
                resumableUpload: { type: 'boolean' }
            },
            required: [
                'dragAndDrop', 'preview', 'progress', 'multipleFiles', 'removeFiles',
                'retryFailed', 'showFileSize', 'showFileType', 'autoUpload',
                'chunkedUpload', 'resumableUpload'
            ],
            additionalProperties: false
        },
        animations: {
            type: 'object',
            description: 'Animation settings',
            properties: {
                enabled: { type: 'boolean' },
                duration: {
                    type: 'number',
                    minimum: 0,
                    maximum: 5000
                },
                easing: { type: 'string' }
            },
            required: ['enabled', 'duration', 'easing'],
            additionalProperties: false
        },
        accessibility: {
            type: 'object',
            description: 'Accessibility settings',
            properties: {
                announceFileSelection: { type: 'boolean' },
                announceProgress: { type: 'boolean' },
                announceErrors: { type: 'boolean' },
                keyboardNavigation: { type: 'boolean' },
                focusManagement: { type: 'boolean' }
            },
            required: [
                'announceFileSelection', 'announceProgress', 'announceErrors',
                'keyboardNavigation', 'focusManagement'
            ],
            additionalProperties: false
        }
    },
    required: ['defaults', 'validation', 'styling', 'labels', 'features', 'animations', 'accessibility'],
    additionalProperties: false
}

export interface ValidationResult {
    isValid: boolean
    errors: ValidationError[]
}

export interface ValidationError {
    path: string
    message: string
    value?: any
    severity?: 'error' | 'warning'
    code?: string
    suggestion?: string
}


export function validateConfig(config: any): ValidationResult {
    const errors: ValidationError[] = []

    try {

        if (!config || typeof config !== 'object') {
            errors.push({
                path: 'root',
                message: 'Configuration must be an object',
                value: config
            })
            return { isValid: false, errors }
        }


        const requiredProps = ['defaults', 'validation', 'styling', 'labels', 'features', 'animations', 'accessibility']
        for (const prop of requiredProps) {
            if (!(prop in config)) {
                errors.push({
                    path: prop,
                    message: `Required property '${prop}' is missing`
                })
            }
        }


        if (config.defaults) {
            validateDefaults(config.defaults, errors)
        }


        if (config.validation) {
            validateValidationRules(config.validation, errors)
        }


        if (config.styling) {
            validateStyling(config.styling, errors)
        }

        if (config.labels) {
            validateLabels(config.labels, errors)
        }


        if (config.features) {
            validateFeatures(config.features, errors)
        }


        if (config.animations) {
            validateAnimations(config.animations, errors)
        }


        if (config.accessibility) {
            validateAccessibility(config.accessibility, errors)
        }

    } catch (error) {
        errors.push({
            path: 'root',
            message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
        })
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

function validateDefaults(defaults: any, errors: ValidationError[]) {
    const validVariants = ['button', 'dropzone', 'preview', 'image-only', 'multi-file']
    const validSizes = ['sm', 'md', 'lg']
    const validRadii = ['none', 'sm', 'md', 'lg', 'full']
    const validThemes = ['light', 'dark', 'auto']

    if (defaults.variant && !validVariants.includes(defaults.variant)) {
        errors.push({
            path: 'defaults.variant',
            message: `Invalid variant. Must be one of: ${validVariants.join(', ')}`,
            value: defaults.variant
        })
    }

    if (defaults.size && !validSizes.includes(defaults.size)) {
        errors.push({
            path: 'defaults.size',
            message: `Invalid size. Must be one of: ${validSizes.join(', ')}`,
            value: defaults.size
        })
    }

    if (defaults.radius && !validRadii.includes(defaults.radius)) {
        errors.push({
            path: 'defaults.radius',
            message: `Invalid radius. Must be one of: ${validRadii.join(', ')}`,
            value: defaults.radius
        })
    }

    if (defaults.theme && !validThemes.includes(defaults.theme)) {
        errors.push({
            path: 'defaults.theme',
            message: `Invalid theme. Must be one of: ${validThemes.join(', ')}`,
            value: defaults.theme
        })
    }

    if (typeof defaults.maxSize === 'number' && defaults.maxSize < 0) {
        errors.push({
            path: 'defaults.maxSize',
            message: 'maxSize must be a non-negative number',
            value: defaults.maxSize
        })
    }

    if (typeof defaults.maxFiles === 'number' && defaults.maxFiles < 1) {
        errors.push({
            path: 'defaults.maxFiles',
            message: 'maxFiles must be at least 1',
            value: defaults.maxFiles
        })
    }
}

function validateValidationRules(validation: any, errors: ValidationError[]) {
    if (typeof validation.maxSize === 'number' && validation.maxSize < 0) {
        errors.push({
            path: 'validation.maxSize',
            message: 'maxSize must be a non-negative number',
            value: validation.maxSize
        })
    }

    if (typeof validation.maxFiles === 'number' && validation.maxFiles < 1) {
        errors.push({
            path: 'validation.maxFiles',
            message: 'maxFiles must be at least 1',
            value: validation.maxFiles
        })
    }

    if (validation.minSize !== undefined && typeof validation.minSize === 'number' && validation.minSize < 0) {
        errors.push({
            path: 'validation.minSize',
            message: 'minSize must be a non-negative number',
            value: validation.minSize
        })
    }

    if (validation.maxWidth !== undefined && typeof validation.maxWidth === 'number' && validation.maxWidth < 1) {
        errors.push({
            path: 'validation.maxWidth',
            message: 'maxWidth must be at least 1',
            value: validation.maxWidth
        })
    }

    if (validation.maxHeight !== undefined && typeof validation.maxHeight === 'number' && validation.maxHeight < 1) {
        errors.push({
            path: 'validation.maxHeight',
            message: 'maxHeight must be at least 1',
            value: validation.maxHeight
        })
    }
}

function validateStyling(styling: any, errors: ValidationError[]) {
    const validThemes = ['light', 'dark', 'auto']
    const validBorderStyles = ['solid', 'dashed', 'dotted', 'none']
    const hexColorPattern = /^#[0-9a-fA-F]{6}$/

    if (styling.theme && !validThemes.includes(styling.theme)) {
        errors.push({
            path: 'styling.theme',
            message: `Invalid theme. Must be one of: ${validThemes.join(', ')}`,
            value: styling.theme
        })
    }

    if (styling.colors) {
        const colorKeys = ['primary', 'secondary', 'success', 'error', 'warning', 'background', 'foreground', 'border', 'muted']
        for (const key of colorKeys) {
            if (styling.colors[key] && !hexColorPattern.test(styling.colors[key])) {
                errors.push({
                    path: `styling.colors.${key}`,
                    message: 'Color must be a valid hex color (e.g., #ffffff)',
                    value: styling.colors[key]
                })
            }
        }
    }

    if (styling.borders?.style && !validBorderStyles.includes(styling.borders.style)) {
        errors.push({
            path: 'styling.borders.style',
            message: `Invalid border style. Must be one of: ${validBorderStyles.join(', ')}`,
            value: styling.borders.style
        })
    }
}

function validateLabels(labels: any, errors: ValidationError[]) {
    const requiredLabels = [
        'uploadText', 'dragText', 'dropText', 'browseText', 'errorText',
        'successText', 'progressText', 'removeText', 'retryText', 'cancelText',
        'selectFilesText', 'maxSizeText', 'invalidTypeText', 'tooManyFilesText'
    ]

    for (const label of requiredLabels) {
        if (!(label in labels)) {
            errors.push({
                path: `labels.${label}`,
                message: `Required label '${label}' is missing`
            })
        } else if (typeof labels[label] !== 'string') {
            errors.push({
                path: `labels.${label}`,
                message: `Label '${label}' must be a string`,
                value: labels[label]
            })
        }
    }
}

function validateFeatures(features: any, errors: ValidationError[]) {
    const requiredFeatures = [
        'dragAndDrop', 'preview', 'progress', 'multipleFiles', 'removeFiles',
        'retryFailed', 'showFileSize', 'showFileType', 'autoUpload',
        'chunkedUpload', 'resumableUpload'
    ]

    for (const feature of requiredFeatures) {
        if (!(feature in features)) {
            errors.push({
                path: `features.${feature}`,
                message: `Required feature '${feature}' is missing`
            })
        } else if (typeof features[feature] !== 'boolean') {
            errors.push({
                path: `features.${feature}`,
                message: `Feature '${feature}' must be a boolean`,
                value: features[feature]
            })
        }
    }
}

function validateAnimations(animations: any, errors: ValidationError[]) {
    if (typeof animations.enabled !== 'boolean') {
        errors.push({
            path: 'animations.enabled',
            message: 'animations.enabled must be a boolean',
            value: animations.enabled
        })
    }

    if (typeof animations.duration === 'number') {
        if (animations.duration < 0 || animations.duration > 5000) {
            errors.push({
                path: 'animations.duration',
                message: 'animations.duration must be between 0 and 5000 milliseconds',
                value: animations.duration
            })
        }
    } else if (animations.duration !== undefined) {
        errors.push({
            path: 'animations.duration',
            message: 'animations.duration must be a number',
            value: animations.duration
        })
    }

    if (animations.easing !== undefined && typeof animations.easing !== 'string') {
        errors.push({
            path: 'animations.easing',
            message: 'animations.easing must be a string',
            value: animations.easing
        })
    }
}

function validateAccessibility(accessibility: any, errors: ValidationError[]) {
    const requiredAccessibilityFeatures = [
        'announceFileSelection', 'announceProgress', 'announceErrors',
        'keyboardNavigation', 'focusManagement'
    ]

    for (const feature of requiredAccessibilityFeatures) {
        if (!(feature in accessibility)) {
            errors.push({
                path: `accessibility.${feature}`,
                message: `Required accessibility feature '${feature}' is missing`
            })
        } else if (typeof accessibility[feature] !== 'boolean') {
            errors.push({
                path: `accessibility.${feature}`,
                message: `Accessibility feature '${feature}' must be a boolean`,
                value: accessibility[feature]
            })
        }
    }
}


/**
 * Removes null and undefined values from an object recursively
 */
function cleanNullValues(obj: any): any {
    if (obj === null || obj === undefined) {
        return undefined
    }

    if (Array.isArray(obj)) {
        return obj.filter(item => item !== null && item !== undefined)
    }

    if (typeof obj === 'object') {
        const cleaned: any = {}
        for (const [key, value] of Object.entries(obj)) {
            if (value !== null && value !== undefined) {
                if (typeof value === 'object' && !Array.isArray(value)) {
                    const cleanedValue = cleanNullValues(value)
                    if (cleanedValue !== undefined && Object.keys(cleanedValue).length > 0) {
                        cleaned[key] = cleanedValue
                    }
                } else {
                    cleaned[key] = value
                }
            }
        }
        return cleaned
    }

    return obj
}

export function mergeConfig(userConfig: Partial<FileUploadConfig>): FileUploadConfig {
    // Clean null values from user config before merging
    const cleanedUserConfig = cleanNullValues(userConfig)

    return {
        defaults: { ...defaultConfig.defaults, ...cleanedUserConfig.defaults },
        validation: { ...defaultConfig.validation, ...cleanedUserConfig.validation },
        styling: {
            ...defaultConfig.styling,
            ...cleanedUserConfig.styling,
            colors: { ...defaultConfig.styling.colors, ...cleanedUserConfig.styling?.colors },
            spacing: { ...defaultConfig.styling.spacing, ...cleanedUserConfig.styling?.spacing },
            typography: { ...defaultConfig.styling.typography, ...cleanedUserConfig.styling?.typography },
            borders: { ...defaultConfig.styling.borders, ...cleanedUserConfig.styling?.borders },
            shadows: { ...defaultConfig.styling.shadows, ...cleanedUserConfig.styling?.shadows }
        },
        labels: { ...defaultConfig.labels, ...cleanedUserConfig.labels },
        features: { ...defaultConfig.features, ...cleanedUserConfig.features },
        animations: { ...defaultConfig.animations, ...cleanedUserConfig.animations },
        accessibility: { ...defaultConfig.accessibility, ...cleanedUserConfig.accessibility }
    }
}


export function loadConfigFromJSON(jsonString: string): { config: FileUploadConfig | null; errors: ValidationError[] } {
    try {
        const parsed = JSON.parse(jsonString)

        // For partial configurations, we merge first then validate
        const mergedConfig = mergeConfig(parsed)
        const validation = validateConfig(mergedConfig)

        if (validation.isValid) {
            return { config: mergedConfig, errors: [] }
        } else {
            return { config: null, errors: validation.errors }
        }
    } catch (error) {
        return {
            config: null,
            errors: [{
                path: 'root',
                message: `Invalid JSON: ${error instanceof Error ? error.message : 'Unknown parsing error'}`
            }]
        }
    }
}