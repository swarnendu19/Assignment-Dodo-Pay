import React, { useState } from 'react'
import { FileUpload, ThemeProvider, type FileUploadProps } from '../src/lib'
import { VariantShowcase } from './components/VariantShowcase'
import { PropControls } from './components/PropControls'
import { CodeSnippets } from './components/CodeSnippets'

function App() {
    const [selectedVariant, setSelectedVariant] = useState<FileUploadProps['variant']>('button')
    const [props, setProps] = useState<Partial<FileUploadProps>>({
        variant: 'button',
        size: 'md',
        radius: 'md',
        multiple: false,
        disabled: false
    })

    const handlePropsChange = (newProps: Partial<FileUploadProps>) => {
        setProps(prev => ({ ...prev, ...newProps }))
        if (newProps.variant) {
            setSelectedVariant(newProps.variant)
        }
    }

    return (
        <ThemeProvider>
            <div className="min-h-screen bg-background">
                {/* Header */}
                <header className="border-b bg-card">
                    <div className="max-w-7xl mx-auto px-4 py-6">
                        <h1 className="text-4xl font-bold text-foreground mb-2">
                            File Upload Component Library
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            A comprehensive, accessible file upload component with multiple variants and themes
                        </p>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Demo Area */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Interactive Demo */}
                            <section className="bg-card rounded-lg border p-6">
                                <h2 className="text-2xl font-semibold text-foreground mb-4">
                                    Interactive Demo
                                </h2>
                                <div className="bg-muted/50 rounded-lg p-8 min-h-[200px] flex items-center justify-center">
                                    <FileUpload {...props} />
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
                            <PropControls
                                props={props}
                                onChange={handlePropsChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="border-t bg-card mt-16">
                    <div className="max-w-7xl mx-auto px-4 py-8">
                        <div className="text-center text-muted-foreground">
                            <p className="mb-2">Built with React, TypeScript, and TailwindCSS</p>
                            <p className="text-sm">Accessible, customizable, and developer-friendly</p>
                        </div>
                    </div>
                </footer>
            </div>
        </ThemeProvider>
    )
}

export default App