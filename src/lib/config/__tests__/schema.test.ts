import { describe, it, expect } from 'vitest'
import {
    defaultConfig,
    validateConfig,
    mergeConfig,
    loadConfigFromJSON,
    ValidationError
} from '../schema'
import { FileUploadConfig } from '../../components/file-upload/file-upload.types'

describe('Configuration Schema', () => {
    describe('defaultConfig', () => {
        it('should have all required properties', () => {
            expect(defaultConfig).toHaveProperty('defaults')
            expect(defaultConfig).toHaveProperty('validation')
            expect(defaultConfig).toHaveProperty('styling')
            expect(defaultConfig).toHaveProperty('labels')
            expect(defaultConfig).toHaveProperty('features')
            expect(defaultConfig).toHaveProperty('animations')
            expect(defaultConfig).toHaveProperty('accessibility')
        })

        it('should have valid default values', () => {
            expect(defaultConfig.defaults.variant).toBe('button')
            expect(defaultConfig.defaults.size).toBe('md')
            expect(defaultConfig.defaults.radius).toBe('md')
            expect(defaultConfig.defaults.theme).toBe('auto')
            expect(defaultConfig.defaults.multiple).toBe(false)
            expect(defaultConfig.defaults.maxSize).toBe(10 * 1024 * 1024)
            expect(defaultConfig.defaults.maxFiles).toBe(5)
        })

        it('should pass its own validation', () => {
            const result = validateConfig(defaultConfig)
            expect(result.isValid).toBe(true)
            expect(result.errors).toHaveLength(0)
        })
    })

    describe('validateConfig', () => {
        it('should validate a valid configuration', () => {
            const result = validateConfig(defaultConfig)
            expect(result.isValid).toBe(true)
            expect(result.errors).toHaveLength(0)
        })

        it('should reject null or undefined config', () => {
            const nullResult = validateConfig(null)
            expect(nullResult.isValid).toBe(false)
            expect(nullResult.errors[0].message).toContain('Configuration must be an object')

            const undefinedResult = validateConfig(undefined)
            expect(undefinedResult.isValid).toBe(false)
            expect(undefinedResult.errors[0].message).toContain('Configuration must be an object')
        })

        it('should reject non-object config', () => {
            const result = validateConfig('invalid')
            expect(result.isValid).toBe(false)
            expect(result.errors[0].message).toContain('Configuration must be an object')
        })

        it('should require all top-level properties', () => {
            const incompleteConfig = {
                defaults: defaultConfig.defaults
                // Missing other required properties
            }

            const result = validateConfig(incompleteConfig)
            expect(result.isValid).toBe(false)

            const missingProps = result.errors.filter(e => e.message.includes('is missing'))
            expect(missingProps.length).toBeGreaterThan(0)
        })

        describe('defaults validation', () => {
            it('should reject invalid variant', () => {
                const config = {
                    ...defaultConfig,
                    defaults: {
                        ...defaultConfig.defaults,
                        variant: 'invalid-variant' as any
                    }
                }

                const result = validateConfig(config)
                expect(result.isValid).toBe(false)
                expect(result.errors.some(e => e.path === 'defaults.variant')).toBe(true)
            })

            it('should reject invalid size', () => {
                const config = {
                    ...defaultConfig,
                    defaults: {
                        ...defaultConfig.defaults,
                        size: 'xl' as any
                    }
                }

                const result = validateConfig(config)
                expect(result.isValid).toBe(false)
                expect(result.errors.some(e => e.path === 'defaults.size')).toBe(true)
            })

            it('should reject negative maxSize', () => {
                const config = {
                    ...defaultConfig,
                    defaults: {
                        ...defaultConfig.defaults,
                        maxSize: -1
                    }
                }

                const result = validateConfig(config)
                expect(result.isValid).toBe(false)
                expect(result.errors.some(e => e.path === 'defaults.maxSize')).toBe(true)
            })

            it('should reject maxFiles less than 1', () => {
                const config = {
                    ...defaultConfig,
                    defaults: {
                        ...defaultConfig.defaults,
                        maxFiles: 0
                    }
                }

                const result = validateConfig(config)
                expect(result.isValid).toBe(false)
                expect(result.errors.some(e => e.path === 'defaults.maxFiles')).toBe(true)
            })
        })

        describe('validation rules validation', () => {
            it('should reject negative maxSize in validation', () => {
                const config = {
                    ...defaultConfig,
                    validation: {
                        ...defaultConfig.validation,
                        maxSize: -1
                    }
                }

                const result = validateConfig(config)
                expect(result.isValid).toBe(false)
                expect(result.errors.some(e => e.path === 'validation.maxSize')).toBe(true)
            })

            it('should reject maxFiles less than 1 in validation', () => {
                const config = {
                    ...defaultConfig,
                    validation: {
                        ...defaultConfig.validation,
                        maxFiles: 0
                    }
                }

                const result = validateConfig(config)
                expect(result.isValid).toBe(false)
                expect(result.errors.some(e => e.path === 'validation.maxFiles')).toBe(true)
            })

            it('should reject negative minSize', () => {
                const config = {
                    ...defaultConfig,
                    validation: {
                        ...defaultConfig.validation,
                        minSize: -1
                    }
                }

                const result = validateConfig(config)
                expect(result.isValid).toBe(false)
                expect(result.errors.some(e => e.path === 'validation.minSize')).toBe(true)
            })

            it('should reject invalid image dimensions', () => {
                const config = {
                    ...defaultConfig,
                    validation: {
                        ...defaultConfig.validation,
                        maxWidth: 0,
                        maxHeight: -1
                    }
                }

                const result = validateConfig(config)
                expect(result.isValid).toBe(false)
                expect(result.errors.some(e => e.path === 'validation.maxWidth')).toBe(true)
                expect(result.errors.some(e => e.path === 'validation.maxHeight')).toBe(true)
            })
        })

        describe('styling validation', () => {
            it('should reject invalid theme', () => {
                const config = {
                    ...defaultConfig,
                    styling: {
                        ...defaultConfig.styling,
                        theme: 'invalid-theme' as any
                    }
                }

                const result = validateConfig(config)
                expect(result.isValid).toBe(false)
                expect(result.errors.some(e => e.path === 'styling.theme')).toBe(true)
            })

            it('should reject invalid hex colors', () => {
                const config = {
                    ...defaultConfig,
                    styling: {
                        ...defaultConfig.styling,
                        colors: {
                            ...defaultConfig.styling.colors,
                            primary: 'invalid-color',
                            secondary: '#gggggg'
                        }
                    }
                }

                const result = validateConfig(config)
                expect(result.isValid).toBe(false)
                expect(result.errors.some(e => e.path === 'styling.colors.primary')).toBe(true)
                expect(result.errors.some(e => e.path === 'styling.colors.secondary')).toBe(true)
            })

            it('should reject invalid border style', () => {
                const config = {
                    ...defaultConfig,
                    styling: {
                        ...defaultConfig.styling,
                        borders: {
                            ...defaultConfig.styling.borders,
                            style: 'invalid-style' as any
                        }
                    }
                }

                const result = validateConfig(config)
                expect(result.isValid).toBe(false)
                expect(result.errors.some(e => e.path === 'styling.borders.style')).toBe(true)
            })
        })

        describe('labels validation', () => {
            it('should require all label properties', () => {
                const config = {
                    ...defaultConfig,
                    labels: {
                        uploadText: 'Upload',
                        // Missing other required labels
                    }
                }

                const result = validateConfig(config)
                expect(result.isValid).toBe(false)

                const missingLabels = result.errors.filter(e =>
                    e.path.startsWith('labels.') && e.message.includes('is missing')
                )
                expect(missingLabels.length).toBeGreaterThan(0)
            })

            it('should reject non-string labels', () => {
                const config = {
                    ...defaultConfig,
                    labels: {
                        ...defaultConfig.labels,
                        uploadText: 123 as any,
                        dragText: true as any
                    }
                }

                const result = validateConfig(config)
                expect(result.isValid).toBe(false)
                expect(result.errors.some(e => e.path === 'labels.uploadText')).toBe(true)
                expect(result.errors.some(e => e.path === 'labels.dragText')).toBe(true)
            })
        })

        describe('features validation', () => {
            it('should require all feature properties', () => {
                const config = {
                    ...defaultConfig,
                    features: {
                        dragAndDrop: true,
                        // Missing other required features
                    }
                }

                const result = validateConfig(config)
                expect(result.isValid).toBe(false)

                const missingFeatures = result.errors.filter(e =>
                    e.path.startsWith('features.') && e.message.includes('is missing')
                )
                expect(missingFeatures.length).toBeGreaterThan(0)
            })

            it('should reject non-boolean features', () => {
                const config = {
                    ...defaultConfig,
                    features: {
                        ...defaultConfig.features,
                        dragAndDrop: 'yes' as any,
                        preview: 1 as any
                    }
                }

                const result = validateConfig(config)
                expect(result.isValid).toBe(false)
                expect(result.errors.some(e => e.path === 'features.dragAndDrop')).toBe(true)
                expect(result.errors.some(e => e.path === 'features.preview')).toBe(true)
            })
        })

        describe('animations validation', () => {
            it('should reject non-boolean enabled', () => {
                const config = {
                    ...defaultConfig,
                    animations: {
                        ...defaultConfig.animations,
                        enabled: 'yes' as any
                    }
                }

                const result = validateConfig(config)
                expect(result.isValid).toBe(false)
                expect(result.errors.some(e => e.path === 'animations.enabled')).toBe(true)
            })

            it('should reject invalid duration', () => {
                const config = {
                    ...defaultConfig,
                    animations: {
                        ...defaultConfig.animations,
                        duration: -1
                    }
                }

                const result = validateConfig(config)
                expect(result.isValid).toBe(false)
                expect(result.errors.some(e => e.path === 'animations.duration')).toBe(true)

                const config2 = {
                    ...defaultConfig,
                    animations: {
                        ...defaultConfig.animations,
                        duration: 6000
                    }
                }

                const result2 = validateConfig(config2)
                expect(result2.isValid).toBe(false)
                expect(result2.errors.some(e => e.path === 'animations.duration')).toBe(true)
            })

            it('should reject non-string easing', () => {
                const config = {
                    ...defaultConfig,
                    animations: {
                        ...defaultConfig.animations,
                        easing: 123 as any
                    }
                }

                const result = validateConfig(config)
                expect(result.isValid).toBe(false)
                expect(result.errors.some(e => e.path === 'animations.easing')).toBe(true)
            })
        })

        describe('accessibility validation', () => {
            it('should require all accessibility properties', () => {
                const config = {
                    ...defaultConfig,
                    accessibility: {
                        announceFileSelection: true,
                        // Missing other required accessibility features
                    }
                }

                const result = validateConfig(config)
                expect(result.isValid).toBe(false)

                const missingFeatures = result.errors.filter(e =>
                    e.path.startsWith('accessibility.') && e.message.includes('is missing')
                )
                expect(missingFeatures.length).toBeGreaterThan(0)
            })

            it('should reject non-boolean accessibility features', () => {
                const config = {
                    ...defaultConfig,
                    accessibility: {
                        ...defaultConfig.accessibility,
                        announceFileSelection: 'yes' as any,
                        keyboardNavigation: 1 as any
                    }
                }

                const result = validateConfig(config)
                expect(result.isValid).toBe(false)
                expect(result.errors.some(e => e.path === 'accessibility.announceFileSelection')).toBe(true)
                expect(result.errors.some(e => e.path === 'accessibility.keyboardNavigation')).toBe(true)
            })
        })
    })

    describe('mergeConfig', () => {
        it('should merge partial config with defaults', () => {
            const partialConfig = {
                defaults: {
                    variant: 'dropzone' as const,
                    size: 'lg' as const
                },
                styling: {
                    colors: {
                        primary: '#ff0000'
                    }
                }
            }

            const merged = mergeConfig(partialConfig)

            expect(merged.defaults.variant).toBe('dropzone')
            expect(merged.defaults.size).toBe('lg')
            expect(merged.defaults.radius).toBe(defaultConfig.defaults.radius) // Should keep default
            expect(merged.styling.colors.primary).toBe('#ff0000')
            expect(merged.styling.colors.secondary).toBe(defaultConfig.styling.colors.secondary) // Should keep default
        })

        it('should handle empty partial config', () => {
            const merged = mergeConfig({})
            expect(merged).toEqual(defaultConfig)
        })

        it('should deeply merge nested objects', () => {
            const partialConfig = {
                styling: {
                    colors: {
                        primary: '#ff0000'
                    },
                    spacing: {
                        padding: '2rem'
                    }
                }
            }

            const merged = mergeConfig(partialConfig)

            expect(merged.styling.colors.primary).toBe('#ff0000')
            expect(merged.styling.colors.secondary).toBe(defaultConfig.styling.colors.secondary)
            expect(merged.styling.spacing.padding).toBe('2rem')
            expect(merged.styling.spacing.margin).toBe(defaultConfig.styling.spacing.margin)
        })
    })

    describe('loadConfigFromJSON', () => {
        it('should load valid JSON configuration', () => {
            const jsonConfig = JSON.stringify({
                defaults: {
                    variant: 'dropzone',
                    size: 'lg'
                }
            })

            const result = loadConfigFromJSON(jsonConfig)
            expect(result.config).toBeTruthy()
            expect(result.errors).toHaveLength(0)
            expect(result.config?.defaults.variant).toBe('dropzone')
            expect(result.config?.defaults.size).toBe('lg')
        })

        it('should handle invalid JSON', () => {
            const invalidJson = '{ invalid json }'

            const result = loadConfigFromJSON(invalidJson)
            expect(result.config).toBeNull()
            expect(result.errors).toHaveLength(1)
            expect(result.errors[0].message).toContain('Invalid JSON')
        })

        it('should handle valid JSON with invalid configuration', () => {
            const jsonConfig = JSON.stringify({
                defaults: {
                    variant: 'invalid-variant',
                    size: 'invalid-size'
                }
            })

            const result = loadConfigFromJSON(jsonConfig)
            expect(result.config).toBeNull()
            expect(result.errors.length).toBeGreaterThan(0)
        })

        it('should merge with defaults for partial configuration', () => {
            const jsonConfig = JSON.stringify({
                defaults: {
                    variant: 'dropzone'
                },
                styling: {
                    colors: {
                        primary: '#ff0000'
                    }
                }
            })

            const result = loadConfigFromJSON(jsonConfig)
            expect(result.config).toBeTruthy()
            expect(result.errors).toHaveLength(0)
            expect(result.config?.defaults.variant).toBe('dropzone')
            expect(result.config?.defaults.size).toBe(defaultConfig.defaults.size) // Should use default
            expect(result.config?.styling.colors.primary).toBe('#ff0000')
            expect(result.config?.styling.colors.secondary).toBe(defaultConfig.styling.colors.secondary) // Should use default
        })
    })

    describe('error handling', () => {
        it('should handle validation errors gracefully', () => {
            const invalidConfig = {
                defaults: {
                    variant: 'invalid',
                    maxSize: -1
                },
                validation: {
                    maxFiles: 0
                }
            }

            const result = validateConfig(invalidConfig)
            expect(result.isValid).toBe(false)
            expect(result.errors.length).toBeGreaterThan(0)

            // Check that errors have proper structure
            result.errors.forEach(error => {
                expect(error).toHaveProperty('path')
                expect(error).toHaveProperty('message')
                expect(typeof error.path).toBe('string')
                expect(typeof error.message).toBe('string')
            })
        })

        it('should handle exceptions during validation', () => {
            // Create a config that might cause an exception
            const problematicConfig = {
                get defaults() {
                    throw new Error('Test error')
                }
            }

            const result = validateConfig(problematicConfig)
            expect(result.isValid).toBe(false)
            expect(result.errors.some(e => e.message.includes('Validation error'))).toBe(true)
        })
    })
})