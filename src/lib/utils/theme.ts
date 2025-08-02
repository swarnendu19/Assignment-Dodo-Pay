import { FileUploadConfig, FileUploadSize, FileUploadRadius, FileUploadTheme } from '../components/file-upload/file-upload.types'

/**
 * Generates CSS class names based on component props and configuration
 */
export function generateThemeClasses(
    variant: string,
    size: FileUploadSize,
    radius: FileUploadRadius,
    config?: FileUploadConfig,
    additionalClasses?: string[]
): string {
    const classes: string[] = ['file-upload']

    // Add variant class
    classes.push(`file-upload--${variant}`)

    // Add size class
    classes.push(`file-upload--${size}`)

    // Add radius class
    classes.push(`file-upload--radius-${radius}`)

    // Add responsive class by default
    classes.push('file-upload--responsive')

    // Add additional classes from config or props
    if (additionalClasses) {
        classes.push(...additionalClasses)
    }

    return classes.join(' ')
}

/**
 * Applies theme to document root
 */
export function applyTheme(theme: FileUploadTheme, config?: FileUploadConfig): void {
    const root = document.documentElement

    // Set theme attribute
    root.setAttribute('data-theme', theme)

    // Apply custom CSS variables if config is provided
    if (config?.styling) {
        const { colors, spacing, typography, borders, shadows } = config.styling

        // Apply color variables
        if (colors) {
            Object.entries(colors).forEach(([key, value]) => {
                root.style.setProperty(`--file-upload-${key}`, value)
            })
        }

        // Apply spacing variables
        if (spacing) {
            Object.entries(spacing).forEach(([key, value]) => {
                root.style.setProperty(`--file-upload-spacing-${key}`, value)
            })
        }

        // Apply typography variables
        if (typography) {
            Object.entries(typography).forEach(([key, value]) => {
                root.style.setProperty(`--file-upload-${key}`, value)
            })
        }

        // Apply border variables
        if (borders) {
            Object.entries(borders).forEach(([key, value]) => {
                root.style.setProperty(`--file-upload-border-${key}`, value)
            })
        }

        // Apply shadow variables
        if (shadows) {
            Object.entries(shadows).forEach(([key, value]) => {
                root.style.setProperty(`--file-upload-shadow-${key}`, value)
            })
        }
    }
}

/**
 * Gets the current system theme preference
 */
export function getSystemTheme(): 'light' | 'dark' {
    if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
}

/**
 * Resolves the actual theme based on the theme setting
 */
export function resolveTheme(theme: FileUploadTheme): 'light' | 'dark' {
    if (theme === 'auto') {
        return getSystemTheme()
    }
    return theme
}

/**
 * Creates a theme watcher that responds to system theme changes
 */
export function createThemeWatcher(
    callback: (theme: 'light' | 'dark') => void
): () => void {
    if (typeof window === 'undefined' || !window.matchMedia) {
        return () => { }
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handler = (e: MediaQueryListEvent) => {
        callback(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handler)

    return () => {
        mediaQuery.removeEventListener('change', handler)
    }
}

/**
 * Generates CSS variables object for inline styles
 */
export function generateCSSVariables(config: FileUploadConfig): Record<string, string> {
    const variables: Record<string, string> = {}

    if (config.styling) {
        const { colors, spacing, typography, borders, shadows } = config.styling

        // Add color variables
        if (colors) {
            Object.entries(colors).forEach(([key, value]) => {
                variables[`--file-upload-${key}`] = value
            })
        }

        // Add spacing variables
        if (spacing) {
            Object.entries(spacing).forEach(([key, value]) => {
                variables[`--file-upload-spacing-${key}`] = value
            })
        }

        // Add typography variables
        if (typography) {
            Object.entries(typography).forEach(([key, value]) => {
                variables[`--file-upload-${key}`] = value
            })
        }

        // Add border variables
        if (borders) {
            Object.entries(borders).forEach(([key, value]) => {
                variables[`--file-upload-border-${key}`] = value
            })
        }

        // Add shadow variables
        if (shadows) {
            Object.entries(shadows).forEach(([key, value]) => {
                variables[`--file-upload-shadow-${key}`] = value
            })
        }
    }

    return variables
}

/**
 * Utility to combine class names conditionally
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ')
}

/**
 * Gets responsive class names based on screen size
 */
export function getResponsiveClasses(
    size: FileUploadSize,
    variant: string
): string[] {
    const classes: string[] = []

    // Add responsive classes based on variant
    switch (variant) {
        case 'dropzone':
            classes.push('file-upload--sm:responsive', 'file-upload--md:responsive')
            break
        case 'multi-file':
            classes.push('file-upload--sm:stack', 'file-upload--md:stack')
            break
        default:
            classes.push('file-upload--responsive')
    }

    return classes
}

/**
 * Validates theme configuration
 */
export function validateThemeConfig(config: Partial<FileUploadConfig>): {
    isValid: boolean
    errors: string[]
} {
    const errors: string[] = []

    if (config.styling?.colors) {
        const hexPattern = /^#[0-9a-fA-F]{6}$/
        Object.entries(config.styling.colors).forEach(([key, value]) => {
            if (typeof value === 'string' && !hexPattern.test(value)) {
                errors.push(`Invalid color format for ${key}: ${value}. Expected hex format like #ffffff`)
            }
        })
    }

    if (config.styling?.spacing) {
        Object.entries(config.styling.spacing).forEach(([key, value]) => {
            if (typeof value === 'string' && !value.match(/^\d+(\.\d+)?(px|rem|em|%)$/)) {
                errors.push(`Invalid spacing format for ${key}: ${value}. Expected CSS unit like 1rem, 16px, etc.`)
            }
        })
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}