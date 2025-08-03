import React, { useState, useEffect, useCallback } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { FileUploadConfig } from '../../src/lib'
import { defaultConfig, validateConfig, loadConfigFromJSON, ValidationError } from '../../src/lib/config/schema'
import { AlertCircle, CheckCircle, Copy, RotateCcw, Palette, Settings, Image, Upload } from 'lucide-react'

interface ConfigEditorProps {
    config: FileUploadConfig
    onChange: (config: FileUploadConfig) => void
    className?: string
}

// Preset configurations for different use cases
const presetConfigs = {
    default: {
        name: 'Default Configuration',
        description: 'Standard file upload with all features enabled',
        icon: Settings,
        config: defaultConfig
    },
    imageOnly: {
        name: 'Image Upload Only',
        description: 'Optimized for image uploads with preview',
        icon: Image,
        config: {
            ...defaultConfig,
            defaults: {
                ...defaultConfig.defaults,
                variant: 'image-only' as const,
                accept: 'image/*',
                maxSize: 5 * 1024 * 1024, // 5MB
                maxFiles: 1
            },
            validation: {
                ...defaultConfig.validation,
                allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
                allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
                maxSize: 5 * 1024 * 1024,
                maxFiles: 1,
                validateDimensions: true,
                maxWidth: 2048,
                maxHeight: 2048
            },
            features: {
                ...defaultConfig.features,
                preview: true,
                multipleFiles: false
            }
        }
    },
    multiFile: {
        name: 'Multi-File Upload',
        description: 'Support for multiple file uploads with progress tracking',
        icon: Upload,
        config: {
            ...defaultConfig,
            defaults: {
                ...defaultConfig.defaults,
                variant: 'multi-file' as const,
                multiple: true,
                maxFiles: 10
            },
            validation: {
                ...defaultConfig.validation,
                maxFiles: 10
            },
            features: {
                ...defaultConfig.features,
                multipleFiles: true,
                progress: true,
                removeFiles: true
            }
        }
    },
    darkTheme: {
        name: 'Dark Theme',
        description: 'Dark theme configuration with custom colors',
        icon: Palette,
        config: {
            ...defaultConfig,
            defaults: {
                ...defaultConfig.defaults,
                theme: 'dark' as const
            },
            styling: {
                ...defaultConfig.styling,
                theme: 'dark' as const,
                colors: {
                    primary: '#3b82f6',
                    secondary: '#6b7280',
                    success: '#10b981',
                    error: '#ef4444',
                    warning: '#f59e0b',
                    background: '#1f2937',
                    foreground: '#f9fafb',
                    border: '#374151',
                    muted: '#6b7280'
                }
            }
        }
    }
}

export const ConfigEditor: React.FC<ConfigEditorProps> = ({ config, onChange, className = '' }) => {
    const [jsonValue, setJsonValue] = useState('')
    const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
    const [isValid, setIsValid] = useState(true)
    const [selectedPreset, setSelectedPreset] = useState<string>('')
    const [showPreview, setShowPreview] = useState(false)

    // Initialize JSON value from config
    useEffect(() => {
        setJsonValue(JSON.stringify(config, null, 2))
    }, [config])

    // Debounced validation and config update
    const validateAndUpdate = useCallback((value: string) => {
        const result = loadConfigFromJSON(value)

        if (result.config && result.errors.length === 0) {
            setValidationErrors([])
            setIsValid(true)
            onChange(result.config)
        } else {
            setValidationErrors(result.errors)
            setIsValid(false)
        }
    }, [onChange])

    // Handle JSON input changes with debouncing
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (jsonValue.trim()) {
                validateAndUpdate(jsonValue)
            }
        }, 500)

        return () => clearTimeout(timeoutId)
    }, [jsonValue, validateAndUpdate])

    const handleChange = (value: string) => {
        setJsonValue(value)
        setSelectedPreset('') // Clear preset selection when manually editing
    }

    const handlePresetSelect = (presetKey: string) => {
        const preset = presetConfigs[presetKey as keyof typeof presetConfigs]
        if (preset) {
            const newJsonValue = JSON.stringify(preset.config, null, 2)
            setJsonValue(newJsonValue)
            setSelectedPreset(presetKey)
            onChange(preset.config)
            setValidationErrors([])
            setIsValid(true)
        }
    }

    const handleReset = () => {
        const defaultJsonValue = JSON.stringify(defaultConfig, null, 2)
        setJsonValue(defaultJsonValue)
        setSelectedPreset('default')
        onChange(defaultConfig)
        setValidationErrors([])
        setIsValid(true)
    }

    const handleCopyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(jsonValue)
        } catch (err) {
            console.error('Failed to copy to clipboard:', err)
        }
    }

    const formatJson = () => {
        try {
            const parsed = JSON.parse(jsonValue)
            const formatted = JSON.stringify(parsed, null, 2)
            setJsonValue(formatted)
        } catch (err) {
            // Invalid JSON, don't format
        }
    }

    return (
        <div className={`bg-card rounded-lg border p-6 ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Live Config Editor</h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="px-3 py-1 text-sm bg-muted text-muted-foreground rounded hover:bg-muted/80 transition-colors"
                    >
                        {showPreview ? 'Hide Preview' : 'Show Preview'}
                    </button>
                    <button
                        onClick={handleCopyToClipboard}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                        title="Copy to clipboard"
                    >
                        <Copy className="w-4 h-4" />
                    </button>
                    <button
                        onClick={formatJson}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                        title="Format JSON"
                    >
                        <Settings className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleReset}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                        title="Reset to default"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Preset Templates */}
            <div className="mb-4">
                <h4 className="text-sm font-medium text-foreground mb-2">Preset Templates</h4>
                <div className="grid grid-cols-2 gap-2">
                    {Object.entries(presetConfigs).map(([key, preset]) => {
                        const Icon = preset.icon
                        return (
                            <button
                                key={key}
                                onClick={() => handlePresetSelect(key)}
                                className={`p-3 text-left border rounded-lg transition-colors ${selectedPreset === key
                                        ? 'border-primary bg-primary/5 text-primary'
                                        : 'border-border hover:border-primary/50 text-foreground'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <Icon className="w-4 h-4" />
                                    <span className="font-medium text-sm">{preset.name}</span>
                                </div>
                                <p className="text-xs text-muted-foreground">{preset.description}</p>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Validation Status */}
            <div className="mb-4">
                <div className={`flex items-center gap-2 p-2 rounded-lg ${isValid
                        ? 'bg-success/10 text-success border border-success/20'
                        : 'bg-error/10 text-error border border-error/20'
                    }`}>
                    {isValid ? (
                        <>
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Configuration is valid</span>
                        </>
                    ) : (
                        <>
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">
                                {validationErrors.length} validation error{validationErrors.length !== 1 ? 's' : ''}
                            </span>
                        </>
                    )}
                </div>

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                    <div className="mt-2 space-y-1">
                        {validationErrors.slice(0, 5).map((error, index) => (
                            <div key={index} className="text-sm text-error bg-error/5 p-2 rounded border border-error/20">
                                <span className="font-medium">{error.path}:</span> {error.message}
                                {error.value !== undefined && (
                                    <span className="text-muted-foreground"> (got: {JSON.stringify(error.value)})</span>
                                )}
                            </div>
                        ))}
                        {validationErrors.length > 5 && (
                            <div className="text-sm text-muted-foreground">
                                ... and {validationErrors.length - 5} more errors
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Editor */}
            <div className="grid grid-cols-1 gap-4">
                <div className="relative">
                    <div className="absolute top-2 right-2 z-10">
                        <span className={`px-2 py-1 text-xs rounded ${isValid
                                ? 'bg-success/20 text-success'
                                : 'bg-error/20 text-error'
                            }`}>
                            {isValid ? 'Valid' : 'Invalid'}
                        </span>
                    </div>

                    <textarea
                        value={jsonValue}
                        onChange={(e) => handleChange(e.target.value)}
                        className="w-full h-96 p-4 font-mono text-sm bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        placeholder="Enter JSON configuration..."
                        spellCheck={false}
                    />
                </div>

                {/* Syntax Highlighted Preview */}
                {showPreview && (
                    <div className="border border-border rounded-lg overflow-hidden">
                        <div className="bg-muted/50 px-3 py-2 border-b border-border">
                            <span className="text-sm font-medium text-foreground">Formatted Preview</span>
                        </div>
                        <div className="max-h-96 overflow-auto">
                            <SyntaxHighlighter
                                language="json"
                                style={tomorrow}
                                customStyle={{
                                    margin: 0,
                                    padding: '1rem',
                                    background: 'transparent',
                                    fontSize: '0.875rem'
                                }}
                            >
                                {jsonValue}
                            </SyntaxHighlighter>
                        </div>
                    </div>
                )}
            </div>

            {/* Usage Instructions */}
            <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                <h5 className="text-sm font-medium text-foreground mb-2">Usage Tips</h5>
                <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Changes are applied automatically with a 500ms delay</li>
                    <li>• Use preset templates as starting points for common configurations</li>
                    <li>• Validation errors will appear above the editor with specific guidance</li>
                    <li>• Click "Show Preview" to see syntax-highlighted JSON</li>
                </ul>
            </div>
        </div>
    )
}

ConfigEditor.displayName = 'ConfigEditor'