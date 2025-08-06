type FileUploadVariant = "button" | "dropzone" | "preview" | "image-only" | "multi-file"
type FileUploadSize = "sm" | "md" | "lg"

interface FileUploadProps {
    variant?: FileUploadVariant
    size?: FileUploadSize
    multiple?: boolean
    disabled?: boolean
    accept?: string
}

interface PropControlsProps {
    props: FileUploadProps
    onChange: (props: Partial<FileUploadProps>) => void
}

export function PropControls({ props, onChange }: PropControlsProps) {
    const handleChange = (key: keyof FileUploadProps, value: any) => {
        onChange({ [key]: value })
    }

    return (
        <div className="space-y-4">
            {/* Variant Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                    Variant
                </label>
                <select
                    value={props.variant || 'button'}
                    onChange={(e) => handleChange('variant', e.target.value as FileUploadVariant)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-gray-900 mb-2">
                    Size
                </label>
                <select
                    value={props.size || 'md'}
                    onChange={(e) => handleChange('size', e.target.value as FileUploadSize)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="sm">Small</option>
                    <option value="md">Medium</option>
                    <option value="lg">Large</option>
                </select>
            </div>

            {/* Boolean Props */}
            <div className="space-y-3">
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={props.multiple || false}
                        onChange={(e) => handleChange('multiple', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-900">Multiple files</span>
                </label>

                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={props.disabled || false}
                        onChange={(e) => handleChange('disabled', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-900">Disabled</span>
                </label>
            </div>

            {/* Accept Types */}
            <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                    Accept Types
                </label>
                <input
                    type="text"
                    value={props.accept || ''}
                    onChange={(e) => handleChange('accept', e.target.value)}
                    placeholder="e.g., image/*, .pdf, .doc"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
        </div>
    )
}