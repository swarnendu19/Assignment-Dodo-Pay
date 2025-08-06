import React, { useState } from 'react'

type FileUploadVariant = "button" | "dropzone" | "preview" | "image-only" | "multi-file"
type FileUploadSize = "sm" | "md" | "lg"

interface FileUploadProps {
    variant?: FileUploadVariant
    size?: FileUploadSize
    multiple?: boolean
    disabled?: boolean
    accept?: string
}

interface CodeSnippetsProps {
    variant?: FileUploadVariant
    props: FileUploadProps
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
        return `import { FileUpload } from 'zentrixui'

function MyComponent() {
    const handleFileSelect = (files: File[]) => {
        console.log('Selected files:', files)
        
        // Process files
        files.forEach(file => {
            console.log(\`File: \${file.name}, Size: \${file.size}, Type: \${file.type}\`)
        })
        
        // Upload files to your server
        uploadFiles(files)
    }

    const uploadFiles = async (files: File[]) => {
        try {
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

    return (
        <FileUpload
            variant="${variant}"
            size="${props.size || 'md'}"
            ${props.multiple ? 'multiple' : ''}
            ${props.accept && props.accept !== '*' ? `accept="${props.accept}"` : ''}
            onFileSelect={handleFileSelect}
        />
    )
}`
    }

    const generateConfigCode = () => {
        return `// Custom styling with children
import { FileUpload } from 'zentrixui'

function MyComponent() {
    const handleFileSelect = (files: File[]) => {
        console.log('Selected files:', files)
    }

    return (
        <FileUpload
            variant="${variant}"
            size="${props.size || 'md'}"
            ${props.multiple ? 'multiple' : ''}
            onFileSelect={handleFileSelect}
        >
            {/* Custom content */}
            <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.413V13H5.5z"/>
                    <path d="M9 13h2v5a1 1 0 11-2 0v-5z"/>
                </svg>
                <span>Upload your files</span>
            </div>
        </FileUpload>
    )
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
        <section className="bg-white rounded-lg border shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">
                    Code Examples
                </h2>
                <button
                    onClick={copyToClipboard}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    Copy Code
                </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mb-4 bg-gray-100 rounded-lg p-1">
                {[
                    { key: 'basic', label: 'Basic Usage' },
                    { key: 'advanced', label: 'Advanced' },
                    { key: 'config', label: 'Custom Content' }
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as any)}
                        className={`px-3 py-2 text-sm rounded-md transition-colors ${activeTab === tab.key
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Code Block */}
            <div className="relative">
                <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm">
                    <code className="font-mono">
                        {getCode()}
                    </code>
                </pre>
            </div>
        </section>
    )
}