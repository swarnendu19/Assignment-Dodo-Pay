import React, { useState } from 'react'
import type { FileUploadProps } from '../../src/lib'

interface CodeSnippetsProps {
    variant?: FileUploadProps['variant']
    props: Partial<FileUploadProps>
}

export function CodeSnippets({ variant = 'button', props }: CodeSnippetsProps) {
    const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'config'>('basic')

    const generateBasicCode = () => {
        const propsString = Object.entries(props)
            .filter(([key, value]) => {
                // Filter out default values
                if (key === 'variant' && value === 'button') return false
                if (key === 'size' && value === 'md') return false
                if (key === 'radius' && value === 'md') return false
                if (key === 'multiple' && value === false) return false
                if (key === 'disabled' && value === false) return false
                if (!value) return false
                return true
            })
            .map(([key, value]) => {
                if (typeof value === 'boolean') {
                    return value ? key : null
                }
                if (typeof value === 'string') {
                    return `${key}="${value}"`
                }
                if (typeof value === 'number') {
                    return `${key}={${value}}`
                }
                return null
            })
            .filter(Boolean)
            .join(' ')

        return `import { FileUpload } from 'file-upload-component-library'

function MyComponent() {
    return (
        <FileUpload${propsString ? ` ${propsString}` : ''} />
    )
}`
    }

    const generateAdvancedCode = () => {
        return `import { FileUpload } from 'file-upload-component-library'

function MyComponent() {
    const handleUpload = async (files: File[]) => {
        try {
            // Your upload logic here
            const formData = new FormData()
            files.forEach(file => formData.append('files', file))
            
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })
            
            if (!response.ok) throw new Error('Upload failed')
            console.log('Upload successful!')
        } catch (error) {
            console.error('Upload error:', error)
        }
    }

    const handleError = (error: string) => {
        console.error('File validation error:', error)
        // Show user-friendly error message
    }

    return (
        <FileUpload
            variant="${variant}"
            onUpload={handleUpload}
            onError={handleError}
            maxSize={10 * 1024 * 1024} // 10MB
            accept="image/*,.pdf,.doc,.docx"
            multiple
        />
    )
}`
    }

    const generateConfigCode = () => {
        return `// config.json
{
    "defaults": {
        "variant": "${variant}",
        "size": "${props.size || 'md'}",
        "radius": "${props.radius || 'md'}",
        "multiple": ${props.multiple || false}
    },
    "validation": {
        "maxSize": ${props.maxSize || 10485760},
        "maxFiles": ${props.maxFiles || 5},
        "allowedTypes": ["image/*", ".pdf", ".doc", ".docx"]
    },
    "styling": {
        "theme": "light",
        "colors": {
            "primary": "hsl(222.2 84% 4.9%)",
            "secondary": "hsl(210 40% 96%)",
            "success": "hsl(142.1 76.2% 36.3%)",
            "error": "hsl(0 84.2% 60.2%)"
        }
    },
    "labels": {
        "uploadText": "Choose files or drag and drop",
        "dragText": "Drop files here",
        "errorText": "Upload failed",
        "successText": "Upload successful"
    }
}

// Usage with config
import { FileUpload } from 'file-upload-component-library'
import config from './config.json'

function MyComponent() {
    return <FileUpload config={config} />
}`
    }

    const getCode = () => {
        switch (activeTab) {
            case 'basic':
                return generateBasicCode()
            case 'advanced':
                return generateAdvancedCode()
            case 'config':
                return generateConfigCode()
            default:
                return generateBasicCode()
        }
    }

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(getCode())
            // You could add a toast notification here
        } catch (err) {
            console.error('Failed to copy code:', err)
        }
    }

    return (
        <section className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-foreground">
                    Code Examples
                </h2>
                <button
                    onClick={copyToClipboard}
                    className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                    Copy Code
                </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mb-4 bg-muted rounded-lg p-1">
                {[
                    { key: 'basic', label: 'Basic Usage' },
                    { key: 'advanced', label: 'Advanced' },
                    { key: 'config', label: 'JSON Config' }
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as any)}
                        className={`px-3 py-2 text-sm rounded-md transition-colors ${activeTab === tab.key
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Code Block */}
            <div className="relative">
                <pre className="bg-muted/50 rounded-lg p-4 overflow-x-auto text-sm">
                    <code className="text-foreground font-mono">
                        {getCode()}
                    </code>
                </pre>
            </div>
        </section>
    )
}