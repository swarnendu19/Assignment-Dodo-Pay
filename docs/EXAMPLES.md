# Usage Examples

This document provides comprehensive examples for using the File Upload Component Library in various scenarios.

## Basic Examples

### Simple Button Upload

```tsx
import { FileUpload } from 'file-upload-component-library'
import 'file-upload-component-library/styles'

function SimpleUpload() {
  const handleUpload = async (files: File[]) => {
    console.log('Uploading files:', files)
    // Your upload logic here
  }

  return (
    <FileUpload
      variant="button"
      onUpload={handleUpload}
      accept="image/*"
      maxSize={5 * 1024 * 1024} // 5MB
    />
  )
}
```

### Dropzone with Multiple Files

```tsx
import { FileUpload } from 'file-upload-component-library'
import { useState } from 'react'

function DropzoneUpload() {
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  const handleUpload = async (files: File[]) => {
    for (const file of files) {
      // Simulate upload with progress
      for (let progress = 0; progress <= 100; progress += 10) {
        setUploadProgress(prev => ({ ...prev, [file.name]: progress }))
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
  }

  const handleProgress = (progress: number, file?: UploadFile) => {
    if (file) {
      setUploadProgress(prev => ({ ...prev, [file.name]: progress }))
    }
  }

  return (
    <div>
      <FileUpload
        variant="dropzone"
        multiple
        maxFiles={10}
        accept="image/*,video/*"
        onUpload={handleUpload}
        onProgress={handleProgress}
        className="min-h-[200px]"
      />
      
      {/* Progress Display */}
      {Object.entries(uploadProgress).map(([fileName, progress]) => (
        <div key={fileName} className="mt-2">
          <div className="flex justify-between text-sm">
            <span>{fileName}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
```

## Variant Examples

### Button Upload Variant

```tsx
import { FileUpload } from 'file-upload-component-library'
import { Upload, File } from 'lucide-react'

function ButtonVariants() {
  const handleUpload = async (files: File[]) => {
    console.log('Uploading:', files)
  }

  return (
    <div className="space-y-4">
      {/* Basic Button */}
      <FileUpload
        variant="button"
        onUpload={handleUpload}
        size="md"
      />

      {/* Custom Icon and Text */}
      <FileUpload
        variant="button"
        onUpload={handleUpload}
        icon={<Upload className="w-4 h-4" />}
        iconPlacement="left"
        placeholder="Choose Files"
        size="lg"
      />

      {/* Multiple Files */}
      <FileUpload
        variant="button"
        onUpload={handleUpload}
        multiple
        maxFiles={5}
        icon={<File className="w-4 h-4" />}
        placeholder="Select Multiple Files"
      />

      {/* Disabled State */}
      <FileUpload
        variant="button"
        onUpload={handleUpload}
        disabled
        placeholder="Upload Disabled"
      />
    </div>
  )
}
```

### Dropzone Upload Variant

```tsx
import { FileUpload } from 'file-upload-component-library'
import { useState } from 'react'

function DropzoneVariants() {
  const [dragState, setDragState] = useState<string>('')

  const handleUpload = async (files: File[]) => {
    console.log('Uploading:', files)
  }

  return (
    <div className="space-y-6">
      {/* Basic Dropzone */}
      <FileUpload
        variant="dropzone"
        onUpload={handleUpload}
        accept="image/*"
        multiple
        className="min-h-[150px]"
      />

      {/* Large Dropzone with Custom Styling */}
      <FileUpload
        variant="dropzone"
        onUpload={handleUpload}
        multiple
        maxFiles={20}
        className="min-h-[300px] border-2 border-dashed border-blue-300 bg-blue-50"
        onDragEnter={() => setDragState('Drag detected')}
        onDragLeave={() => setDragState('')}
        onDrop={() => setDragState('Files dropped')}
      />
      {dragState && <p className="text-sm text-blue-600">{dragState}</p>}

      {/* Document Dropzone */}
      <FileUpload
        variant="dropzone"
        onUpload={handleUpload}
        accept=".pdf,.doc,.docx,.txt"
        multiple
        maxSize={10 * 1024 * 1024} // 10MB
        className="min-h-[200px] border-gray-300"
        placeholder="Drop documents here or click to browse"
      />
    </div>
  )
}
```

### Preview Upload Variant

```tsx
import { FileUpload } from 'file-upload-component-library'
import { useState } from 'react'

function PreviewVariants() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const handleUpload = async (files: File[]) => {
    console.log('Uploading:', files)
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(files)
  }

  const handleFileRemove = (fileId: string) => {
    console.log('Removing file:', fileId)
  }

  return (
    <div className="space-y-6">
      {/* Image Preview */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Image Gallery Upload</h3>
        <FileUpload
          variant="preview"
          onUpload={handleUpload}
          onFileSelect={handleFileSelect}
          onFileRemove={handleFileRemove}
          accept="image/*"
          multiple
          maxFiles={12}
          maxSize={5 * 1024 * 1024}
        />
        <p className="text-sm text-gray-600 mt-2">
          Selected {selectedFiles.length} files
        </p>
      </div>

      {/* Document Preview */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Document Upload</h3>
        <FileUpload
          variant="preview"
          onUpload={handleUpload}
          accept=".pdf,.doc,.docx"
          multiple
          maxFiles={5}
          maxSize={20 * 1024 * 1024} // 20MB
        />
      </div>
    </div>
  )
}
```

### Image Upload Variant

```tsx
import { FileUpload } from 'file-upload-component-library'
import { useState } from 'react'

function ImageVariants() {
  const [profileImage, setProfileImage] = useState<string | null>(null)

  const handleUpload = async (files: File[]) => {
    const file = files[0]
    if (file) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setProfileImage(previewUrl)
      
      // Upload logic here
      console.log('Uploading image:', file)
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Picture Upload */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Profile Picture</h3>
        <div className="flex items-center space-x-4">
          {profileImage && (
            <img
              src={profileImage}
              alt="Profile preview"
              className="w-20 h-20 rounded-full object-cover"
            />
          )}
          <FileUpload
            variant="image-only"
            onUpload={handleUpload}
            accept="image/jpeg,image/png"
            maxSize={2 * 1024 * 1024} // 2MB
            className="flex-1"
          />
        </div>
      </div>

      {/* Product Image Upload */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Product Images</h3>
        <FileUpload
          variant="image-only"
          onUpload={handleUpload}
          accept="image/*"
          multiple
          maxFiles={6}
          maxSize={5 * 1024 * 1024}
          config={{
            validation: {
              validateDimensions: true,
              minWidth: 400,
              minHeight: 400,
              maxWidth: 2048,
              maxHeight: 2048
            }
          }}
        />
      </div>

      {/* Avatar Upload with Crop */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Avatar Upload</h3>
        <FileUpload
          variant="image-only"
          onUpload={handleUpload}
          accept="image/*"
          maxSize={1 * 1024 * 1024} // 1MB
          className="w-32 h-32 rounded-full"
          config={{
            styling: {
              spacing: {
                borderRadius: '50%'
              }
            }
          }}
        />
      </div>
    </div>
  )
}
```

### Multi-file Upload Variant

```tsx
import { FileUpload } from 'file-upload-component-library'
import { useState } from 'react'

function MultiFileVariants() {
  const [uploadQueue, setUploadQueue] = useState<File[]>([])
  const [uploadStatus, setUploadStatus] = useState<Record<string, string>>({})

  const handleUpload = async (files: File[]) => {
    setUploadQueue(files)
    
    for (const file of files) {
      setUploadStatus(prev => ({ ...prev, [file.name]: 'uploading' }))
      
      try {
        // Simulate upload
        await new Promise(resolve => setTimeout(resolve, 2000))
        setUploadStatus(prev => ({ ...prev, [file.name]: 'success' }))
      } catch (error) {
        setUploadStatus(prev => ({ ...prev, [file.name]: 'error' }))
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Bulk Document Upload */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Bulk Document Upload</h3>
        <FileUpload
          variant="multi-file"
          onUpload={handleUpload}
          multiple
          maxFiles={50}
          accept=".pdf,.doc,.docx,.txt,.xlsx"
          maxSize={25 * 1024 * 1024} // 25MB per file
        />
      </div>

      {/* Media Library Upload */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Media Library</h3>
        <FileUpload
          variant="multi-file"
          onUpload={handleUpload}
          multiple
          maxFiles={100}
          accept="image/*,video/*,audio/*"
          maxSize={100 * 1024 * 1024} // 100MB per file
          config={{
            features: {
              preview: true,
              progress: true,
              removeFiles: true,
              showFileSize: true,
              showFileType: true
            }
          }}
        />
      </div>

      {/* Upload Status Display */}
      {Object.keys(uploadStatus).length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium mb-2">Upload Status</h4>
          <div className="space-y-1">
            {Object.entries(uploadStatus).map(([fileName, status]) => (
              <div key={fileName} className="flex justify-between text-sm">
                <span>{fileName}</span>
                <span className={`
                  ${status === 'success' ? 'text-green-600' : ''}
                  ${status === 'error' ? 'text-red-600' : ''}
                  ${status === 'uploading' ? 'text-blue-600' : ''}
                `}>
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

## Configuration Examples

### JSON Configuration

```tsx
// config/upload.json
{
  "defaults": {
    "variant": "dropzone",
    "size": "lg",
    "multiple": true,
    "maxFiles": 10
  },
  "validation": {
    "allowedTypes": ["image/*", "application/pdf"],
    "maxSize": 10485760
  },
  "styling": {
    "colors": {
      "primary": "#8b5cf6",
      "success": "#059669"
    },
    "spacing": {
      "padding": "2rem"
    }
  },
  "labels": {
    "uploadText": "Upload Your Files",
    "dragText": "Drag files here or click to browse",
    "successText": "Files uploaded successfully!"
  },
  "features": {
    "dragAndDrop": true,
    "preview": true,
    "progress": true,
    "removeFiles": true
  }
}
```

```tsx
import { FileUpload } from 'file-upload-component-library'
import uploadConfig from './config/upload.json'

function ConfiguredUpload() {
  const handleUpload = async (files: File[]) => {
    console.log('Uploading with config:', files)
  }

  return (
    <FileUpload
      config={uploadConfig}
      onUpload={handleUpload}
    />
  )
}
```

### Dynamic Configuration

```tsx
import { FileUpload } from 'file-upload-component-library'
import { useState } from 'react'

function DynamicConfigUpload() {
  const [uploadType, setUploadType] = useState<'images' | 'documents'>('images')

  const getConfig = () => {
    if (uploadType === 'images') {
      return {
        defaults: {
          variant: 'preview' as const,
          accept: 'image/*',
          multiple: true,
          maxFiles: 20
        },
        validation: {
          allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
          maxSize: 5 * 1024 * 1024,
          validateDimensions: true,
          maxWidth: 2048,
          maxHeight: 2048
        },
        labels: {
          uploadText: 'Upload Images',
          dragText: 'Drag images here'
        }
      }
    } else {
      return {
        defaults: {
          variant: 'multi-file' as const,
          accept: '.pdf,.doc,.docx',
          multiple: true,
          maxFiles: 50
        },
        validation: {
          allowedTypes: ['application/pdf', 'application/msword'],
          maxSize: 25 * 1024 * 1024
        },
        labels: {
          uploadText: 'Upload Documents',
          dragText: 'Drag documents here'
        }
      }
    }
  }

  const handleUpload = async (files: File[]) => {
    console.log(`Uploading ${uploadType}:`, files)
  }

  return (
    <div>
      <div className="mb-4">
        <label className="mr-4">
          <input
            type="radio"
            value="images"
            checked={uploadType === 'images'}
            onChange={(e) => setUploadType(e.target.value as 'images')}
            className="mr-1"
          />
          Images
        </label>
        <label>
          <input
            type="radio"
            value="documents"
            checked={uploadType === 'documents'}
            onChange={(e) => setUploadType(e.target.value as 'documents')}
            className="mr-1"
          />
          Documents
        </label>
      </div>

      <FileUpload
        config={getConfig()}
        onUpload={handleUpload}
      />
    </div>
  )
}
```

## Advanced Examples

### Custom Upload Service

```tsx
import { FileUpload } from 'file-upload-component-library'
import { useState } from 'react'

// Custom upload service
class UploadService {
  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<string> {
    return new Promise((resolve, reject) => {
      const formData = new FormData()
      formData.append('file', file)

      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100
          onProgress(progress)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText)
          resolve(response.url)
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`))
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'))
      })

      xhr.open('POST', '/api/upload')
      xhr.send(formData)
    })
  }
}

function CustomServiceUpload() {
  const [uploadService] = useState(() => new UploadService())
  const [uploadedFiles, setUploadedFiles] = useState<Array<{name: string, url: string}>>([])

  const handleUpload = async (files: File[]) => {
    for (const file of files) {
      try {
        const url = await uploadService.uploadFile(file, (progress) => {
          console.log(`${file.name}: ${progress}%`)
        })
        
        setUploadedFiles(prev => [...prev, { name: file.name, url }])
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error)
      }
    }
  }

  return (
    <div>
      <FileUpload
        variant="dropzone"
        onUpload={handleUpload}
        multiple
        maxFiles={10}
      />

      {uploadedFiles.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Uploaded Files</h3>
          <ul className="space-y-1">
            {uploadedFiles.map((file, index) => (
              <li key={index}>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {file.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
```

### Form Integration

```tsx
import { FileUpload } from 'file-upload-component-library'
import { useState } from 'react'

interface FormData {
  title: string
  description: string
  files: File[]
}

function FormIntegration() {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    files: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFileSelect = (files: File[]) => {
    setFormData(prev => ({ ...prev, files }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Upload files first
      const uploadPromises = formData.files.map(async (file) => {
        // Your upload logic here
        return { name: file.name, url: 'uploaded-url' }
      })

      const uploadedFiles = await Promise.all(uploadPromises)

      // Submit form data
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          files: uploadedFiles
        })
      })

      if (response.ok) {
        alert('Form submitted successfully!')
        setFormData({ title: '', description: '', files: [] })
      }
    } catch (error) {
      console.error('Submission failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-3 py-2 border rounded-md"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Attachments</label>
        <FileUpload
          variant="dropzone"
          onFileSelect={handleFileSelect}
          multiple
          maxFiles={5}
          className="min-h-[120px]"
        />
        {formData.files.length > 0 && (
          <p className="text-sm text-gray-600 mt-1">
            {formData.files.length} file(s) selected
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !formData.title}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  )
}
```

### Error Handling

```tsx
import { FileUpload } from 'file-upload-component-library'
import { useState } from 'react'

function ErrorHandlingExample() {
  const [errors, setErrors] = useState<string[]>([])
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')

  const handleUpload = async (files: File[]) => {
    setErrors([])
    setUploadStatus('uploading')

    try {
      // Validate files before upload
      const validationErrors: string[] = []
      
      files.forEach(file => {
        if (file.size > 10 * 1024 * 1024) {
          validationErrors.push(`${file.name} is too large (max 10MB)`)
        }
        if (!file.type.startsWith('image/')) {
          validationErrors.push(`${file.name} is not an image file`)
        }
      })

      if (validationErrors.length > 0) {
        setErrors(validationErrors)
        setUploadStatus('error')
        return
      }

      // Simulate upload with potential failure
      for (const file of files) {
        // Random failure simulation
        if (Math.random() < 0.3) {
          throw new Error(`Failed to upload ${file.name}`)
        }
        
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      setUploadStatus('success')
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Upload failed'])
      setUploadStatus('error')
    }
  }

  const handleError = (error: string) => {
    setErrors(prev => [...prev, error])
    setUploadStatus('error')
  }

  const clearErrors = () => {
    setErrors([])
    setUploadStatus('idle')
  }

  return (
    <div className="space-y-4">
      <FileUpload
        variant="dropzone"
        onUpload={handleUpload}
        onError={handleError}
        multiple
        accept="image/*"
        maxSize={10 * 1024 * 1024}
        className="min-h-[200px]"
      />

      {/* Status Display */}
      {uploadStatus === 'uploading' && (
        <div className="text-blue-600">Uploading files...</div>
      )}

      {uploadStatus === 'success' && (
        <div className="text-green-600">All files uploaded successfully!</div>
      )}

      {/* Error Display */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-red-800 font-medium">Upload Errors</h4>
              <ul className="text-red-700 text-sm mt-1 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={clearErrors}
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
```

## Theming Examples

### Custom Theme

```tsx
import { FileUpload, ThemeProvider } from 'file-upload-component-library'

const customTheme = {
  colors: {
    primary: '#8b5cf6',
    secondary: '#64748b',
    success: '#059669',
    error: '#dc2626',
    background: '#ffffff',
    foreground: '#1f2937'
  },
  spacing: {
    padding: '1.5rem',
    margin: '0.75rem',
    gap: '0.75rem'
  }
}

function ThemedUpload() {
  const handleUpload = async (files: File[]) => {
    console.log('Uploading:', files)
  }

  return (
    <ThemeProvider theme="light">
      <FileUpload
        variant="dropzone"
        onUpload={handleUpload}
        config={{
          styling: customTheme
        }}
        className="min-h-[200px]"
      />
    </ThemeProvider>
  )
}
```

### Dark Mode

```tsx
import { FileUpload, ThemeProvider } from 'file-upload-component-library'
import { useState } from 'react'

function DarkModeUpload() {
  const [isDark, setIsDark] = useState(false)

  const handleUpload = async (files: File[]) => {
    console.log('Uploading:', files)
  }

  return (
    <ThemeProvider theme={isDark ? 'dark' : 'light'}>
      <div className={isDark ? 'dark bg-gray-900 p-6' : 'bg-white p-6'}>
        <button
          onClick={() => setIsDark(!isDark)}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Toggle {isDark ? 'Light' : 'Dark'} Mode
        </button>
        
        <FileUpload
          variant="dropzone"
          onUpload={handleUpload}
          theme={isDark ? 'dark' : 'light'}
          multiple
          className="min-h-[200px]"
        />
      </div>
    </ThemeProvider>
  )
}
```

These examples demonstrate the flexibility and power of the File Upload Component Library. You can mix and match features, customize styling, and integrate with your existing applications seamlessly.