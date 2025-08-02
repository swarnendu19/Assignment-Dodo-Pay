import React from 'react'
import { FileUpload } from '../src/lib/components/file-upload/file-upload'

export const MultiFileUploadDemo: React.FC = () => {
    const handleFileSelect = (files: File[]) => {
        console.log('Files selected:', files)
    }

    const handleError = (error: string) => {
        console.error('Upload error:', error)
    }

    const handleUpload = async (files: File[]) => {
        console.log('Uploading files:', files)
        // Simulate upload process
        return Promise.resolve()
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Multi-File Upload Demo</h1>

            <div className="space-y-8">
                {/* Basic Multi-File Upload */}
                <section>
                    <h2 className="text-xl font-semibold mb-4">Basic Multi-File Upload</h2>
                    <FileUpload
                        variant="multi-file"
                        multiple={true}
                        onFileSelect={handleFileSelect}
                        onError={handleError}
                        onUpload={handleUpload}
                    />
                </section>

                {/* Multi-File Upload with Grid Layout */}
                <section>
                    <h2 className="text-xl font-semibold mb-4">Grid Layout</h2>
                    <FileUpload
                        variant="multi-file"
                        multiple={true}
                        listLayout="grid"
                        onFileSelect={handleFileSelect}
                        onError={handleError}
                        onUpload={handleUpload}
                    />
                </section>

                {/* Multi-File Upload without Bulk Actions */}
                <section>
                    <h2 className="text-xl font-semibold mb-4">Without Bulk Actions</h2>
                    <FileUpload
                        variant="multi-file"
                        multiple={true}
                        bulkActions={false}
                        onFileSelect={handleFileSelect}
                        onError={handleError}
                        onUpload={handleUpload}
                    />
                </section>

                {/* Multi-File Upload with File Restrictions */}
                <section>
                    <h2 className="text-xl font-semibold mb-4">With File Restrictions</h2>
                    <FileUpload
                        variant="multi-file"
                        multiple={true}
                        accept="image/*,application/pdf"
                        maxSize={5 * 1024 * 1024} // 5MB
                        maxFiles={10}
                        onFileSelect={handleFileSelect}
                        onError={handleError}
                        onUpload={handleUpload}
                    />
                </section>
            </div>
        </div>
    )
}

export default MultiFileUploadDemo