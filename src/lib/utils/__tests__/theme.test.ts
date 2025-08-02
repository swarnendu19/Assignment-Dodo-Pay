import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
    generateThemeClasses,
    applyTheme,
    getSystemTheme,
    resolveTheme,
    createThemeWatcher,
    generateCSSVariables,
    cn,
    getResponsiveClasses,
    validateThemeConfig
} from '../theme'
import { FileUploadConfig } from '../../components/file-upload/file-upload.types'

// Mock DOM methods
const mockSetProperty = vi.fn()
const mockSetAttribute = vi.fn()

Object.defineProperty(document, 'documentElement', {
    value: {
        style: {
            setProperty: mockSetProperty
        },
        setAttribute: mockSetAttribute
    },
    writable: true
})

// Mock window.matchMedia
const mockMatchMedia = vi.fn()
Object.defineProperty(window, 'matchMedia', {
    value: mockMatchMedia,
    writable: true
})

describe('Theme Utilities', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('generateThemeClasses', () => {
        it('should generate basic theme classes', () => {
            const classes = generateThemeClasses('button', 'md', 'md')
            expect(classes).toBe('file-upload file-upload--button file-upload--md file-upload--radius-md file-upload--responsive')
        })

        it('should include additional classes', () => {
            const classes = generateThemeClasses('dropzone', 'lg', 'sm', undefined, ['custom-class', 'another-class'])
            expect(classes).toContain('custom-class')
            expect(classes).toContain('another-class')
        })

        it('should handle all size variants', () => {
            expect(generateThemeClasses('button', 'sm', 'md')).toContain('file-upload--sm')
            expect(generateThemeClasses('button', 'md', 'md')).toContain('file-upload--md')
            expect(generateThemeClasses('button', 'lg', 'md')).toContain('file-upload--lg')
        })

        it('should handle all radius variants', () => {
            expect(generateThemeClasses('button', 'md', 'none')).toContain('file-upload--radius-none')
            expect(generateThemeClasses('button', 'md', 'sm')).toContain('file-upload--radius-sm')
            expect(generateThemeClasses('button', 'md', 'md')).toContain('file-upload--radius-md')
            expect(generateThemeClasses('button', 'md', 'lg')).toContain('file-upload--radius-lg')
            expect(generateThemeClasses('button', 'md', 'full')).toContain('file-upload--radius-full')
        })
    })

    describe('applyTheme', () => {
        it('should set theme attribute on document root', () => {
            applyTheme('dark')
            expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'dark')
        })

        it('should apply custom CSS variables from config', () => {
            const config: FileUploadConfig = {
                defaults: {
                    variant: 'button',
                    size: 'md',
                    radius: 'md',
                    theme: 'light',
                    multiple: false,
                    disabled: false,
                    accept: '*',
                    maxSize: 1024,
                    maxFiles: 5
                },
                validation: {
                    maxSize: 1024,
                    maxFiles: 5,
                    allowedTypes: ['*'],
                    allowedExtensions: ['*']
                },
                styling: {
                    theme: 'light',
                    colors: {
                        primary: '#ff0000',
                        secondary: '#00ff00',
                        success: '#0000ff',
                        error: '#ffff00',
                        warning: '#ff00ff',
                        background: '#ffffff',
                        foreground: '#000000',
                        border: '#cccccc',
                        muted: '#999999'
                    },
                    spacing: {
                        padding: '2rem',
                        margin: '1rem',
                        gap: '0.5rem',
                        borderRadius: '0.5rem'
                    },
                    typography: {
                        fontSize: '1rem',
                        fontWeight: '500',
                        lineHeight: '1.5rem'
                    },
                    borders: {
                        width: '2px',
                        style: 'solid',
                        color: '#000000'
                    },
                    shadows: {
                        sm: '0 1px 2px rgba(0,0,0,0.1)',
                        md: '0 4px 6px rgba(0,0,0,0.1)',
                        lg: '0 10px 15px rgba(0,0,0,0.1)'
                    }
                },
                labels: {
                    uploadText: 'Upload',
                    dragText: 'Drag',
                    dropText: 'Drop',
                    browseText: 'Browse',
                    errorText: 'Error',
                    successText: 'Success',
                    progressText: 'Progress',
                    removeText: 'Remove',
                    retryText: 'Retry',
                    cancelText: 'Cancel',
                    selectFilesText: 'Select',
                    maxSizeText: 'Too large',
                    invalidTypeText: 'Invalid type',
                    tooManyFilesText: 'Too many'
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

            applyTheme('light', config)

            expect(mockSetProperty).toHaveBeenCalledWith('--file-upload-primary', '#ff0000')
            expect(mockSetProperty).toHaveBeenCalledWith('--file-upload-spacing-padding', '2rem')
            expect(mockSetProperty).toHaveBeenCalledWith('--file-upload-fontSize', '1rem')
        })
    })

    describe('getSystemTheme', () => {
        it('should return light when matchMedia is not available', () => {
            Object.defineProperty(window, 'matchMedia', {
                value: undefined,
                writable: true
            })
            expect(getSystemTheme()).toBe('light')
        })

        it('should return dark when system prefers dark', () => {
            Object.defineProperty(window, 'matchMedia', {
                value: vi.fn().mockReturnValue({ matches: true }),
                writable: true
            })
            expect(getSystemTheme()).toBe('dark')
        })

        it('should return light when system prefers light', () => {
            Object.defineProperty(window, 'matchMedia', {
                value: vi.fn().mockReturnValue({ matches: false }),
                writable: true
            })
            expect(getSystemTheme()).toBe('light')
        })
    })

    describe('resolveTheme', () => {
        it('should return the theme as-is for light and dark', () => {
            expect(resolveTheme('light')).toBe('light')
            expect(resolveTheme('dark')).toBe('dark')
        })

        it('should resolve auto to system theme', () => {
            Object.defineProperty(window, 'matchMedia', {
                value: vi.fn().mockReturnValue({ matches: true }),
                writable: true
            })
            expect(resolveTheme('auto')).toBe('dark')

            Object.defineProperty(window, 'matchMedia', {
                value: vi.fn().mockReturnValue({ matches: false }),
                writable: true
            })
            expect(resolveTheme('auto')).toBe('light')
        })
    })

    describe('createThemeWatcher', () => {
        it('should return empty function when matchMedia is not available', () => {
            Object.defineProperty(window, 'matchMedia', {
                value: undefined,
                writable: true
            })
            const cleanup = createThemeWatcher(() => { })
            expect(typeof cleanup).toBe('function')
        })

        it('should set up event listener and return cleanup function', () => {
            const mockAddEventListener = vi.fn()
            const mockRemoveEventListener = vi.fn()

            Object.defineProperty(window, 'matchMedia', {
                value: vi.fn().mockReturnValue({
                    addEventListener: mockAddEventListener,
                    removeEventListener: mockRemoveEventListener
                }),
                writable: true
            })

            const callback = vi.fn()
            const cleanup = createThemeWatcher(callback)

            expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function))

            cleanup()
            expect(mockRemoveEventListener).toHaveBeenCalledWith('change', expect.any(Function))
        })
    })

    describe('generateCSSVariables', () => {
        it('should generate CSS variables from config', () => {
            const config: Partial<FileUploadConfig> = {
                styling: {
                    theme: 'light',
                    colors: {
                        primary: '#ff0000',
                        secondary: '#00ff00',
                        success: '#0000ff',
                        error: '#ffff00',
                        warning: '#ff00ff',
                        background: '#ffffff',
                        foreground: '#000000',
                        border: '#cccccc',
                        muted: '#999999'
                    },
                    spacing: {
                        padding: '1rem',
                        margin: '0.5rem',
                        gap: '0.25rem',
                        borderRadius: '0.375rem'
                    },
                    typography: {
                        fontSize: '1rem',
                        fontWeight: '400',
                        lineHeight: '1.5rem'
                    },
                    borders: {
                        width: '1px',
                        style: 'solid',
                        color: '#000000'
                    },
                    shadows: {
                        sm: '0 1px 2px rgba(0,0,0,0.1)',
                        md: '0 4px 6px rgba(0,0,0,0.1)',
                        lg: '0 10px 15px rgba(0,0,0,0.1)'
                    }
                }
            }

            const variables = generateCSSVariables(config as FileUploadConfig)

            expect(variables['--file-upload-primary']).toBe('#ff0000')
            expect(variables['--file-upload-spacing-padding']).toBe('1rem')
            expect(variables['--file-upload-fontSize']).toBe('1rem')
            expect(variables['--file-upload-border-width']).toBe('1px')
            expect(variables['--file-upload-shadow-sm']).toBe('0 1px 2px rgba(0,0,0,0.1)')
        })

        it('should return empty object when no styling config', () => {
            const config: Partial<FileUploadConfig> = {}
            const variables = generateCSSVariables(config as FileUploadConfig)
            expect(variables).toEqual({})
        })
    })

    describe('cn', () => {
        it('should combine class names', () => {
            expect(cn('class1', 'class2', 'class3')).toBe('class1 class2 class3')
        })

        it('should filter out falsy values', () => {
            expect(cn('class1', null, undefined, false, 'class2')).toBe('class1 class2')
        })

        it('should handle empty input', () => {
            expect(cn()).toBe('')
        })
    })

    describe('getResponsiveClasses', () => {
        it('should return appropriate classes for dropzone variant', () => {
            const classes = getResponsiveClasses('md', 'dropzone')
            expect(classes).toContain('file-upload--sm:responsive')
            expect(classes).toContain('file-upload--md:responsive')
        })

        it('should return appropriate classes for multi-file variant', () => {
            const classes = getResponsiveClasses('md', 'multi-file')
            expect(classes).toContain('file-upload--sm:stack')
            expect(classes).toContain('file-upload--md:stack')
        })

        it('should return default responsive class for other variants', () => {
            const classes = getResponsiveClasses('md', 'button')
            expect(classes).toContain('file-upload--responsive')
        })
    })

    describe('validateThemeConfig', () => {
        it('should validate valid hex colors', () => {
            const config = {
                styling: {
                    colors: {
                        primary: '#ff0000',
                        secondary: '#00ff00'
                    }
                }
            }
            const result = validateThemeConfig(config)
            expect(result.isValid).toBe(true)
            expect(result.errors).toHaveLength(0)
        })

        it('should reject invalid hex colors', () => {
            const config = {
                styling: {
                    colors: {
                        primary: 'red',
                        secondary: '#gggggg'
                    }
                }
            }
            const result = validateThemeConfig(config)
            expect(result.isValid).toBe(false)
            expect(result.errors).toHaveLength(2)
            expect(result.errors[0]).toContain('Invalid color format for primary')
            expect(result.errors[1]).toContain('Invalid color format for secondary')
        })

        it('should validate valid spacing units', () => {
            const config = {
                styling: {
                    spacing: {
                        padding: '1rem',
                        margin: '16px',
                        gap: '2em',
                        borderRadius: '50%'
                    }
                }
            }
            const result = validateThemeConfig(config)
            expect(result.isValid).toBe(true)
            expect(result.errors).toHaveLength(0)
        })

        it('should reject invalid spacing units', () => {
            const config = {
                styling: {
                    spacing: {
                        padding: 'invalid',
                        margin: '16'
                    }
                }
            }
            const result = validateThemeConfig(config)
            expect(result.isValid).toBe(false)
            expect(result.errors).toHaveLength(2)
            expect(result.errors[0]).toContain('Invalid spacing format for padding')
            expect(result.errors[1]).toContain('Invalid spacing format for margin')
        })
    })
})