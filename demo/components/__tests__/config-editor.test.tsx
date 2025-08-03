import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { ConfigEditor } from '../config-editor'
import { defaultConfig } from '../../../src/lib/config/schema'
import { FileUploadConfig } from '../../../src/lib'

// Mock react-syntax-highlighter to avoid issues in test environment
vi.mock('react-syntax-highlighter', () => ({
    Prism: ({ children }: { children: string }) => <pre data-testid="syntax-highlighter">{children}</pre>
}))

vi.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
    tomorrow: {}
}))

// Mock clipboard API globally
const mockWriteText = vi.fn()
global.navigator = {
    ...global.navigator,
    clipboard: {
        writeText: mockWriteText
    }
}

describe('ConfigEditor', () => {
    const mockOnChange = vi.fn()

    beforeEach(() => {
        mockOnChange.mockClear()
        mockWriteText.mockClear()
        mockWriteText.mockResolvedValue(undefined)
    })

    const renderConfigEditor = (config: FileUploadConfig = defaultConfig) => {
        return render(
            <ConfigEditor
                config={config}
                onChange={mockOnChange}
            />
        )
    }

    describe('Basic Rendering', () => {
        it('renders the config editor with title', () => {
            renderConfigEditor()
            expect(screen.getByText('Live Config Editor')).toBeInTheDocument()
        })

        it('renders preset templates', () => {
            renderConfigEditor()
            expect(screen.getByText('Default Configuration')).toBeInTheDocument()
            expect(screen.getByText('Image Upload Only')).toBeInTheDocument()
            expect(screen.getByText('Multi-File Upload')).toBeInTheDocument()
            expect(screen.getByText('Dark Theme')).toBeInTheDocument()
        })

        it('renders validation status as valid initially', () => {
            renderConfigEditor()
            expect(screen.getByText('Configuration is valid')).toBeInTheDocument()
        })

        it('renders JSON textarea with initial config', () => {
            renderConfigEditor()
            const textarea = screen.getByRole('textbox')
            expect(textarea).toHaveValue(JSON.stringify(defaultConfig, null, 2))
        })

        it('renders usage tips', () => {
            renderConfigEditor()
            expect(screen.getByText('Usage Tips')).toBeInTheDocument()
            expect(screen.getByText(/Changes are applied automatically with a 500ms delay/)).toBeInTheDocument()
        })
    })

    describe('JSON Editing', () => {
        it('updates JSON value when typing', () => {
            renderConfigEditor()

            const textarea = screen.getByRole('textbox')
            fireEvent.change(textarea, { target: { value: '{"test": "value"}' } })

            expect(textarea).toHaveValue('{"test": "value"}')
        })

        it('validates JSON and shows errors for invalid JSON', async () => {
            renderConfigEditor()

            const textarea = screen.getByRole('textbox')
            fireEvent.change(textarea, { target: { value: '{"invalid": json}' } })

            // Wait for debounced validation
            await waitFor(() => {
                expect(screen.getByText(/validation error/)).toBeInTheDocument()
            }, { timeout: 1000 })
        })

        it('calls onChange with valid config after debounce', async () => {
            renderConfigEditor()

            const validConfig = {
                ...defaultConfig,
                defaults: {
                    ...defaultConfig.defaults,
                    variant: 'dropzone' as const
                }
            }

            const textarea = screen.getByRole('textbox')
            fireEvent.change(textarea, { target: { value: JSON.stringify(validConfig) } })

            // Wait for debounced validation and onChange call
            await waitFor(() => {
                expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
                    defaults: expect.objectContaining({
                        variant: 'dropzone'
                    })
                }))
            }, { timeout: 1000 })
        })

        it('shows validation errors for invalid config structure', async () => {
            renderConfigEditor()

            const invalidConfig = {
                defaults: {
                    variant: 'invalid-variant'
                }
            }

            const textarea = screen.getByRole('textbox')
            fireEvent.change(textarea, { target: { value: JSON.stringify(invalidConfig) } })

            await waitFor(() => {
                expect(screen.getByText(/validation error/)).toBeInTheDocument()
            }, { timeout: 1000 })
        })
    })

    describe('Preset Templates', () => {
        it('applies default preset when clicked', async () => {
            renderConfigEditor()

            const defaultPreset = screen.getByText('Default Configuration')
            fireEvent.click(defaultPreset)

            expect(mockOnChange).toHaveBeenCalledWith(defaultConfig)
        })

        it('applies image-only preset when clicked', async () => {
            renderConfigEditor()

            const imagePreset = screen.getByText('Image Upload Only')
            fireEvent.click(imagePreset)

            expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
                defaults: expect.objectContaining({
                    variant: 'image-only',
                    accept: 'image/*'
                })
            }))
        })

        it('applies multi-file preset when clicked', async () => {
            renderConfigEditor()

            const multiFilePreset = screen.getByText('Multi-File Upload')
            fireEvent.click(multiFilePreset)

            expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
                defaults: expect.objectContaining({
                    variant: 'multi-file',
                    multiple: true
                })
            }))
        })

        it('applies dark theme preset when clicked', async () => {
            renderConfigEditor()

            const darkThemePreset = screen.getByText('Dark Theme')
            fireEvent.click(darkThemePreset)

            expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
                styling: expect.objectContaining({
                    theme: 'dark',
                    colors: expect.objectContaining({
                        background: '#1f2937'
                    })
                })
            }))
        })

        it('updates textarea when preset is selected', async () => {
            renderConfigEditor()

            const imagePreset = screen.getByText('Image Upload Only')
            fireEvent.click(imagePreset)

            const textarea = screen.getByRole('textbox')
            expect(textarea.value).toContain('"variant": "image-only"')
        })

        it('highlights selected preset', async () => {
            renderConfigEditor()

            const imagePreset = screen.getByText('Image Upload Only').closest('button')
            fireEvent.click(imagePreset!)

            expect(imagePreset).toHaveClass('border-primary')
        })
    })

    describe('Action Buttons', () => {
        it('resets to default config when reset button is clicked', async () => {
            renderConfigEditor()

            // First modify the config
            const textarea = screen.getByRole('textbox')
            fireEvent.change(textarea, { target: { value: '{"test": "modified"}' } })

            // Then reset
            const resetButton = screen.getByTitle('Reset to default')
            fireEvent.click(resetButton)

            expect(mockOnChange).toHaveBeenCalledWith(defaultConfig)
            expect(textarea).toHaveValue(JSON.stringify(defaultConfig, null, 2))
        })

        it('copies JSON to clipboard when copy button is clicked', async () => {
            renderConfigEditor()

            const copyButton = screen.getByTitle('Copy to clipboard')
            fireEvent.click(copyButton)

            expect(mockWriteText).toHaveBeenCalledWith(
                JSON.stringify(defaultConfig, null, 2)
            )
        })

        it('formats JSON when format button is clicked', async () => {
            renderConfigEditor()

            // First add unformatted JSON
            const textarea = screen.getByRole('textbox')
            fireEvent.change(textarea, { target: { value: '{"test":"unformatted","nested":{"value":123}}' } })

            // Then format
            const formatButton = screen.getByTitle('Format JSON')
            fireEvent.click(formatButton)

            expect(textarea.value).toContain('{\n  "test": "unformatted",\n  "nested": {\n    "value": 123\n  }\n}')
        })

        it('toggles preview when show/hide preview button is clicked', async () => {
            renderConfigEditor()

            const previewButton = screen.getByText('Show Preview')
            fireEvent.click(previewButton)

            expect(screen.getByText('Hide Preview')).toBeInTheDocument()
            expect(screen.getByText('Formatted Preview')).toBeInTheDocument()
            expect(screen.getByTestId('syntax-highlighter')).toBeInTheDocument()

            // Hide preview
            const hideButton = screen.getByText('Hide Preview')
            fireEvent.click(hideButton)

            expect(screen.getByText('Show Preview')).toBeInTheDocument()
            expect(screen.queryByText('Formatted Preview')).not.toBeInTheDocument()
        })
    })

    describe('Validation Display', () => {
        it('shows detailed validation errors', async () => {
            renderConfigEditor()

            const invalidConfig = {
                defaults: {
                    variant: 'invalid-variant',
                    size: 'invalid-size',
                    maxSize: -1
                }
            }

            const textarea = screen.getByRole('textbox')
            fireEvent.change(textarea, { target: { value: JSON.stringify(invalidConfig) } })

            await waitFor(() => {
                expect(screen.getByText(/validation error/)).toBeInTheDocument()
            }, { timeout: 1000 })
        })

        it('limits displayed errors to 5', async () => {
            renderConfigEditor()

            // Create config with many validation errors
            const invalidConfig = {
                defaults: {
                    variant: 'invalid1',
                    size: 'invalid2',
                    radius: 'invalid3',
                    theme: 'invalid4',
                    maxSize: -1,
                    maxFiles: -1
                }
            }

            const textarea = screen.getByRole('textbox')
            fireEvent.change(textarea, { target: { value: JSON.stringify(invalidConfig) } })

            await waitFor(() => {
                const errorElements = screen.getAllByText(/defaults\./)
                expect(errorElements.length).toBeLessThanOrEqual(5)
            }, { timeout: 1000 })
        })

        it('shows "more errors" message when there are more than 5 errors', async () => {
            renderConfigEditor()

            // Create config with many validation errors
            const invalidConfig = {
                defaults: {
                    variant: 'invalid1',
                    size: 'invalid2',
                    radius: 'invalid3',
                    theme: 'invalid4',
                    maxSize: -1,
                    maxFiles: -1
                },
                validation: {
                    maxSize: -1,
                    maxFiles: -1
                }
            }

            const textarea = screen.getByRole('textbox')
            fireEvent.change(textarea, { target: { value: JSON.stringify(invalidConfig) } })

            await waitFor(() => {
                expect(screen.getByText(/\.\.\. and \d+ more errors/)).toBeInTheDocument()
            }, { timeout: 1000 })
        })
    })

    describe('Accessibility', () => {
        it('has proper ARIA labels and roles', () => {
            renderConfigEditor()

            const textarea = screen.getByRole('textbox')
            expect(textarea).toBeInTheDocument()

            // Check buttons have proper titles
            expect(screen.getByTitle('Copy to clipboard')).toBeInTheDocument()
            expect(screen.getByTitle('Format JSON')).toBeInTheDocument()
            expect(screen.getByTitle('Reset to default')).toBeInTheDocument()
        })
    })

    describe('Error Handling', () => {
        it('handles clipboard API errors gracefully', async () => {
            // Mock clipboard to throw error
            mockWriteText.mockRejectedValue(new Error('Clipboard error'))

            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

            renderConfigEditor()

            const copyButton = screen.getByTitle('Copy to clipboard')
            fireEvent.click(copyButton)

            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalledWith('Failed to copy to clipboard:', expect.any(Error))
            })

            consoleSpy.mockRestore()
        })

        it('handles invalid JSON gracefully during formatting', async () => {
            renderConfigEditor()

            const textarea = screen.getByRole('textbox')
            fireEvent.change(textarea, { target: { value: 'invalid json' } })

            const formatButton = screen.getByTitle('Format JSON')
            fireEvent.click(formatButton)

            // Should not crash and should keep the invalid JSON
            expect(textarea).toHaveValue('invalid json')
        })
    })

    describe('Debouncing', () => {
        it('debounces onChange calls', async () => {
            renderConfigEditor()

            const textarea = screen.getByRole('textbox')

            // Use fireEvent to simulate rapid changes
            fireEvent.change(textarea, { target: { value: '{"test": "value1"}' } })
            fireEvent.change(textarea, { target: { value: '{"test": "value2"}' } })
            fireEvent.change(textarea, { target: { value: '{"test": "value3"}' } })

            // Should not call onChange immediately
            expect(mockOnChange).not.toHaveBeenCalled()

            // Wait for debounce
            await waitFor(() => {
                expect(mockOnChange).toHaveBeenCalled()
            }, { timeout: 1000 })
        })
    })
})