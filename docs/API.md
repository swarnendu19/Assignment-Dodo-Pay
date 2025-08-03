# API Reference

## Components

### FileUpload

The main file upload component with support for multiple variants and extensive customization options.

```tsx
import { FileUpload } from 'file-upload-component-library'
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'button' \| 'dropzone' \| 'preview' \| 'image-only' \| 'multi-file'` | `'button'` | Upload variant to render |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Component size |
| `radius` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'full'` | `'md'` | Border radius |
| `disabled` | `boolean` | `false` | Disable the component |
| `multiple` | `boolean` | `false` | Allow multiple file selection |
| `accept` | `string` | `'*'` | Accepted file types (MIME types or extensions) |
| `maxSize` | `number` | `10485760` | Maximum file size in bytes (10MB default) |
| `maxFiles` | `number` | `5` | Maximum number of files |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Theme mode |
| `className` | `string` | - | Additional CSS classes |
| `style` | `React.CSSProperties` | - | Inline styles |
| `icon` | `ReactNode` | - | Custom icon |
| `iconPlacement` | `'left' \| 'right' \| 'top' \| 'bottom'` | `'left'` | Icon placement |
| `placeholder` | `string` | - | Placeholder text |
| `borderStyle` | `'solid' \| 'dashed' \| 'dotted' \| 'none'` | `'solid'` | Border style |
| `borderWidth` | `'thin' \| 'medium' \| 'thick'` | `'medium'` | Border width |
| `onUpload` | `(files: File[]) => Promise<void>` | - | Upload handler |
| `onError` | `(error: string) => void` | - | Error handler |
| `onProgress` | `(progress: number, file?: UploadFile) => void` | - | Progress handler |
| `onFileSelect` | `(files: File[]) => void` | - | File selection handler |
| `onFileRemove` | `(fileId: string) => void` | - | File removal handler |
| `onDragEnter` | `(event: React.DragEvent) => void` | - | Drag enter handler |
| `onDragLeave` | `(event: React.DragEvent) => void` | - | Drag leave handler |
| `onDragOver` | `(event: React.DragEvent) => void` | - | Drag over handler |
| `onDrop` | `(event: React.DragEvent) => void` | - | Drop handler |
| `config` | `FileUploadConfig \| string` | - | Configuration object or JSON file path |
| `ariaLabel` | `string` | - | ARIA label for accessibility |
| `ariaDescribedBy` | `string` | - | ARIA described-by for accessibility |
| `children` | `ReactNode` | - | Custom content |

#### Examples

**Basic Usage**
```tsx
<FileUpload
  onUpload={async (files) => {
    console.log('Uploading:', files)
  }}
/>
```

**Dropzone with Multiple Files**
```tsx
<FileUpload
  variant="dropzone"
  multiple
  maxFiles={10}
  accept="image/*"
  onUpload={handleUpload}
  onError={(error) => console.error(error)}
/>
```

**Custom Styling**
```tsx
<FileUpload
  variant="button"
  size="lg"
  radius="full"
  theme="dark"
  className="custom-upload"
  icon={<UploadIcon />}
  iconPlacement="top"
/>
```

### ThemeProvider

Provides theme context to child components.

```tsx
import { ThemeProvider } from 'file-upload-component-library'
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Theme mode |
| `children` | `ReactNode` | - | Child components |

#### Example

```tsx
<ThemeProvider theme="dark">
  <App />
</ThemeProvider>
```

## Types

### FileUploadConfig

Complete configuration interface for the file upload component.

```tsx
interface FileUploadConfig {
  defaults: {
    variant: FileUploadVariant
    size: FileUploadSize
    radius: FileUploadRadius
    theme: FileUploadTheme
    multiple: boolean
    disabled: boolean
    accept: string
    maxSize: number
    maxFiles: number
  }
  validation: {
    maxSize: number
    maxFiles: number
    allowedTypes: string[]
    allowedExtensions: string[]
    minSize?: number
    validateDimensions?: boolean
    maxWidth?: number
    maxHeight?: number
    minWidth?: number
    minHeight?: number
  }
  styling: {
    theme: FileUploadTheme
    colors: {
      primary: string
      secondary: string
      success: string
      error: string
      warning: string
      background: string
      foreground: string
      border: string
      muted: string
    }
    spacing: {
      padding: string
      margin: string
      gap: string
      borderRadius: string
    }
    typography: {
      fontSize: string
      fontWeight: string
      lineHeight: string
    }
    borders: {
      width: string
      style: 'solid' | 'dashed' | 'dotted' | 'none'
      color: string
    }
    shadows: {
      sm: string
      md: string
      lg: string
    }
  }
  labels: {
    uploadText: string
    dragText: string
    dropText: string
    browseText: string
    errorText: string
    successText: string
    progressText: string
    removeText: string
    retryText: string
    cancelText: string
    selectFilesText: string
    maxSizeText: string
    invalidTypeText: string
    tooManyFilesText: string
  }
  features: {
    dragAndDrop: boolean
    preview: boolean
    progress: boolean
    multipleFiles: boolean
    removeFiles: boolean
    retryFailed: boolean
    showFileSize: boolean
    showFileType: boolean
    autoUpload: boolean
    chunkedUpload: boolean
    resumableUpload: boolean
  }
  animations: {
    enabled: boolean
    duration: number
    easing: string
  }
  accessibility: {
    announceFileSelection: boolean
    announceProgress: boolean
    announceErrors: boolean
    keyboardNavigation: boolean
    focusManagement: boolean
  }
}
```

### UploadFile

Represents a file in the upload process.

```tsx
interface UploadFile {
  id: string
  file: File
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  preview?: string
  error?: string
  uploadedAt?: Date
  startedAt?: Date
  completedAt?: Date
  size: number
  type: string
  name: string
  lastModified: number
  url?: string
  thumbnailUrl?: string
  metadata?: FileMetadata
  chunks?: FileChunk[]
  retryCount: number
  maxRetries: number
}
```

### FileUploadState

Component state interface.

```tsx
interface FileUploadState {
  files: UploadFile[]
  isUploading: boolean
  progress: number
  overallProgress: number
  error: string | null
  isDragOver: boolean
  isDropValid: boolean
  selectedFiles: File[]
  rejectedFiles: RejectedFile[]
  uploadQueue: string[]
  completedUploads: string[]
  failedUploads: string[]
}
```

### RejectedFile

Represents a file that failed validation.

```tsx
interface RejectedFile {
  file: File
  errors: FileError[]
}

interface FileError {
  code: string
  message: string
  type: 'size' | 'type' | 'count' | 'dimensions' | 'network' | 'validation'
}
```

## Utilities

### Configuration

#### validateConfig

Validates a configuration object against the schema.

```tsx
import { validateConfig } from 'file-upload-component-library'

const result = validateConfig(config)
if (!result.isValid) {
  console.error('Configuration errors:', result.errors)
}
```

#### mergeConfig

Merges user configuration with default configuration.

```tsx
import { mergeConfig, defaultConfig } from 'file-upload-component-library'

const userConfig = { defaults: { variant: 'dropzone' } }
const finalConfig = mergeConfig(userConfig)
```

#### loadConfigFromJSON

Loads and validates configuration from JSON string.

```tsx
import { loadConfigFromJSON } from 'file-upload-component-library'

const jsonString = '{"defaults": {"variant": "dropzone"}}'
const { config, errors } = loadConfigFromJSON(jsonString)
```

### Theme Utilities

#### generateThemeClasses

Generates CSS classes for theme variables.

```tsx
import { generateThemeClasses } from 'file-upload-component-library'

const classes = generateThemeClasses({
  colors: { primary: '#3b82f6' },
  spacing: { padding: '1rem' }
})
```

#### applyTheme

Applies theme variables to the document.

```tsx
import { applyTheme } from 'file-upload-component-library'

applyTheme({
  colors: { primary: '#8b5cf6' },
  spacing: { padding: '1.5rem' }
})
```

#### getSystemTheme

Gets the system's preferred theme.

```tsx
import { getSystemTheme } from 'file-upload-component-library'

const systemTheme = getSystemTheme() // 'light' | 'dark'
```

### Hooks

#### useTheme

Hook for accessing theme context.

```tsx
import { useTheme } from 'file-upload-component-library'

function MyComponent() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Current theme: {resolvedTheme}
    </button>
  )
}
```

#### useThemeVariables

Hook for accessing theme CSS variables.

```tsx
import { useThemeVariables } from 'file-upload-component-library'

function MyComponent() {
  const variables = useThemeVariables()
  
  return (
    <div style={{ color: variables.colors.primary }}>
      Themed content
    </div>
  )
}
```

## Events

### File Upload Events

The component emits various events during the upload process:

```tsx
interface FileUploadEvent {
  type: 'select' | 'upload' | 'progress' | 'success' | 'error' | 'remove' | 'retry'
  files: UploadFile[]
  timestamp: Date
  metadata?: Record<string, any>
}
```

### Event Handlers

```tsx
interface FileUploadEventHandlers {
  onFileSelect?: (event: FileUploadEvent) => void
  onUploadStart?: (event: FileUploadEvent) => void
  onUploadProgress?: (event: FileUploadEvent) => void
  onUploadSuccess?: (event: FileUploadEvent) => void
  onUploadError?: (event: FileUploadEvent) => void
  onFileRemove?: (event: FileUploadEvent) => void
  onUploadRetry?: (event: FileUploadEvent) => void
}
```

## Error Handling

### Validation Errors

The component provides detailed validation error information:

```tsx
interface FileValidationResult {
  isValid: boolean
  errors: FileError[]
  warnings: string[]
}

interface BatchValidationResult {
  validFiles: File[]
  rejectedFiles: RejectedFile[]
  totalSize: number
  warnings: string[]
}
```

### Error Recovery

```tsx
<FileUpload
  onError={(error) => {
    // Handle upload errors
    console.error('Upload failed:', error)
    
    // Show user-friendly message
    toast.error('Upload failed. Please try again.')
  }}
  onUpload={async (files) => {
    try {
      await uploadFiles(files)
    } catch (error) {
      // Error will be passed to onError handler
      throw error
    }
  }}
/>
```

## Accessibility

### ARIA Attributes

The component automatically sets appropriate ARIA attributes:

- `role="button"` for button variant
- `aria-label` for screen reader descriptions
- `aria-describedby` for additional context
- `aria-live` regions for status updates
- `aria-expanded` for dropzone states

### Keyboard Navigation

- **Tab**: Navigate between interactive elements
- **Enter/Space**: Activate file selection
- **Escape**: Cancel operations or close dialogs
- **Arrow Keys**: Navigate through file lists

### Screen Reader Support

The component announces:
- File selection events
- Upload progress updates
- Success and error states
- Validation messages

```tsx
<FileUpload
  ariaLabel="Upload your profile picture"
  ariaDescribedBy="upload-instructions"
  onUpload={handleUpload}
/>
<div id="upload-instructions">
  Choose a JPG or PNG file up to 2MB in size.
</div>
```