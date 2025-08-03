import React from 'react'
import type { FileUploadProps } from '../../src/lib'

interface PropControlsProps {
    props: Partial<FileUploadProps>
    onChange: (props: Partial<FileUploadProps>) => void
}

export function PropControls({ props, onChange }: PropControlsProps) {
    const handleChange = (key: keyof FileUploadProps, value: any) => {
        onChange({ [key]: value })
    }

    return (
        <div className="bg-card rounded-lg border p-6 sticky top-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">
                Component Controls
            </h3>

            <div className="space-y-4">
                {/* Variant Selection */}
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Variant
                    </label>
                    <select
                        value={props.variant || 'button'}
                        onChange={(e) => handleChange('variant', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="button">Button</option>
                        <option value="dropzone">Dropzone</option>
                        <option value="preview">Preview</option>
                        <option value="image-only">Image Only</option>
                        <option value="multi-file">Multi-File</option>
                    </select>
                </div>

                {/* Size Selection */}
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Size
                    </label>
                    <select
                        value={props.size || 'md'}
                        onChange={(e) => handleChange('size', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="sm">Small</option>
                        <option value="md">Medium</option>
                        <option value="lg">Large</option>
                    </select>
                </div>

                {/* Radius Selection */}
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Border Radius
                    </label>
                    <select
                        value={props.radius || 'md'}
                        onChange={(e) => handleChange('radius', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="none">None</option>
                        <option value="sm">Small</option>
                        <option value="md">Medium</option>
                        <option value="lg">Large</option>
                        <option value="full">Full</option>
                    </select>
                </div>

                {/* Boolean Props */}
                <div className="space-y-3">
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={props.multiple || false}
                            onChange={(e) => handleChange('multiple', e.target.checked)}
                            className="rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-foreground">Multiple files</span>
                    </label>

                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={props.disabled || false}
                            onChange={(e) => handleChange('disabled', e.target.checked)}
                            className="rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-foreground">Disabled</span>
                    </label>
                </div>

                {/* Accept Types */}
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Accept Types
                    </label>
                    <input
                        type="text"
                        value={props.accept || ''}
                        onChange={(e) => handleChange('accept', e.target.value)}
                        placeholder="e.g., image/*, .pdf, .doc"
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                {/* Max Size */}
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Max Size (MB)
                    </label>
                    <input
                        type="number"
                        value={props.maxSize ? props.maxSize / (1024 * 1024) : ''}
                        onChange={(e) => handleChange('maxSize', e.target.value ? parseInt(e.target.value) * 1024 * 1024 : undefined)}
                        placeholder="10"
                        min="1"
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                {/* Max Files */}
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Max Files
                    </label>
                    <input
                        type="number"
                        value={props.maxFiles || ''}
                        onChange={(e) => handleChange('maxFiles', e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="5"
                        min="1"
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
            </div>
        </div>
    )
}