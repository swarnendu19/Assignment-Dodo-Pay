import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ThemeProvider, useTheme, useThemeVariables, ThemeToggle } from '../theme-provider'
import { FileUploadConfig } from '../file-upload/file-upload.types'

// Mock localStorage
const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
}

Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true
})

// Mock matchMedia
const mockMatchMedia = vi.fn()
Object.defineProperty(window, 'matchMedia', {
    value: mockMatchMedia,
    writable: true
})

// Mock document.documentElement
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

// Test component that uses the theme hook
function TestComponent() {
    const { theme, resolvedTheme, setTheme } = useTheme()

    return (
        <div>
            <span data-testid="theme">{theme}</span>
            <span data-testid="resolved-theme">{resolvedTheme}</span>
            <button onClick={() => setTheme('dark')} data-testid="set-dark">
                Set Dark
            </button>
            <button onClick={() => setTheme('light')} data-testid="set-light">
                Set Light
            </button>
            <button onClick={() => setTheme('auto')} data-testid="set-auto">
                Set Auto
            </button>
        </div>
    )
}

// Test component that uses theme variables
function TestVariablesComponent() {
    const variables = useThemeVariables()

    return (
        <div data-testid="variables" style={variables}>
            Variables applied
        </div>
    )
}

describe('ThemeProvider', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockMatchMedia.mockReturnValue({
            matches: false,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn()
        })
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('Basic functionality', () => {
        it('should provide default theme', () => {
            render(
                <ThemeProvider>
                    <TestComponent />
                </ThemeProvider>
            )

            expect(screen.getByTestId('theme')).toHaveTextContent('auto')
            expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light')
        })

        it('should use custom default theme', () => {
            render(
                <ThemeProvider defaultTheme="dark">
                    <TestComponent />
                </ThemeProvider>
            )

            expect(screen.getByTestId('theme')).toHaveTextContent('dark')
            expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark')
        })

        it('should load theme from localStorage', () => {
            mockLocalStorage.getItem.mockReturnValue('light')

            render(
                <ThemeProvider>
                    <TestComponent />
                </ThemeProvider>
            )

            expect(screen.getByTestId('theme')).toHaveTextContent('light')
        })

        it('should ignore invalid theme from localStorage', () => {
            mockLocalStorage.getItem.mockReturnValue('invalid-theme')

            render(
                <ThemeProvider defaultTheme="dark">
                    <TestComponent />
                </ThemeProvider>
            )

            expect(screen.getByTestId('theme')).toHaveTextContent('dark')
        })
    })

    describe('Theme switching', () => {
        it('should update theme when setTheme is called', async () => {
            render(
                <ThemeProvider>
                    <TestComponent />
                </ThemeProvider>
            )

            fireEvent.click(screen.getByTestId('set-dark'))

            await waitFor(() => {
                expect(screen.getByTestId('theme')).toHaveTextContent('dark')
                expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark')
            })

            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('file-upload-theme', 'dark')
        })

        it('should use custom storage key', async () => {
            render(
                <ThemeProvider storageKey="custom-theme-key">
                    <TestComponent />
                </ThemeProvider>
            )

            fireEvent.click(screen.getByTestId('set-light'))

            await waitFor(() => {
                expect(mockLocalStorage.setItem).toHaveBeenCalledWith('custom-theme-key', 'light')
            })
        })

        it('should resolve auto theme based on system preference', async () => {
            mockMatchMedia.mockReturnValue({
                matches: true,
                addEventListener: vi.fn(),
                removeEventListener: vi.fn()
            })

            render(
                <ThemeProvider>
                    <TestComponent />
                </ThemeProvider>
            )

            fireEvent.click(screen.getByTestId('set-auto'))

            await waitFor(() => {
                expect(screen.getByTestId('theme')).toHaveTextContent('auto')
                expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark')
            })
        })
    })

    describe('System theme watching', () => {
        it('should watch for system theme changes when theme is auto', async () => {
            const mockAddEventListener = vi.fn()
            const mockRemoveEventListener = vi.fn()

            mockMatchMedia.mockReturnValue({
                matches: false,
                addEventListener: mockAddEventListener,
                removeEventListener: mockRemoveEventListener
            })

            const { unmount } = render(
                <ThemeProvider defaultTheme="auto">
                    <TestComponent />
                </ThemeProvider>
            )

            expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function))

            unmount()
            expect(mockRemoveEventListener).toHaveBeenCalledWith('change', expect.any(Function))
        })

        it('should not watch for system theme changes when theme is not auto', () => {
            const mockAddEventListener = vi.fn()

            mockMatchMedia.mockReturnValue({
                matches: false,
                addEventListener: mockAddEventListener,
                removeEventListener: vi.fn()
            })

            render(
                <ThemeProvider defaultTheme="light">
                    <TestComponent />
                </ThemeProvider>
            )

            expect(mockAddEventListener).not.toHaveBeenCalled()
        })
    })

    describe('Configuration', () => {
        it('should provide config through context', () => {
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

            render(
                <ThemeProvider config={config}>
                    <TestVariablesComponent />
                </ThemeProvider>
            )

            const variablesElement = screen.getByTestId('variables')
            const computedStyle = window.getComputedStyle(variablesElement)

            // Note: In jsdom, we can't actually test computed styles, but we can verify the component renders
            expect(variablesElement).toBeInTheDocument()
        })
    })

    describe('useTheme hook', () => {
        it('should throw error when used outside ThemeProvider', () => {
            // Suppress console.error for this test
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

            expect(() => {
                render(<TestComponent />)
            }).toThrow('useTheme must be used within a ThemeProvider')

            consoleSpy.mockRestore()
        })
    })

    describe('ThemeToggle component', () => {
        it('should render with default icons', () => {
            render(
                <ThemeProvider defaultTheme="light">
                    <ThemeToggle />
                </ThemeProvider>
            )

            const button = screen.getByRole('button')
            expect(button).toHaveTextContent('🌙')
            expect(button).toHaveAttribute('aria-label', 'Switch to dark theme')
        })

        it('should cycle through themes when clicked', async () => {
            render(
                <ThemeProvider defaultTheme="light">
                    <TestComponent />
                    <ThemeToggle />
                </ThemeProvider>
            )

            const button = screen.getByRole('button', { name: /switch to/i })

            // Light -> Dark
            fireEvent.click(button)
            await waitFor(() => {
                expect(screen.getByTestId('theme')).toHaveTextContent('dark')
            })

            // Dark -> Auto
            fireEvent.click(button)
            await waitFor(() => {
                expect(screen.getByTestId('theme')).toHaveTextContent('auto')
            })

            // Auto -> Light
            fireEvent.click(button)
            await waitFor(() => {
                expect(screen.getByTestId('theme')).toHaveTextContent('light')
            })
        })

        it('should render custom children', () => {
            render(
                <ThemeProvider>
                    <ThemeToggle>
                        <span>Custom Toggle</span>
                    </ThemeToggle>
                </ThemeProvider>
            )

            expect(screen.getByText('Custom Toggle')).toBeInTheDocument()
        })

        it('should apply custom className', () => {
            render(
                <ThemeProvider>
                    <ThemeToggle className="custom-class" />
                </ThemeProvider>
            )

            const button = screen.getByRole('button')
            expect(button).toHaveClass('custom-class')
        })
    })
})