import React from 'react'
import { FileUpload } from '../src/lib'

function App() {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                    File Upload Component Library Demo
                </h1>

                <div className="space-y-8">
                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Basic File Upload
                        </h2>
                        <FileUpload />
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Multiple Files
                        </h2>
                        <FileUpload multiple />
                    </section>
                </div>
            </div>
        </div>
    )
}

export default App