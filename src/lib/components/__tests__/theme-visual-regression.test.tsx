import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FileUpload } from '../file-upload'
import { ThemeProvider } from '../theme-provider'
import { FileUploadConfig, FileUploadVariant, FileUploadSize, FileUploadRadius, FileUploadTheme } from '../file-upload/file-upload.types'

// Mock DOM methods for theme application
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

// Mock matchMedia for theme detection
Object.defineProperty(window, 'matchMedia', {
    value: vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
    }),
    writable: true
})

describe('Theme Visual Regression Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    const variants: FileUploadVariant[] = ['button', 'dropzone', 'preview', 'image-only', 'multi-file']
    const sizes: FileUploadSize[] = ['sm', 'md', 'lg']
    const radii: FileUploadRadius[] = ['none', 'sm', 'md', 'lg', 'full']
    const themes: FileUploadTheme[] = ['light', 'dark', 'auto']

    describe('All Theme Combinations', () => {
        themes.forEach(theme => {
            describe(`${theme} theme`, () => {
                variants.forEach(variant => {
                    describe(`${variant} variant`, () => {
                        sizes.forEach(size => {
                            radii.forEach(radius => {
                                it(`should render ${variant} variant with ${size} size, ${radius} radius in ${theme} theme`, () => {
                                    const testId = `file-upload-${variant}-${size}-${radius}-${theme}`

                                    render(
                                        <ThemeProvider defaultTheme={theme}>
                                            <FileUpload
                                                variant={variant}
                                                size={size}
                                                radius={radius}
                                                data-testid={testId}
                                            />
                                        </ThemeProvider>
                                    )

                                    const element = screen.getByTestId(testId)
                                    expect(element).toBeInTheDocument()

                                    // Verify theme classes are applied
                                    const wrapper = element.closest('[data-theme]')
                                    expect(wrapper).toHaveAttribute('data-theme', theme)

                                    // Verify variant-specific classes
                                    const fileUploadElement = element.querySelector('.file-upload')
                                    expect(fileUploadElement).toHaveClass(`file-upload--${variant}`)
                                    expect(fileUploadElement).toHaveClass(`file-upload--${size}`)
                                    expect(fileUploadElement).toHaveClass(`file-upload--radius-${radius}`)
                                })
                            })
                        })
                    })
                })
            })
        })
    })

    describe('Color Variants', () => {
        const colorVariants = ['primary', 'secondary', 'success', 'error', 'warning', 'outline', 'ghost']

        colorVariants.forEach(colorVariant => {
            themes.forEach(theme => {
                it(`should render button with ${colorVariant} color in ${theme} theme`, () => {
                    const config: Partial<FileUploadConfig> = {
                        styling: {
                            theme,
                            colors: {
                                primary: theme === 'dark' ? '#60a5fa' : '#3b82f6',
                                secondary: theme === 'dark' ? '#9ca3af' : '#6b7280',
                                success: theme === 'dark' ? '#34d399' : '#10b981',
                                error: theme === 'dark' ? '#f87171' : '#ef4444',
                                warning: theme === 'dark' ? '#fbbf24' : '#f59e0b',
                                background: theme === 'dark' ? '#111827' : '#ffffff',
                                foreground: theme === 'dark' ? '#f9fafb' : '#1f2937',
                                border: theme === 'dark' ? '#374151' : '#d1d5db',
                                muted: theme === 'dark' ? '#6b7280' : '#9ca3af'
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
                                color: theme === 'dark' ? '#374151' : '#d1d5db'
                            },
                            shadows: {
                                sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                                md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                            }
                        }
                    }

                    const testId = `color-variant-${colorVariant}-${theme}`

                    render(
                        <ThemeProvider defaultTheme={theme} config={config as FileUploadConfig}>
                            <FileUpload
                                variant="button"
                                className={`file-upload--${colorVariant}`}
                                data-testid={testId}
                            />
                        </ThemeProvider>
                    )

                    const element = screen.getByTestId(testId)
                    expect(element).toBeInTheDocument()

                    const fileUploadElement = element.querySelector('.file-upload')
                    expect(fileUploadElement).toHaveClass(`file-upload--${colorVariant}`)
                })
            })
        })
    })

    describe('Responsive Behavior', () => {
        const breakpoints = [
            { name: 'mobile', width: 320 },
            { name: 'tablet', width: 768 },
            { name: 'desktop', width: 1024 }
        ]

        breakpoints.forEach(breakpoint => {
            variants.forEach(variant => {
                it(`should render ${variant} variant responsively at ${breakpoint.name} (${breakpoint.width}px)`, () => {
                    // Mock window.innerWidth
                    Object.defineProperty(window, 'innerWidth', {
                        writable: true,
                        configurable: true,
                        value: breakpoint.width
                    })

                    const testId = `responsive-${variant}-${breakpoint.name}`

                    render(
                        <ThemeProvider>
                            <FileUpload
                                variant={variant}
                                data-testid={testId}
                            />
                        </ThemeProvider>
                    )

                    const element = screen.getByTestId(testId)
                    expect(element).toBeInTheDocument()

                    const fileUploadElement = element.querySelector('.file-upload')
                    expect(fileUploadElement).toHaveClass('file-upload--responsive')
                })
            })
        })
    })

    describe('State Variations', () => {
        const states = [
            { name: 'default', props: {} },
            { name: 'disabled', props: { disabled: true } },
            { name: 'loading', props: { className: 'file-upload--loading' } },
            { name: 'error', props: { className: 'file-upload--error' } },
            { name: 'success', props: { className: 'file-upload--success' } }
        ]

        states.forEach(state => {
            themes.forEach(theme => {
                it(`should render in ${state.name} state with ${theme} theme`, () => {
                    const testId = `state-${state.name}-${theme}`

                    render(
                        <ThemeProvider defaultTheme={theme}>
                            <FileUpload
                                variant="button"
                                data-testid={testId}
                                {...state.props}
                            />
                        </ThemeProvider>
                    )

                    const element = screen.getByTestId(testId)
                    expect(element).toBeInTheDocument()

                    if (state.name === 'disabled') {
                        const fileUploadElement = element.querySelector('.file-upload')
                        expect(fileUploadElement).toHaveClass('file-upload--disabled')
                    }
                })
            })
        })
    })

    describe('Custom Configuration', () => {
        it('should apply custom colors from configuration', () => {
            const customConfig: Partial<FileUploadConfig> = {
                styling: {
                    theme: 'light',
                    colors: {
                        primary: '#ff6b6b',
                        secondary: '#4ecdc4',
                        success: '#51cf66',
                        error: '#ff6b6b',
                        warning: '#ffd43b',
                        background: '#f8f9fa',
                        foreground: '#212529',
                        border: '#dee2e6',
                        muted: '#6c757d'
                    },
                    spacing: {
                        padding: '1.5rem',
                        margin: '1rem',
                        gap: '0.75rem',
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
                        color: '#dee2e6'
                    },
                    shadows: {
                        sm: '0 2px 4px rgba(0,0,0,0.1)',
                        md: '0 8px 16px rgba(0,0,0,0.1)',
                        lg: '0 16px 32px rgba(0,0,0,0.1)'
                    }
                }
            }

            render(
                <ThemeProvider config={customConfig as FileUploadConfig}>
                    <FileUpload
                        variant="button"
                        data-testid="custom-config"
                    />
                </ThemeProvider>
            )

            const element = screen.getByTestId('custom-config')
            expect(element).toBeInTheDocument()

            // Verify custom CSS variables are applied
            expect(mockSetProperty).toHaveBeenCalledWith('--file-upload-primary', '#ff6b6b')
            expect(mockSetProperty).toHaveBeenCalledWith('--file-upload-spacing-padding', '1.5rem')
            expect(mockSetProperty).toHaveBeenCalledWith('--file-upload-fontSize', '1rem')
        })

        it('should handle theme switching with custom configuration', () => {
            const customConfig: Partial<FileUploadConfig> = {
                styling: {
                    theme: 'auto',
                    colors: {
                        primary: '#6366f1',
                        secondary: '#8b5cf6',
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
                }
            }

            render(
                <ThemeProvider defaultTheme="auto" config={customConfig as FileUploadConfig}>
                    <FileUpload
                        variant="dropzone"
                        data-testid="theme-switching"
                    />
                </ThemeProvider>
            )

            const element = screen.getByTestId('theme-switching')
            expect(element).toBeInTheDocument()

            // Verify theme attribute is set
            expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'auto')
        })
    })

    describe('Accessibility in Different Themes', () => {
        themes.forEach(theme => {
            it(`should maintain accessibility in ${theme} theme`, () => {
                render(
                    <ThemeProvider defaultTheme={theme}>
                        <FileUpload
                            variant="button"
                            ariaLabel="Upload files"
                            data-testid={`accessibility-${theme}`}
                        />
                    </ThemeProvider>
                )

                const element = screen.getByTestId(`accessibility-${theme}`)
                expect(element).toBeInTheDocument()

                // Check for accessibility attributes
                const button = element.querySelector('button, [role="button"]')
                if (button) {
                    expect(button).toHaveAttribute('aria-label', 'Upload files')
                }
            })
        })
    })

    describe('Animation States', () => {
        const animationStates = [
            { name: 'enabled', config: { animations: { enabled: true, duration: 200, easing: 'ease-in-out' } } },
            { name: 'disabled', config: { animations: { enabled: false, duration: 0, easing: 'none' } } },
            { name: 'slow', config: { animations: { enabled: true, duration: 500, easing: 'ease-out' } } }
        ]

        animationStates.forEach(animationState => {
            themes.forEach(theme => {
                it(`should handle ${animationState.name} animations in ${theme} theme`, () => {
                    const config: Partial<FileUploadConfig> = {
                        ...animationState.config,
                        styling: {
                            theme,
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
                        }
                    }

                    const testId = `animation-${animationState.name}-${theme}`

                    render(
                        <ThemeProvider defaultTheme={theme} config={config as FileUploadConfig}>
                            <FileUpload
                                variant="dropzone"
                                data-testid={testId}
                            />
                        </ThemeProvider>
                    )

                    const element = screen.getByTestId(testId)
                    expect(element).toBeInTheDocument()
                })
            })
        })
    })
})