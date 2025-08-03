import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
    loadConfiguration,
    loadConfigurationWithCache,
    mergeConfigurations,
    validateConfigurationWithDetails,
    createConfigurationBuilder,
    exportConfiguration,
    configCache
} from '../utils'
import { defaultConfig, validateConfig } from '../schema'
import { FileUploadConfig, DeepPartial } from '../../components/file-upload/file-upload.types'

describe('Configuration System Integration', () => {
    beforeEach(() => {
        configCache.clear()
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('Complete Configuration Flow', () => {
        it('should handle complete configuration lifecycle', async () => {
            // 1. Start with a partial configuration
            const partialConfig: DeepPartial<FileUploadConfig> = {
                defaults: {
                    variant: 'dropzone',
                    size: 'lg',
                    multiple: true
                },
                validation: {
                    maxSize: 50 * 1024 * 1024,
                    allowedTypes: ['image/*', 'application/pdf']
                },
                styling: {
                    colors: {
                        primary: '#3b82f6',
                        success: '#10b981'
                    }
                },
                features: {
                    dragAndDrop: true,
                    preview: true,
                    progress: true
                }
            }

            // 2. Load and validate the configuration
            const loadResult = await loadConfiguration(partialConfig)
            expect(loadResult.errors).toHaveLength(0)
            expect(loadResult.config.defaults.variant).toBe('dropzone')
            expect(loadResult.config.defaults.size).toBe('lg')

            // 3. Validate with detailed analysis
            const detailedValidation = validateConfigurationWithDetails(loadResult.config)
            expect(detailedValidation.isValid).toBe(true)
            expect(detailedValidation.summary).toContain('Configuration is valid')

            // 4. Export the configuration
            const exported = exportConfiguration(loadResult.config, 'json')
            const reimported = JSON.parse(exported)

            // 5. Verify the round-trip
            const revalidation = validateConfig(reimported)
            expect(revalidation.isValid).toBe(true)
        })

        it('should handle configuration merging with multiple sources', () => {
            // Simulate different configuration sources
            const defaultsFromFile: DeepPartial<FileUploadConfig> = {
                defaults: {
                    variant: 'dropzone',
                    size: 'md',
                    theme: 'light'
                },
                validation: {
                    maxSize: 10 * 1024 * 1024,
                    allowedTypes: ['*']
                },
                styling: {
                    colors: {
                        primary: '#3b82f6',
                        secondary: '#6b7280'
                    }
                }
            }

            const userPreferences: DeepPartial<FileUploadConfig> = {
                defaults: {
                    size: 'lg', // Override file config
                    theme: 'dark' // Override file config
                },
                styling: {
                    colors: {
                        primary: '#ef4444' // Override file config
                        // Keep secondary from file config
                    }
                },
                features: {
                    preview: true,
                    progress: true
                }
            }

            const result = mergeConfigurations(defaultsFromFile, userPreferences)

            // Verify proper merging priority (props > file > defaults)
            expect(result.config.defaults.variant).toBe('dropzone') // From file
            expect(result.config.defaults.size).toBe('lg') // From props (overrides file)
            expect(result.config.defaults.theme).toBe('dark') // From props (overrides file)
            expect(result.config.styling.colors.primary).toBe('#ef4444') // From props
            expect(result.config.styling.colors.secondary).toBe('#6b7280') // From file
            expect(result.config.features.preview).toBe(true) // From props
            expect(result.config.features.dragAndDrop).toBe(true) // From defaults
            expect(result.warnings).toHaveLength(0)
        })

        it('should handle configuration builder with validation', () => {
            // Build a complex configuration using the fluent API
            const config = createConfigurationBuilder()
                .variant('multi-file')
                .size('lg')
                .theme('dark')
                .maxSize(100 * 1024 * 1024)
                .maxFiles(20)
                .allowedTypes(['image/*', 'video/*', 'application/pdf'])
                .colors({
                    primary: '#3b82f6',
                    secondary: '#6b7280',
                    success: '#10b981',
                    error: '#ef4444'
                })
                .features({
                    dragAndDrop: true,
                    preview: true,
                    progress: true,
                    multipleFiles: true,
                    removeFiles: true,
                    retryFailed: true
                })
                .labels({
                    uploadText: 'Upload your files',
                    dragText: 'Drag files here',
                    successText: 'Upload completed!'
                })
                .build()

            // Validate the built configuration
            const validation = validateConfig(config)
            expect(validation.isValid).toBe(true)
            expect(validation.errors).toHaveLength(0)

            // Verify all properties are set correctly
            expect(config.defaults.variant).toBe('multi-file')
            expect(config.defaults.size).toBe('lg')
            expect(config.defaults.theme).toBe('dark')
            expect(config.validation.maxSize).toBe(100 * 1024 * 1024)
            expect(config.validation.maxFiles).toBe(20)
            expect(config.validation.allowedTypes).toEqual(['image/*', 'video/*', 'application/pdf'])
            expect(config.styling.colors.primary).toBe('#3b82f6')
            expect(config.features.dragAndDrop).toBe(true)
            expect(config.features.multipleFiles).toBe(true)
            expect(config.labels.uploadText).toBe('Upload your files')
        })

        it('should handle caching correctly', async () => {
            const configJson = JSON.stringify({
                defaults: {
                    variant: 'dropzone',
                    size: 'lg'
                },
                styling: {
                    colors: {
                        primary: '#ff0000'
                    }
                }
            })

            // First load - should not be from cache
            const result1 = await loadConfigurationWithCache(configJson)
            expect(result1.fromCache).toBe(false)
            expect(result1.config.defaults.variant).toBe('dropzone')
            expect(result1.config.styling.colors.primary).toBe('#ff0000')
            expect(result1.errors).toHaveLength(0)

            // Second load - should be from cache
            const result2 = await loadConfigurationWithCache(configJson)
            expect(result2.fromCache).toBe(true)
            expect(result2.config.defaults.variant).toBe('dropzone')
            expect(result2.config.styling.colors.primary).toBe('#ff0000')
            expect(result2.errors).toHaveLength(0)

            // Verify configurations are identical
            expect(result1.config).toEqual(result2.config)
        })

        it('should handle error scenarios gracefully', async () => {
            // Test invalid JSON
            const invalidJson = '{ invalid json syntax }'
            const jsonResult = await loadConfiguration(invalidJson)
            expect(jsonResult.config).toBeNull()
            expect(jsonResult.errors).toHaveLength(1)
            expect(jsonResult.errors[0].message).toContain('Invalid JSON')

            // Test invalid configuration object
            const invalidConfig = {
                defaults: {
                    variant: 'invalid-variant',
                    size: 'invalid-size',
                    maxSize: -1
                },
                validation: {
                    maxFiles: 0,
                    allowedTypes: 'not-an-array'
                }
            }

            const objectResult = await loadConfiguration(invalidConfig as any)
            expect(objectResult.config).toEqual(defaultConfig) // Should fallback to default
            expect(objectResult.errors.length).toBeGreaterThan(0)

            // Verify error details
            const variantError = objectResult.errors.find(e => e.path === 'defaults.variant')
            expect(variantError).toBeTruthy()
            expect(variantError?.message).toContain('Invalid variant')

            const sizeError = objectResult.errors.find(e => e.path === 'defaults.size')
            expect(sizeError).toBeTruthy()

            const maxSizeError = objectResult.errors.find(e => e.path === 'defaults.maxSize')
            expect(maxSizeError).toBeTruthy()
        })

        it('should provide comprehensive validation warnings', () => {
            const problematicConfig: FileUploadConfig = {
                ...defaultConfig,
                validation: {
                    ...defaultConfig.validation,
                    maxSize: 500 * 1024 * 1024, // 500MB - very large
                    maxFiles: 100 // Many files
                },
                animations: {
                    ...defaultConfig.animations,
                    duration: 3000 // Very slow animation
                },
                features: {
                    ...defaultConfig.features,
                    chunkedUpload: true,
                    resumableUpload: false // Problematic combination
                }
            }

            const validation = validateConfigurationWithDetails(problematicConfig)
            expect(validation.isValid).toBe(true) // Valid but with warnings
            expect(validation.warnings.length).toBeGreaterThan(0)

            // Check specific warnings
            expect(validation.warnings.some(w => w.includes('Large maximum file size'))).toBe(true)
            expect(validation.warnings.some(w => w.includes('High maximum file count'))).toBe(true)
            expect(validation.warnings.some(w => w.includes('Long animation duration'))).toBe(true)
            expect(validation.warnings.some(w => w.includes('Chunked upload without resumable'))).toBe(true)

            expect(validation.summary).toContain('Configuration is valid')
            expect(validation.summary).toContain('warning(s)')
        })

        it('should export and import configurations correctly', () => {
            const customConfig = createConfigurationBuilder()
                .variant('image-only')
                .size('lg')
                .theme('dark')
                .maxSize(20 * 1024 * 1024)
                .allowedTypes(['image/jpeg', 'image/png', 'image/webp'])
                .colors({
                    primary: '#8b5cf6',
                    secondary: '#a78bfa'
                })
                .features({
                    preview: true,
                    progress: true,
                    dragAndDrop: true
                })
                .build()

            // Export as JSON
            const jsonExport = exportConfiguration(customConfig, 'json')
            const reimportedJson = JSON.parse(jsonExport)
            expect(reimportedJson).toEqual(customConfig)

            // Export as TypeScript
            const tsExport = exportConfiguration(customConfig, 'typescript')
            expect(tsExport).toContain('import { FileUploadConfig }')
            expect(tsExport).toContain('export const fileUploadConfig: FileUploadConfig')
            expect(tsExport).toContain('"variant": "image-only"')

            // Export as YAML
            const yamlExport = exportConfiguration(customConfig, 'yaml')
            expect(yamlExport).toContain('defaults:')
            expect(yamlExport).toContain('variant: "image-only"')
            expect(yamlExport).toContain('validation:')

            // Export as environment variables
            const envExport = exportConfiguration(customConfig, 'env')
            expect(envExport).toContain('FILE_UPLOAD_DEFAULTS_VARIANT=image-only')
            expect(envExport).toContain('FILE_UPLOAD_DEFAULTS_SIZE=lg')
            expect(envExport).toContain('FILE_UPLOAD_DEFAULTS_THEME=dark')
        })
    })

    describe('Real-world Scenarios', () => {
        it('should handle image upload configuration', async () => {
            const imageUploadConfig: DeepPartial<FileUploadConfig> = {
                defaults: {
                    variant: 'image-only',
                    accept: 'image/*',
                    multiple: false
                },
                validation: {
                    maxSize: 10 * 1024 * 1024, // 10MB
                    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
                    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
                    validateDimensions: true,
                    maxWidth: 4096,
                    maxHeight: 4096
                },
                features: {
                    preview: true,
                    dragAndDrop: true,
                    progress: true,
                    removeFiles: true
                },
                labels: {
                    uploadText: 'Choose an image',
                    dragText: 'Drag an image here',
                    invalidTypeText: 'Please select a valid image file'
                }
            }

            const result = await loadConfiguration(imageUploadConfig)
            expect(result.errors).toHaveLength(0)
            expect(result.config.defaults.variant).toBe('image-only')
            expect(result.config.validation.validateDimensions).toBe(true)
            expect(result.config.features.preview).toBe(true)
        })

        it('should handle document upload configuration', async () => {
            const documentUploadConfig: DeepPartial<FileUploadConfig> = {
                defaults: {
                    variant: 'multi-file',
                    multiple: true,
                    maxFiles: 10
                },
                validation: {
                    maxSize: 50 * 1024 * 1024, // 50MB
                    allowedTypes: [
                        'application/pdf',
                        'application/msword',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'text/plain'
                    ],
                    allowedExtensions: ['.pdf', '.doc', '.docx', '.txt']
                },
                features: {
                    dragAndDrop: true,
                    preview: false, // No preview for documents
                    progress: true,
                    multipleFiles: true,
                    showFileSize: true,
                    showFileType: true
                },
                labels: {
                    uploadText: 'Upload documents',
                    dragText: 'Drag documents here',
                    invalidTypeText: 'Only PDF, Word, and text files are allowed'
                }
            }

            const result = await loadConfiguration(documentUploadConfig)
            expect(result.errors).toHaveLength(0)
            expect(result.config.defaults.variant).toBe('multi-file')
            expect(result.config.validation.allowedTypes).toContain('application/pdf')
            expect(result.config.features.preview).toBe(false)
            expect(result.config.features.showFileType).toBe(true)
        })

        it('should handle minimal configuration', async () => {
            const minimalConfig: DeepPartial<FileUploadConfig> = {
                defaults: {
                    variant: 'button'
                },
                features: {
                    dragAndDrop: false,
                    preview: false,
                    progress: false
                }
            }

            const result = await loadConfiguration(minimalConfig)
            expect(result.errors).toHaveLength(0)
            expect(result.config.defaults.variant).toBe('button')
            expect(result.config.features.dragAndDrop).toBe(false)
            expect(result.config.features.preview).toBe(false)

            // Should still have all required properties from defaults
            expect(result.config.labels.uploadText).toBeDefined()
            expect(result.config.styling.colors.primary).toBeDefined()
            expect(result.config.accessibility.keyboardNavigation).toBeDefined()
        })
    })

    describe('Performance and Edge Cases', () => {
        it('should handle large configurations efficiently', () => {
            const largeConfig = createConfigurationBuilder()
                .variant('multi-file')
                .maxFiles(1000) // Large number
                .allowedTypes(Array.from({ length: 100 }, (_, i) => `type/${i}`)) // Many types
                .build()

            const startTime = performance.now()
            const validation = validateConfig(largeConfig)
            const endTime = performance.now()

            expect(validation.isValid).toBe(true)
            expect(endTime - startTime).toBeLessThan(100) // Should be fast
        })

        it('should handle deeply nested configuration merging', () => {
            const deepConfig1: DeepPartial<FileUploadConfig> = {
                styling: {
                    colors: {
                        primary: '#ff0000'
                    },
                    spacing: {
                        padding: '1rem'
                    }
                }
            }

            const deepConfig2: DeepPartial<FileUploadConfig> = {
                styling: {
                    colors: {
                        secondary: '#00ff00'
                    },
                    spacing: {
                        margin: '0.5rem'
                    },
                    typography: {
                        fontSize: '1rem'
                    }
                }
            }

            const result = mergeConfigurations(deepConfig1, deepConfig2)

            expect(result.config.styling.colors.primary).toBe('#ff0000')
            expect(result.config.styling.colors.secondary).toBe('#00ff00')
            expect(result.config.styling.spacing.padding).toBe('1rem')
            expect(result.config.styling.spacing.margin).toBe('0.5rem')
            expect(result.config.styling.typography.fontSize).toBe('1rem')
        })

        it('should handle null and undefined values correctly', async () => {
            const configWithNulls = {
                defaults: {
                    variant: 'button',
                    size: null,
                    theme: undefined
                },
                validation: {
                    maxSize: 10 * 1024 * 1024,
                    maxFiles: null,
                    allowedTypes: undefined
                }
            }

            const result = await loadConfiguration(configWithNulls as any)
            // Should use defaults for null/undefined values
            expect(result.config.defaults.size).toBe(defaultConfig.defaults.size)
            expect(result.config.defaults.theme).toBe(defaultConfig.defaults.theme)
            expect(result.config.validation.maxFiles).toBe(defaultConfig.validation.maxFiles)
            expect(result.config.validation.allowedTypes).toEqual(defaultConfig.validation.allowedTypes)
        })
    })
})