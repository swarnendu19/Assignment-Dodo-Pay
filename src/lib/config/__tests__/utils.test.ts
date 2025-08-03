import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
    deepMerge,
    mergeConfigurations,
    loadConfiguration,
    loadConfigFromFile,
    loadConfigurationSync,
    loadConfigurationWithCache,
    validateConfigurationWithDetails,
    mergeConfigurationsWithConflictResolution,
    exportConfiguration,
    ConfigurationBuilder,
    createConfigurationBuilder,
    ConfigurationMigrator,
    defaultMigrator,
    configCache
} from '../utils'
import { defaultConfig } from '../schema'
import { FileUploadConfig, DeepPartial } from '../../components/file-upload/file-upload.types'

// Mock fetch for browser environment tests
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('Configuration Utils', () => {
    beforeEach(() => {
        configCache.clear()
        mockFetch.mockClear()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('deepMerge', () => {
        it('should merge simple objects', () => {
            const target = { a: 1, b: 2 }
            const source = { b: 3, c: 4 }

            const result = deepMerge(target, source)
            expect(result).toEqual({ a: 1, b: 3, c: 4 })
        })

        it('should merge nested objects', () => {
            const target = {
                level1: {
                    a: 1,
                    level2: {
                        b: 2,
                        c: 3
                    }
                }
            }
            const source = {
                level1: {
                    level2: {
                        c: 4,
                        d: 5
                    },
                    e: 6
                }
            }

            const result = deepMerge(target, source)
            expect(result).toEqual({
                level1: {
                    a: 1,
                    e: 6,
                    level2: {
                        b: 2,
                        c: 4,
                        d: 5
                    }
                }
            })
        })

        it('should handle arrays correctly', () => {
            const target = { arr: [1, 2, 3] }
            const source = { arr: [4, 5] }

            const result = deepMerge(target, source)
            expect(result.arr).toEqual([4, 5])
        })

        it('should handle null and undefined values', () => {
            const target = { a: 1, b: null, c: undefined }
            const source = { a: undefined, b: 2, d: null }

            const result = deepMerge(target, source)
            // null and undefined values in source should be ignored, keeping target values
            expect(result).toEqual({ a: 1, b: 2, c: undefined })
        })
    })

    describe('mergeConfigurations', () => {
        it('should merge file and props configurations', () => {
            const fileConfig: DeepPartial<FileUploadConfig> = {
                defaults: {
                    variant: 'dropzone',
                    size: 'lg'
                },
                styling: {
                    colors: {
                        primary: '#ff0000'
                    }
                }
            }

            const propsConfig: DeepPartial<FileUploadConfig> = {
                defaults: {
                    size: 'sm' // Should override file config
                },
                styling: {
                    colors: {
                        secondary: '#00ff00'
                    }
                }
            }

            const result = mergeConfigurations(fileConfig, propsConfig)

            expect(result.config.defaults.variant).toBe('dropzone') // From file
            expect(result.config.defaults.size).toBe('sm') // From props (higher priority)
            expect(result.config.styling.colors.primary).toBe('#ff0000') // From file
            expect(result.config.styling.colors.secondary).toBe('#00ff00') // From props
            expect(result.warnings).toHaveLength(0)
        })

        it('should handle invalid configurations with warnings', () => {
            const invalidFileConfig = {
                defaults: {
                    variant: 'invalid-variant'
                }
            }

            const result = mergeConfigurations(invalidFileConfig as any)
            expect(result.warnings.length).toBeGreaterThan(0)
            expect(result.warnings[0]).toContain('Merged configuration has validation errors')
        })

        it('should work with only file config', () => {
            const fileConfig: DeepPartial<FileUploadConfig> = {
                defaults: {
                    variant: 'dropzone'
                }
            }

            const result = mergeConfigurations(fileConfig)
            expect(result.config.defaults.variant).toBe('dropzone')
            expect(result.warnings).toHaveLength(0)
        })

        it('should work with only props config', () => {
            const propsConfig: DeepPartial<FileUploadConfig> = {
                defaults: {
                    variant: 'preview'
                }
            }

            const result = mergeConfigurations(undefined, propsConfig)
            expect(result.config.defaults.variant).toBe('preview')
            expect(result.warnings).toHaveLength(0)
        })
    })

    describe('loadConfiguration', () => {
        it('should return default config when no source provided', async () => {
            const result = await loadConfiguration()
            expect(result.config).toEqual(defaultConfig)
            expect(result.errors).toHaveLength(0)
        })

        it('should load from JSON string', async () => {
            const jsonString = JSON.stringify({
                defaults: {
                    variant: 'dropzone'
                }
            })

            const result = await loadConfiguration(jsonString)
            expect(result.config.defaults.variant).toBe('dropzone')
            expect(result.errors).toHaveLength(0)
        })

        it('should load from object configuration', async () => {
            const objectConfig: DeepPartial<FileUploadConfig> = {
                defaults: {
                    variant: 'preview',
                    size: 'lg'
                }
            }

            const result = await loadConfiguration(objectConfig)
            expect(result.config.defaults.variant).toBe('preview')
            expect(result.config.defaults.size).toBe('lg')
            expect(result.errors).toHaveLength(0)
        })

        it('should handle invalid object configuration', async () => {
            const invalidConfig = {
                defaults: {
                    variant: 'invalid-variant'
                }
            }

            const result = await loadConfiguration(invalidConfig as any)
            expect(result.config).toEqual(defaultConfig)
            expect(result.errors.length).toBeGreaterThan(0)
        })
    })

    describe('loadConfigFromFile', () => {
        it('should load configuration from URL in browser environment', async () => {
            const mockConfig = {
                defaults: {
                    variant: 'dropzone'
                }
            }

            mockFetch.mockResolvedValueOnce({
                ok: true,
                text: () => Promise.resolve(JSON.stringify(mockConfig))
            })

            // Mock window to simulate browser environment
            Object.defineProperty(global, 'window', {
                value: {},
                writable: true
            })

            const result = await loadConfigFromFile('/config.json')
            expect(result.config.defaults.variant).toBe('dropzone')
            expect(result.errors).toHaveLength(0)
            expect(mockFetch).toHaveBeenCalledWith('/config.json')

            // Clean up
            Object.defineProperty(global, 'window', {
                value: undefined,
                writable: true
            })
        })

        it('should handle fetch errors in browser environment', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: 'Not Found'
            })

            Object.defineProperty(global, 'window', {
                value: {},
                writable: true
            })

            const result = await loadConfigFromFile('/nonexistent.json')
            expect(result.config).toEqual(defaultConfig)
            expect(result.errors).toHaveLength(1)
            expect(result.errors[0].message).toContain('404 Not Found')

            Object.defineProperty(global, 'window', {
                value: undefined,
                writable: true
            })
        })

        it('should handle network errors', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'))

            Object.defineProperty(global, 'window', {
                value: {},
                writable: true
            })

            const result = await loadConfigFromFile('/config.json')
            expect(result.config).toEqual(defaultConfig)
            expect(result.errors).toHaveLength(1)
            expect(result.errors[0].message).toContain('Network error')

            Object.defineProperty(global, 'window', {
                value: undefined,
                writable: true
            })
        })
    })

    describe('loadConfigurationSync', () => {
        it('should load from JSON string synchronously', () => {
            const jsonString = JSON.stringify({
                defaults: {
                    variant: 'dropzone'
                }
            })

            const result = loadConfigurationSync(jsonString)
            expect(result.config.defaults.variant).toBe('dropzone')
            expect(result.errors).toHaveLength(0)
        })

        it('should load from object configuration synchronously', () => {
            const objectConfig: DeepPartial<FileUploadConfig> = {
                defaults: {
                    variant: 'preview'
                }
            }

            const result = loadConfigurationSync(objectConfig)
            expect(result.config.defaults.variant).toBe('preview')
            expect(result.errors).toHaveLength(0)
        })

        it('should handle invalid JSON', () => {
            const invalidJson = '{ invalid json }'

            const result = loadConfigurationSync(invalidJson)
            expect(result.config).toBeNull()
            expect(result.errors).toHaveLength(1)
            expect(result.errors[0].message).toContain('Invalid JSON')
        })
    })

    describe('loadConfigurationWithCache', () => {
        it('should cache successful configurations', async () => {
            const jsonString = JSON.stringify({
                defaults: {
                    variant: 'dropzone'
                }
            })

            // First load
            const result1 = await loadConfigurationWithCache(jsonString)
            expect(result1.fromCache).toBe(false)
            expect(result1.config.defaults.variant).toBe('dropzone')

            // Second load should be from cache
            const result2 = await loadConfigurationWithCache(jsonString)
            expect(result2.fromCache).toBe(true)
            expect(result2.config.defaults.variant).toBe('dropzone')
        })

        it('should not cache failed configurations', async () => {
            const invalidJson = '{ invalid json }'

            const result1 = await loadConfigurationWithCache(invalidJson)
            expect(result1.fromCache).toBe(false)
            expect(result1.errors.length).toBeGreaterThan(0)

            const result2 = await loadConfigurationWithCache(invalidJson)
            expect(result2.fromCache).toBe(false)
            expect(result2.errors.length).toBeGreaterThan(0)
        })

        it('should respect cache disable flag', async () => {
            const jsonString = JSON.stringify({
                defaults: {
                    variant: 'dropzone'
                }
            })

            await loadConfigurationWithCache(jsonString, true) // Cache enabled
            const result = await loadConfigurationWithCache(jsonString, false) // Cache disabled
            expect(result.fromCache).toBe(false)
        })
    })

    describe('validateConfigurationWithDetails', () => {
        it('should provide detailed validation results', () => {
            const result = validateConfigurationWithDetails(defaultConfig)
            expect(result.isValid).toBe(true)
            expect(result.errors).toHaveLength(0)
            expect(result.warnings).toHaveLength(0)
            expect(result.summary).toContain('Configuration is valid')
        })

        it('should generate warnings for potentially problematic configurations', () => {
            const config = {
                ...defaultConfig,
                validation: {
                    ...defaultConfig.validation,
                    maxSize: 200 * 1024 * 1024, // 200MB
                    maxFiles: 100
                },
                animations: {
                    ...defaultConfig.animations,
                    duration: 2000
                },
                features: {
                    ...defaultConfig.features,
                    chunkedUpload: true,
                    resumableUpload: false
                }
            }

            const result = validateConfigurationWithDetails(config)
            expect(result.isValid).toBe(true)
            expect(result.warnings.length).toBeGreaterThan(0)
            expect(result.warnings.some(w => w.includes('Large maximum file size'))).toBe(true)
            expect(result.warnings.some(w => w.includes('High maximum file count'))).toBe(true)
            expect(result.warnings.some(w => w.includes('Long animation duration'))).toBe(true)
            expect(result.warnings.some(w => w.includes('Chunked upload without resumable'))).toBe(true)
        })

        it('should handle invalid configurations', () => {
            const invalidConfig = {
                defaults: {
                    variant: 'invalid-variant'
                }
            }

            const result = validateConfigurationWithDetails(invalidConfig)
            expect(result.isValid).toBe(false)
            expect(result.errors.length).toBeGreaterThan(0)
            expect(result.summary).toContain('Configuration has')
            expect(result.summary).toContain('error(s)')
        })
    })

    describe('mergeConfigurationsWithConflictResolution', () => {
        it('should merge configurations by priority', () => {
            const configs = [
                {
                    config: { defaults: { variant: 'button' as const } },
                    priority: 1,
                    source: 'default'
                },
                {
                    config: { defaults: { variant: 'dropzone' as const } },
                    priority: 2,
                    source: 'file'
                },
                {
                    config: { defaults: { variant: 'preview' as const } },
                    priority: 3,
                    source: 'props'
                }
            ]

            const result = mergeConfigurationsWithConflictResolution(configs)
            expect(result.config.defaults.variant).toBe('preview') // Highest priority
            expect(result.conflicts.length).toBeGreaterThan(0)
            expect(result.conflicts[0].path).toBe('defaults.variant')
        })

        it('should track conflicts correctly', () => {
            const configs = [
                {
                    config: {
                        defaults: { variant: 'button' as const, size: 'md' as const },
                        styling: { colors: { primary: '#ff0000' } }
                    },
                    priority: 1,
                    source: 'config1'
                },
                {
                    config: {
                        defaults: { variant: 'dropzone' as const, size: 'lg' as const },
                        styling: { colors: { primary: '#00ff00' } }
                    },
                    priority: 2,
                    source: 'config2'
                }
            ]

            const result = mergeConfigurationsWithConflictResolution(configs)
            expect(result.conflicts).toHaveLength(3) // variant, size, primary color

            const variantConflict = result.conflicts.find(c => c.path === 'defaults.variant')
            expect(variantConflict).toBeTruthy()
            expect(variantConflict?.values.length).toBeGreaterThanOrEqual(2) // May include default config conflict
        })
    })

    describe('exportConfiguration', () => {
        it('should export as JSON', () => {
            const exported = exportConfiguration(defaultConfig, 'json')
            const parsed = JSON.parse(exported)
            expect(parsed).toEqual(defaultConfig)
        })

        it('should export as TypeScript', () => {
            const exported = exportConfiguration(defaultConfig, 'typescript')
            expect(exported).toContain('import { FileUploadConfig }')
            expect(exported).toContain('export const fileUploadConfig: FileUploadConfig')
            expect(exported).toContain('as const')
        })

        it('should export as YAML', () => {
            const exported = exportConfiguration(defaultConfig, 'yaml')
            expect(exported).toContain('defaults:')
            expect(exported).toContain('validation:')
            expect(exported).toContain('styling:')
        })

        it('should export as environment variables', () => {
            // Create a completely fresh config to avoid test isolation issues
            const testConfig: FileUploadConfig = {
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

            const exported = exportConfiguration(testConfig, 'env')
            expect(exported).toContain('FILE_UPLOAD_DEFAULTS_VARIANT=button')
            expect(exported).toContain('FILE_UPLOAD_VALIDATION_MAXSIZE=')
            expect(exported).toContain('FILE_UPLOAD_STYLING_THEME=auto')
        })
    })

    describe('ConfigurationBuilder', () => {
        it('should build configuration fluently', () => {
            const config = createConfigurationBuilder()
                .variant('dropzone')
                .size('lg')
                .theme('dark')
                .maxSize(50 * 1024 * 1024)
                .maxFiles(10)
                .allowedTypes(['image/*', 'application/pdf'])
                .colors({ primary: '#ff0000', secondary: '#00ff00' })
                .features({ dragAndDrop: true, preview: true })
                .labels({ uploadText: 'Custom upload text' })
                .build()

            expect(config.defaults.variant).toBe('dropzone')
            expect(config.defaults.size).toBe('lg')
            expect(config.defaults.theme).toBe('dark')
            expect(config.validation.maxSize).toBe(50 * 1024 * 1024)
            expect(config.validation.maxFiles).toBe(10)
            expect(config.validation.allowedTypes).toEqual(['image/*', 'application/pdf'])
            expect(config.styling.colors.primary).toBe('#ff0000')
            expect(config.styling.colors.secondary).toBe('#00ff00')
            expect(config.features.dragAndDrop).toBe(true)
            expect(config.features.preview).toBe(true)
            expect(config.labels.uploadText).toBe('Custom upload text')
        })

        it('should validate during build', () => {
            const builder = createConfigurationBuilder()
                .variant('dropzone')
                .maxSize(-1) // Invalid

            const validation = builder.validate()
            expect(validation.isValid).toBe(false)
            expect(validation.errors.length).toBeGreaterThan(0)
        })

        it('should build partial configuration', () => {
            const partial = createConfigurationBuilder()
                .variant('dropzone')
                .size('lg')
                .buildPartial()

            expect(partial.defaults?.variant).toBe('dropzone')
            expect(partial.defaults?.size).toBe('lg')
            expect(partial.validation).toBeUndefined()
        })
    })

    describe('ConfigurationMigrator', () => {
        it('should apply migrations in order', () => {
            const migrator = new ConfigurationMigrator()
                .addMigration({
                    version: '1.1.0',
                    description: 'Add feature A',
                    migrate: (config) => ({ ...config, featureA: true })
                })
                .addMigration({
                    version: '1.2.0',
                    description: 'Add feature B',
                    migrate: (config) => ({ ...config, featureB: true })
                })

            const initialConfig = { version: '1.0.0' }
            const result = migrator.migrate(initialConfig, '1.0.0', '1.2.0')

            expect(result.config.featureA).toBe(true)
            expect(result.config.featureB).toBe(true)
            expect(result.appliedMigrations).toEqual(['1.1.0', '1.2.0'])
        })

        it('should skip migrations outside version range', () => {
            const migrator = new ConfigurationMigrator()
                .addMigration({
                    version: '1.1.0',
                    description: 'Add feature A',
                    migrate: (config) => ({ ...config, featureA: true })
                })
                .addMigration({
                    version: '1.3.0',
                    description: 'Add feature C',
                    migrate: (config) => ({ ...config, featureC: true })
                })

            const initialConfig = { version: '1.0.0' }
            const result = migrator.migrate(initialConfig, '1.0.0', '1.2.0')

            expect(result.config.featureA).toBe(true)
            expect(result.config.featureC).toBeUndefined()
            expect(result.appliedMigrations).toEqual(['1.1.0'])
        })

        it('should provide available migrations', () => {
            const migrator = new ConfigurationMigrator()
                .addMigration({
                    version: '1.1.0',
                    description: 'Add feature A',
                    migrate: (config) => config
                })

            const migrations = migrator.getAvailableMigrations()
            expect(migrations).toHaveLength(1)
            expect(migrations[0].version).toBe('1.1.0')
            expect(migrations[0].description).toBe('Add feature A')
        })
    })

    describe('defaultMigrator', () => {
        it('should have predefined migrations', () => {
            const migrations = defaultMigrator.getAvailableMigrations()
            expect(migrations.length).toBeGreaterThan(0)

            const accessibilityMigration = migrations.find(m => m.version === '1.1.0')
            expect(accessibilityMigration).toBeTruthy()
            expect(accessibilityMigration?.description).toContain('accessibility')

            const animationMigration = migrations.find(m => m.version === '1.2.0')
            expect(animationMigration).toBeTruthy()
            expect(animationMigration?.description).toContain('animation')
        })

        it('should apply accessibility migration', () => {
            const oldConfig = {
                defaults: { variant: 'button' },
                // Missing accessibility config
            }

            const result = defaultMigrator.migrate(oldConfig, '1.0.0', '1.1.0')
            expect(result.config.accessibility).toBeTruthy()
            expect(result.config.accessibility.announceFileSelection).toBe(true)
            expect(result.appliedMigrations).toContain('1.1.0')
        })

        it('should apply animation migration', () => {
            const oldConfig = {
                defaults: { variant: 'button' },
                // Missing animations config
            }

            const result = defaultMigrator.migrate(oldConfig, '1.0.0', '1.2.0')
            expect(result.config.animations).toBeTruthy()
            expect(result.config.animations.enabled).toBe(true)
            expect(result.config.animations.duration).toBe(200)
            expect(result.appliedMigrations).toContain('1.2.0')
        })
    })
})