import React, { useState } from 'react'
import { FileUploadConfig } from '../../src/lib'
import { defaultConfig } from '../../src/lib/config/schema'

interface ConfigEditorProps {
    config: FileUploadConfig
    onChange: (config: FileUploadConfig) => void
}

export const ConfigEditor: React.FC<ConfigEditorProps> = ({ config, onChange }) => {
    const [jsonValue, setJsonValue] = useState(JSON.stringify(config, null, 2))
    const [error, setError] = useState<string | null>(null)

    const handleChange = (value: string) => {
        setJsonValue(value)
        try {
            const parsed = JSON.parse(value)
            setError(null)
            onChange(parsed)
        } catch (err) {
            setError('Invalid JSON')
        }
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Live Config Editor</h3>
            <div className="relative">
                <textarea
                    value={jsonValue}
                    onChange={(e) => handleChange(e.target.value)}
                    className="w-full h-64 p-4 font-mono text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter JSON configuration..."
                />
                {error && (
                    <div className="absolute top-2 right-2 bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
                        {error}
                    </div>
                )}
            </div>
            <button
                onClick={() => {
                    setJsonValue(JSON.stringify(defaultConfig, null, 2))
                    onChange(defaultConfig)
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
                Reset to Default
            </button>
        </div>
    )
}

ConfigEditor.displayName = 'ConfigEditor'