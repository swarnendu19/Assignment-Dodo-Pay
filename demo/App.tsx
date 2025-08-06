import React, { useState } from 'react'
import { FileUpload } from '../src/lib'
import { VariantShowcase } from './components/VariantShowcase'
import { PropControls } from './components/PropControls'
import { CodeSnippets } from './components/CodeSnippets'

type FileUploadVariant = "button" | "dropzone" | "preview" | "image-only" | "multi-file"
type FileUploadSize = "sm" | "md" | "lg"

interface FileUploadProps {
    variant?: FileUploadVariant
    size?: FileUploadSize
    multiple?: boolean
    disabled?: boolean
    accept?: string
    onFileSelect?: (files: File[]) => void
}

function App() {
    const [selectedVariant, setSelectedVariant] = useState<FileUploadVariant>('button')
    const [props, setProps] = useState<FileUploadProps>({
        variant: 'button',
        size: 'md',
        multiple: false,
        disabled: false,
        accept: '*'
    })

    const handlePropsChange = (newProps: Partial<FileUploadProps>) => {
        setProps(prev => ({ ...prev, ...newProps }))
        if (newProps.variant) {
            setSelectedVariant(newProps.variant)
        }
    }

    const handleFileSelect = (files: File[]) => {
        console.log('Selected files:', files)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="border-b bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        ZentrixUI File Upload
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Clean, accessible file upload components with multiple variants
                    </p>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Demo Area */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Interactive Demo */}
                        <section className="bg-white rounded-lg border shadow-sm p-6">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                Interactive Demo
                            </h2>
                            <div className="bg-gray-50 rounded-xl p-8 min-h-[200px] flex items-center justify-center border border-gray-200">
                                <div className="w-full max-w-md">
                                    <FileUpload {...props} onFileSelect={handleFileSelect} />
                                </div>
                            </div>
                        </section>

                        {/* All Variants Showcase */}
                        <VariantShowcase />

                        {/* Code Examples */}
                        <CodeSnippets
                            variant={selectedVariant}
                            props={props}
                        />
                    </div>

                    {/* Controls Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg border shadow-sm">
                            <div className="p-4 border-b">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Component Props
                                </h3>
                            </div>
                            <div className="p-4">
                                <PropControls
                                    props={props}
                                    onChange={handlePropsChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t bg-white mt-16">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="text-center text-gray-600">
                        <p className="mb-2">Built with React, TypeScript, and TailwindCSS</p>
                        <p className="text-sm">Clean, accessible, and developer-friendly</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default App